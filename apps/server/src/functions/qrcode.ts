import { PPTSIGN } from '../configs/api';
import { cookieSerialize, request } from '../utils/request';

export const QRCodeSign = async (args: BasicCookie & { enc: string; name: string; fid: string; activeId: string; address: string; lat: string; lon: string; altitude: string; }) => {
  const { enc, name, fid, activeId, lat, lon, address, altitude, ...cookies } = args;
  const locationJson = JSON.stringify({
    result: '1',
    address,
    latitude: Number(lat),
    longitude: Number(lon),
    altitude: Number(altitude),
  });
  const params = new URLSearchParams({
    enc,
    name,
    activeId,
    uid: cookies._uid,
    clientip: '',
    location: locationJson,
    latitude: '-1',
    longitude: '-1',
    fid,
    appType: '15',
  });
  const url = `${PPTSIGN.URL}?${params.toString()}`;
  const result = await request(url, {
    headers: {
      Cookie: cookieSerialize(cookies),
    },
  });
  const msg = result.data === 'success' ? '[二维码]签到成功' : `[二维码]${result.data}`;
  console.log(msg);

  return msg;
};