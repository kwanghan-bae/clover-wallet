const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export const Logger = {
  error: (tag: string, message: string, error?: unknown) => {
    if (isDev) {
      console.error(`[${tag}]`, message, error); // eslint-disable-line no-console
    }
  },
  warn: (tag: string, message: string) => {
    if (isDev) {
      console.warn(`[${tag}]`, message); // eslint-disable-line no-console
    }
  },
  info: (tag: string, message: string) => {
    if (isDev) {
      console.log(`[${tag}]`, message); // eslint-disable-line no-console
    }
  },
};
