import Router from '@koa/router';
import { ChildProcess, fork } from 'child_process';
import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import * as fs from 'fs';
import * as path from 'path';
import multiparty from 'multiparty';
import serverless from 'serverless-http';
import { preSign, traverseCourseActivity } from './functions/activity';
import { GeneralSign } from './functions/general';
import { LocationSign } from './functions/location';
import { PhotoSign, uploadPhoto } from './functions/photo';
import { QRCodeSign } from './functions/qrcode';
import { QrCodeScan } from './functions/tencent.qrcode';
import { getAccountInfo, getCourses, getPanToken, userLogin } from './functions/user';
import { getJsonObject } from './utils/file';
import { resolveStaticAssetPath } from './serve-boundary';
const ENVJSON = getJsonObject('env.json');

interface LoginBody {
  phone: string;
  password: string;
}

interface ActivityBody {
  uid: string;
  _d: string;
  vc3: string;
  uf: string;
}

interface QRCodeBody {
  name: string;
  fid: string;
  uid: string;
  activeId: string;
  uf: string;
  _d: string;
  vc3: string;
  enc: string;
  lat: string;
  lon: string;
  address: string;
  altitude: string;
}

interface LocationBody {
  uf: string;
  _d: string;
  vc3: string;
  name: string;
  uid: string;
  lat: string;
  lon: string;
  fid: string;
  address: string;
  activeId: string;
}

interface GeneralBody {
  uf: string;
  _d: string;
  vc3: string;
  name: string;
  activeId: string;
  uid: string;
  fid: string;
}

interface UvTokenBody {
  uf: string;
  _d: string;
  uid: string;
  vc3: string;
}

interface PhotoBody {
  uf: string;
  _d: string;
  uid: string;
  vc3: string;
  name: string;
  activeId: string;
  fid: string;
  objectId: string;
}

const app = new Koa();
const router = new Router();
type MonitorProcess = {
  process: ChildProcess;
  token: string;
  state: 'starting' | 'running';
};

const processMap = new Map<string, MonitorProcess>();
const WEB_ROOT = path.resolve(__dirname, '../../web/dist');
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const START_TIMEOUT_MS = 10_000;
const ALLOWED_LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const isAllowedOrigin = (origin: string, host: string) => {
  try {
    const originUrl = new URL(origin);
    const requestHost = host.split(':')[0];
    return originUrl.hostname === requestHost || ALLOWED_LOCAL_HOSTS.has(originUrl.hostname);
  } catch {
    return false;
  }
};

const getMonitorToken = (ctx: Koa.Context) => {
  const tokenFromHeader = ctx.get('X-Monitor-Token');
  if (tokenFromHeader) return tokenFromHeader;
  if (typeof ctx.query.monitorToken === 'string') return ctx.query.monitorToken;
  const body = ctx.request.body as Record<string, unknown> | undefined;
  if (body && typeof body.monitorToken === 'string') {
    return body.monitorToken;
  }
  return '';
};

const parseMonitorStartPayload = (rawBody: string) => {
  try {
    return JSON.parse(Buffer.from(rawBody, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

const requireFields = (body: Record<string, unknown>, fields: string[]): string | null => {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return field;
    }
  }
  return null;
};

const createUploadForm = () => {
  return new multiparty.Form({
    maxFilesSize: MAX_UPLOAD_BYTES,
    maxFieldsSize: 64 * 1024,
  });
};

// 全局错误处理（最外层，捕获所有下游中间件异常）
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`[${ctx.method} ${ctx.path}] ${error.message}`);
    ctx.status = ctx.status === 200 ? 500 : ctx.status;
    ctx.body = { code: ctx.status, msg: 'Internal Server Error' };
  }
});

// serve static web ui first
app.use(async (ctx, next) => {
  try {
    const fp = resolveStaticAssetPath(WEB_ROOT, ctx.path);
    if (fp && fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      ctx.type = path.extname(fp);
      ctx.body = fs.createReadStream(fp);
      return;
    }
  } catch { /* fall through to next middleware */ }
  await next();
});

