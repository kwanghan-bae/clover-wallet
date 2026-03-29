/**
 * MMKV 인스턴스 생성
 * TypeScript가 MMKV를 오직 타입으로만 인지하는 문제를 해결하기 위해 require를 사용하여 값을 로드합니다.
 */
const { MMKV } = require('react-native-mmkv');
/** 로컬 저장소를 관리하는 MMKV 인스턴스입니다. */
export const storage = new MMKV();

/** 애플리케이션에서 사용하는 로컬 저장소 키 모음입니다. */
export const StorageKeys = {
  ACCESS_TOKEN: 'auth.access_token',
  USER_INFO: 'user.profile',
  APP_THEME: 'app.theme',
  SAVED_NUMBERS: 'lotto.saved_numbers',
};

/**
 * 주어진 키로 데이터를 로컬 저장소에 저장합니다.
 * 객체 타입인 경우 JSON 문자열로 변환하여 저장합니다.
 */
export const saveItem = (key: string, value: any) => {
  if (typeof value === 'object') {
    storage.set(key, JSON.stringify(value));
  } else {
    storage.set(key, value);
  }
};

/**
 * 주어진 키에 해당하는 데이터를 로컬 저장소에서 불러옵니다.
 * JSON 형식이면 파싱하여 반환하고, 아니면 원시 문자열로 반환합니다.
 */
export const loadItem = <T>(key: string): T | null => {
  const value = storage.getString(key);
  if (!value) return null;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
};

/**
 * 주어진 키에 해당하는 데이터를 로컬 저장소에서 삭제합니다.
 */
export const removeItem = (key: string) => {
  storage.delete(key);
};

/**
 * 특정 키의 배열 데이터에 새로운 항목을 추가합니다.
 * 최신 항목이 배열의 맨 앞에 위치하도록 저장됩니다.
 */
export const appendToItemArray = <T>(key: string, newItem: T) => {
  const current = loadItem<T[]>(key) || [];
  saveItem(key, [newItem, ...current]);
};

/**
 * 특정 키의 배열 데이터에서 조건에 맞는 항목을 삭제합니다.
 * filterFn이 true를 반환하는 항목이 배열에서 제거됩니다.
 */
export const removeFromItemArray = <T>(key: string, filterFn: (item: T) => boolean) => {
  const current = loadItem<T[]>(key) || [];
  const updated = current.filter(item => !filterFn(item));
  saveItem(key, updated);
};
