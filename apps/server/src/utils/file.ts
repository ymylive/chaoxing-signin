import filehandle from 'fs';
import path from 'path';

interface LocalData {
  users: User[];
}

const BUNDLED_STORAGE_PATH = path.join(__dirname, '../configs/storage.json');

const ensureStorageFile = () => {
  const dataDir = process.env.CHAOXING_DATA_DIR;
  if (!dataDir) return BUNDLED_STORAGE_PATH;

  const storagePath = path.join(dataDir, 'configs', 'storage.json');
  if (!filehandle.existsSync(storagePath)) {
    filehandle.mkdirSync(path.dirname(storagePath), { recursive: true });
    filehandle.copyFileSync(BUNDLED_STORAGE_PATH, storagePath);
  }

  return storagePath;
};

export const getJsonFilePath = (fileURL: string) => {
  if (fileURL === 'configs/storage.json') {
    return ensureStorageFile();
  }

  return path.join(__dirname, '../' + fileURL);
};

/**
 * 储存用户凭证
 */
export const storeUser = (phone: string, user: User): User[] => {
  const data: LocalData = getJsonObject('configs/storage.json');
  let i = 0;
  user.phone = phone;

  // 存了则替换
  for (; i < data.users.length; i++) {
    if (data.users[i].phone === phone) {
      data.users[i] = user;
      break;
    }
  }
  // 未存则push
  if (i === data.users.length) {
    data.users.push(user);
  }
  filehandle.writeFileSync(getJsonFilePath('configs/storage.json'), JSON.stringify(data), 'utf8');
  return data.users;
};

export const getStoredUser = (phone: string): User | null => {
  const data: User[] = getJsonObject('configs/storage.json').users;
  for (let i = 0; i < data.length; i++) {
    if (data[i].phone === phone) {
      return JSON.parse(JSON.stringify(data[i]));
    }
  }
  return null;
};

export const getJsonObject = (fileURL: string) => {
  return JSON.parse(filehandle.readFileSync(getJsonFilePath(fileURL), 'utf8'));
};