router.get('/', async (ctx) => {
  const fp = path.join(WEB_ROOT, 'index.html');
  if (fs.existsSync(fp)) {
    ctx.type = 'html';
    ctx.body = fs.createReadStream(fp);
  } else {
    ctx.body = '<h1 style="text-align: center">Welcome, chaoxing-sign-cli API service is running.</h1>';
  }
});

router.post('/login', async (ctx) => {
  const body = ctx.request.body as Record<string, unknown>;
  const missing = requireFields(body, ['phone', 'password']);
  if (missing) {
    ctx.status = 400;
    ctx.body = { code: 400, msg: `Missing required field: ${missing}` };
    return;
  }
  const { phone, password } = body as { phone: string; password: string };
  const params = await userLogin(phone, password);
  // 登陆失败
  if (typeof params === 'string') {
    ctx.body = params;
    return;
  }
  params.name = (await getAccountInfo(params)) || '获取失败';
  ctx.body = params;
});

router.post('/activity', async (ctx) => {
  const body = ctx.request.body as Record<string, unknown>;
  const missing = requireFields(body, ['uid', '_d', 'vc3', 'uf']);
  if (missing) {
    ctx.status = 400;
    ctx.body = { code: 400, msg: `Missing required field: ${missing}` };
    return;
  }
  const { uid, _d, vc3, uf } = body as { uid: string; _d: string; vc3: string; uf: string };
  const courses = await getCourses(uid, _d, vc3);
  // 身份凭证过期
  if (typeof courses === 'string') {
    ctx.body = courses;
    return;
  }
  const activity = await traverseCourseActivity({
    courses,
    uf: uf,
    _d: _d,
    _uid: uid,
    vc3: vc3,
  });
  // 无活动
  if (typeof activity === 'string') {
    ctx.body = activity;
    return;
  }
  // 对活动进行预签
  await preSign({
    uf,
    _d,
    vc3,
    _uid: uid,
    ...activity,
  });
  ctx.body = activity;
});

router.post('/qrcode', async (ctx) => {
  const { name, fid, uid, activeId, uf, _d, vc3, enc, lat, lon, address, altitude } = ctx.request.body as QRCodeBody;
  const res = await QRCodeSign({
    enc,
    name,
    fid,
    _uid: uid,
    activeId,
    uf,
    _d,
    vc3,
    lat,
    lon,
    address,
    altitude
  });
  if (res === 'success') {
    ctx.body = 'success';
    return;
  } else {
    ctx.body = res;
  }
});

router.post('/location', async (ctx) => {
  const { uf, _d, vc3, name, uid, lat, lon, fid, address, activeId } = ctx.request.body as LocationBody;
  const res = await LocationSign({
    uf,
    _d,
    vc3,
    name,
    address,
    activeId,
    _uid: uid,
    lat,
    lon,
    fid,
  });
  if (res === 'success') {
    ctx.body = 'success';
    return;
  } else {
    ctx.body = res;
  }
});

router.post('/general', async (ctx) => {
  const { uf, _d, vc3, name, activeId, uid, fid } = ctx.request.body as GeneralBody;
  const res = await GeneralSign({
    uf,
    _d,
    vc3,
    name,
    activeId,
    _uid: uid,
    fid,
  });
  if (res === 'success') {
    ctx.body = 'success';
    return;
  } else {
    ctx.body = res;
  }
});

router.post('/uvtoken', async (ctx) => {
  const { uf, _d, uid, vc3 } = ctx.request.body as UvTokenBody;
  const res = await getPanToken({
    uf,
    _d,
    _uid: uid,
    vc3,
  });
  ctx.body = JSON.parse(res); // 获得的是个JSON字符串，需转换
});

