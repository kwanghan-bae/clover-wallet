import { saveItem, loadItem, removeItem, appendToItemArray, removeFromItemArray, StorageKeys } from '../utils/storage.web';

/**
 * storage.web 유틸리티 테스트 스위트
 * 
 * 목적: 웹 환경의 localStorage 기반 저장소 CRUD 로직을 검증합니다.
 * 객체 데이터를 JSON 문자열로 변환하여 저장하고, 배열 데이터를 관리하는 과정을 테스트합니다.
 */
describe('storage.web utility', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // Mock localStorage for node environment
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  })();

  Object.defineProperty(global, 'localStorage', { value: localStorageMock });

  test('should save string item correctly', () => {
    saveItem(StorageKeys.ACCESS_TOKEN, 'test-token');
    expect(localStorage.getItem(StorageKeys.ACCESS_TOKEN)).toBe('test-token');
  });

  test('should save object item as JSON string', () => {
    const user = { id: 1, name: 'John' };
    saveItem(StorageKeys.USER_INFO, user);
    expect(localStorage.getItem(StorageKeys.USER_INFO)).toBe(JSON.stringify(user));
  });

  test('should load item correctly', () => {
    localStorage.setItem(StorageKeys.ACCESS_TOKEN, 'test-value');
    const result = loadItem<string>(StorageKeys.ACCESS_TOKEN);
    expect(result).toBe('test-value');
  });

  test('should load and parse JSON item', () => {
    const user = { id: 1, name: 'John' };
    localStorage.setItem(StorageKeys.USER_INFO, JSON.stringify(user));
    const result = loadItem<typeof user>(StorageKeys.USER_INFO);
    expect(result).toEqual(user);
  });

  test('should return null if item not found', () => {
    const result = loadItem(StorageKeys.ACCESS_TOKEN);
    expect(result).toBeNull();
  });

  test('should remove item', () => {
    localStorage.setItem(StorageKeys.ACCESS_TOKEN, 'val');
    removeItem(StorageKeys.ACCESS_TOKEN);
    expect(localStorage.getItem(StorageKeys.ACCESS_TOKEN)).toBeNull();
  });

  test('should append item to array', () => {
    const currentItems = [1, 2];
    localStorage.setItem(StorageKeys.SAVED_NUMBERS, JSON.stringify(currentItems));
    
    appendToItemArray(StorageKeys.SAVED_NUMBERS, 3);
    
    expect(localStorage.getItem(StorageKeys.SAVED_NUMBERS)).toBe(JSON.stringify([3, 1, 2]));
  });

  test('should remove item from array using filter function', () => {
    const currentItems = [{ id: 1 }, { id: 2 }];
    localStorage.setItem(StorageKeys.SAVED_NUMBERS, JSON.stringify(currentItems));
    
    removeFromItemArray<{ id: number }>(StorageKeys.SAVED_NUMBERS, item => item.id === 1);
    
    expect(localStorage.getItem(StorageKeys.SAVED_NUMBERS)).toBe(JSON.stringify([{ id: 2 }]));
  });
});
