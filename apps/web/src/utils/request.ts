type FetchType = (url: string, params?: FetchParams) => Promise<any>;
type FetchParams = {
  headers?: {
    [index: string]: any;
  };
  method?: 'POST' | 'GET';
  body?: any;
  type?: 'json' | 'text';
};

export const fetch: FetchType = (url, params = {}) => {
  const requestParams = { ...params };
  !requestParams.type && (requestParams.type = 'json');
  !requestParams.method && (requestParams.method = 'GET');
  !requestParams.headers && (requestParams.headers = {});

  if (
    !requestParams.headers['Content-Type'] &&
    Object.prototype.toString.call(requestParams.body) === '[object Object]'
  ) {
    requestParams.headers['Content-Type'] = 'application/json';
    requestParams.body = JSON.stringify(requestParams.body);
  }

  return new Promise((resolve, reject) => {
    globalThis.fetch(url, { ...requestParams }).then(async (res) => {
      const contentType = res.headers.get('Content-Type') || '';

      if (requestParams.type === 'text') return res.text();
      if (requestParams.type === 'json') {
        if (contentType.includes('application/json')) return res.json();

        const text = await res.text();
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }

      if (contentType.includes('application/json')) return res.json();
      return res.text();
    }).then(val => {
      resolve(val);
    }).catch((error) => {
      reject(error);
    });
  });
};
