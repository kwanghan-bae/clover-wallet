/**
 * MMKV 인스턴스 생성
 * TypeScript가 MMKV를 오직 타입으로만 인지하는 문제를 해결하기 위해 require를 사용하여 값을 로드합니다.
 */
const { MMKV } = require('react-native-mmkv');
export const storage = new MMKV();

export const StorageKeys = {
  ACCESS_TOKEN: 'auth.access_token',
  USER_INFO: 'user.profile',
  APP_THEME: 'app.theme',
  SAVED_NUMBERS: 'lotto.saved_numbers',
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