router.post('/upload', async (ctx) => {
  const form = createUploadForm();
  const fields: any = {};
  const data: any[] = [];

  try {
    const result = await new Promise((resolve, reject) => {
      form.on('error', reject);
      // 解析到part时，判断是否为文件
      form.on('part', (part: any) => {
        if (part.filename !== undefined) {
          // 存入data数组
          part.on('data', (chunk: any) => {
            data.push(chunk);
          });
          // 存完继续
          part.on('close', () => {
            part.resume();
          });
        }
      });
      // 解析遇到文本时
      form.on('field', (name: string, str: string) => {
        fields[name] = str;
      });
      // 解析完成后
      form.on('close', async () => {
        try {
          const token = ctx.query._token as string | undefined;
          if (!token) {
            reject(new Error('Missing upload token'));
            return;
          }
          const buffer = Buffer.concat(data);
          const res = await uploadPhoto({
            uf: fields['uf'],
            _d: fields['_d'],
            _uid: fields['_uid'],
            vc3: fields['vc3'],
            token,
            buffer,
          });
          resolve(res);
        } catch (error) {
          reject(error);
        }
      });
      // 解析请求表单
      form.parse(ctx.req);
    });
    ctx.body = result;
  } catch (error: any) {
    ctx.status = error?.message === 'Missing upload token' ? 400 : 413;
    ctx.body = 'UploadFailed';
  }
});

router.post('/photo', async (ctx) => {
  const { uf, _d, uid, vc3, name, activeId, fid, objectId } = ctx.request.body as PhotoBody;
  const res = await PhotoSign({
    uf,
    _d,
    vc3,
    name,
    activeId,
    _uid: uid,
    fid,
    objectId,
  });
  if (res === 'success') {
    ctx.body = 'success';
    return;
  } else {
    ctx.body = res;
  }
});

router.post('/qrocr', async (ctx) => {
  const form = createUploadForm();
  const data: any[] = [];
  try {
    const result = await new Promise((resolve, reject) => {
      form.on('error', reject);
      form.on('part', (part: any) => {
        if (part.filename !== undefined) {
          part.on('data', (chunk: any) => {
            data.push(chunk);
          });
          part.on('close', () => {
            part.resume();
          });
        }
      });
      form.on('close', async () => {
        const buffer = Buffer.concat(data);
        const base64str = buffer.toString('base64');
        let res: any;
        try {
          res = await QrCodeScan(base64str, 'base64');
          const url = res.CodeResults[0].Url;
          const enc_start = url.indexOf('enc=') + 4;
          const result = url.substring(enc_start, url.indexOf('&', enc_start));
          resolve(result);
        } catch (error) {
          resolve('识别失败');
        }
      });
      form.parse(ctx.req);
    });
    ctx.body = result;
  } catch (error) {
    console.error('[qrocr] 解析失败:', error instanceof Error ? error.message : error);
    ctx.status = 413;
    ctx.body = '识别失败';
  }
});

// 200:监听中，201:未监听，202:登录失败
router.get('/monitor/status/:phone', (ctx) => {
  const entry = processMap.get(ctx.params.phone);
  if (!entry) {
    ctx.body = { code: 201, msg: 'Suspended' };
    return;
  }
  if (entry.token !== getMonitorToken(ctx)) {
    ctx.status = 403;
    ctx.body = { code: 403, msg: 'Forbidden' };
    return;
  }
  ctx.body = entry.state === 'running'
    ? { code: 200, msg: 'Monitoring' }
    : { code: 201, msg: 'Starting' };
});

router.post('/monitor/stop/:phone', (ctx) => {
  const phone = ctx.params.phone;
  const monitorProcess = processMap.get(phone);
  if (monitorProcess !== undefined) {
    if (monitorProcess.token !== getMonitorToken(ctx)) {
      ctx.status = 403;
      ctx.body = { code: 403, msg: 'Forbidden' };
      return;
    }
    monitorProcess.process.kill('SIGKILL');
    processMap.delete(phone);
  }
  ctx.body = { code: 201, msg: 'Suspended' };
});

