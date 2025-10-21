import Cookies from 'js-cookie';

const Storage = {
  setCookie(key: string, value: string, days: number = 7) {
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1');

    Cookies.set(key, value, {
      expires: days,
      secure: !isLocalhost,
      sameSite: 'lax',
      path: '/',
    });
  },

  getCookie(key: string) {
    return Cookies.get(key);
  },

  removeCookie(key: string) {
    return Cookies.remove(key, { path: '/' });
  },
};

export default Storage;
