export const StorageKeys = {
  ACCESS_TOKEN: 'auth.access_token',
  USER_INFO: 'user.profile',
  APP_THEME: 'app.theme',
  SAVED_NUMBERS: 'lotto.saved_numbers',
};

// Web Mock for MMKV
const storage = {
  set: (key: string, value: string | boolean | number | Uint8Array) => {
    localStorage.setItem(key, value.toString());
  },
  getString: (key: string) => {
    return localStorage.getItem(key);
  },
  delete: (key: string) => {
    localStorage.removeItem(key);
  },
  contains: (key: string) => {
    return localStorage.getItem(key) !== null;
  }
};

export const saveItem = (key: string, value: any) => {
  if (typeof value === 'object') {
    storage.set(key, JSON.stringify(value));
  } else {
    storage.set(key, value);
  }
};

export const loadItem = <T>(key: string): T | null => {
  const value = storage.getString(key);
  if (!value) return null;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
};

export const removeItem = (key: string) => {
  storage.delete(key);
};

export const appendToItemArray = <T>(key: string, newItem: T) => {
  const current = loadItem<T[]>(key) || [];
  saveItem(key, [newItem, ...current]);
};

export const removeFromItemArray = <T>(key: string, filterFn: (item: T) => boolean) => {
  const current = loadItem<T[]>(key) || [];
  const updated = current.filter(item => !filterFn(item));
  saveItem(key, updated);
};