// base64字串需包含 credentials, monitor, mailing, cqserver 内容
router.post('/monitor/start/:phone', async (ctx) => {
  const rawBody = (ctx.request as typeof ctx.request & { rawBody?: string }).rawBody || '';
  const authConfig = typeof rawBody === 'string' ? parseMonitorStartPayload(rawBody) : null;
  const monitorToken = authConfig?.monitorToken;
  const existingMonitor = processMap.get(ctx.params.phone);
  if (existingMonitor !== undefined) {
    if (existingMonitor.token !== monitorToken) {
      ctx.status = 403;
      ctx.body = { code: 403, msg: 'Forbidden' };
      return;
    }
    ctx.body = { code: 200, msg: 'Already started' };
    return;
  }
  if (!monitorToken) {
    ctx.status = 400;
    ctx.body = { code: 400, msg: 'Missing monitor token' };
    return;
  }
  const process_monitor = fork(process.argv[1].endsWith('ts') ? 'monitor.ts' : 'monitor.js',
    ['--auth', ctx.params.phone, rawBody],
    {
      cwd: __dirname,
      detached: false,
      stdio: [null, null, null, 'ipc'],
    }
  );
  processMap.set(ctx.params.phone, {
    process: process_monitor,
    token: monitorToken,
    state: 'starting',
  });
  const response = await new Promise((resolve) => {
    const cleanup = (shouldDelete = false) => {
      process_monitor.off('message', handleMessage);
      process_monitor.off('error', handleError);
      process_monitor.off('exit', handleExit);
      clearTimeout(timeoutId);
      if (shouldDelete) processMap.delete(ctx.params.phone);
    };
    const handleMessage = (msg: any) => {
      switch (msg) {
        case 'success': {
          const existing = processMap.get(ctx.params.phone);
          if (existing) existing.state = 'running';
          cleanup();
          resolve({ code: 200, msg: 'Started Successfully' });
          break;
        }
        case 'authfail': {
          cleanup(true);
          resolve({ code: 202, msg: 'Authencation Failed' });
          break;
        }
        case 'notconfigured': {
          cleanup(true);
          resolve({ code: 203, msg: 'Not Configured' });
          break;
        }
      }
    };
    const handleError = () => {
      cleanup(true);
      resolve({ code: 500, msg: 'Monitor Start Failed' });
    };
    const handleExit = () => {
      cleanup(true);
      resolve({ code: 500, msg: 'Monitor Start Failed' });
    };
    const timeoutId = setTimeout(() => {
      process_monitor.kill('SIGKILL');
      cleanup(true);
      resolve({ code: 504, msg: 'Monitor Start Timeout' });
    }, START_TIMEOUT_MS);

    process_monitor.on('message', handleMessage);
    process_monitor.once('error', handleError);
    process_monitor.once('exit', handleExit);
  });
  ctx.body = response;
});

app.use(bodyparser({ enableTypes: ['json', 'form', 'text'] }));
app.use(async (ctx, next) => {
  const origin = ctx.get('Origin');
  if (origin) {
    if (!isAllowedOrigin(origin, ctx.host)) {
      ctx.status = 403;
      ctx.body = { code: 403, msg: 'Forbidden Origin' };
      return;
    }
    ctx.set('Access-Control-Allow-Origin', origin);
    ctx.set('Vary', 'Origin');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, X-Monitor-Token');
    ctx.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  }
  if (ctx.method === 'OPTIONS') {
    ctx.set('Access-Control-Max-Age', '300');
    ctx.status = 204;
    return;
  }
  await next();
});
app.use(router.routes());

// SPA fallback: for non-API GET 404, return index.html if present
app.use(async (ctx, next) => {
  await next();
  if (ctx.status === 404 && ctx.method === 'GET') {
    const fp = path.join(WEB_ROOT, 'index.html');
    if (fs.existsSync(fp)) {
      ctx.status = 200;
      ctx.type = 'html';
      ctx.body = fs.createReadStream(fp);
    }
  }
});

// Ctrl + C 终止程序
process.on('SIGINT', () => {
  processMap.forEach((monitorProcess) => {
    monitorProcess.process.kill('SIGINT');
  });
  process.exit();
});

// 若在服务器，直接运行
if (!ENVJSON.env.SERVERLESS)
  app.listen(5000, () => {
    console.log('API Server: http://localhost:5000');
  });

// 导出云函数
export const main = serverless(app);
export const handler = main;
export const main_handler = main;
