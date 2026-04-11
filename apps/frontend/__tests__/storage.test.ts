import { storage, saveItem, loadItem, removeItem, appendToItemArray, removeFromItemArray, StorageKeys } from '../utils/storage';

/**
 * storage 유틸리티 테스트 스위트
 * 
 * 목적: react-native-mmkv 기반의 로컬 저장소 CRUD 로직을 검증합니다.
 * 객체 및 배열 데이터를 JSON 문자열로 변환하여 저장하고, 다시 객체로 복원하는 과정을 테스트합니다.
 */
describe('storage utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should save string item correctly', () => {
    saveItem(StorageKeys.ACCESS_TOKEN, 'test-token');
    expect(storage.set).toHaveBeenCalledWith(StorageKeys.ACCESS_TOKEN, 'test-token');
  });

  test('should save object item as JSON string', () => {
    const user = { id: 1, name: 'John' };
    saveItem(StorageKeys.USER_INFO, user);
    expect(storage.set).toHaveBeenCalledWith(StorageKeys.USER_INFO, JSON.stringify(user));
  });

  test('should load item correctly', () => {
    (storage.getString as jest.Mock).mockReturnValue('test-value');
    const result = loadItem<string>(StorageKeys.ACCESS_TOKEN);
    expect(result).toBe('test-value');
    expect(storage.getString).toHaveBeenCalledWith(StorageKeys.ACCESS_TOKEN);
  });

  test('should load and parse JSON item', () => {
    const user = { id: 1, name: 'John' };
    (storage.getString as jest.Mock).mockReturnValue(JSON.stringify(user));
    const result = loadItem<typeof user>(StorageKeys.USER_INFO);
    expect(result).toEqual(user);
  });

  test('should return null if item not found', () => {
    (storage.getString as jest.Mock).mockReturnValue(undefined);
    const result = loadItem(StorageKeys.ACCESS_TOKEN);
    expect(result).toBeNull();
  });

  test('should remove item', () => {
    removeItem(StorageKeys.ACCESS_TOKEN);
    expect(storage.delete).toHaveBeenCalledWith(StorageKeys.ACCESS_TOKEN);
  });

  test('should append item to array', () => {
    const currentItems = [1, 2];
    (storage.getString as jest.Mock).mockReturnValue(JSON.stringify(currentItems));
    
    appendToItemArray(StorageKeys.SAVED_NUMBERS, 3);
    
    expect(storage.set).toHaveBeenCalledWith(
      StorageKeys.SAVED_NUMBERS,
      JSON.stringify([3, 1, 2])
    );
  });

  test('should create new array if appending to non-existent item', () => {
    (storage.getString as jest.Mock).mockReturnValue(undefined);
    
    appendToItemArray(StorageKeys.SAVED_NUMBERS, 1);
    
    expect(storage.set).toHaveBeenCalledWith(
      StorageKeys.SAVED_NUMBERS,
      JSON.stringify([1])
    );
  });

  test('should remove item from array using filter function', () => {
    const currentItems = [{ id: 1 }, { id: 2 }];
    (storage.getString as jest.Mock).mockReturnValue(JSON.stringify(currentItems));
    
    removeFromItemArray<{ id: number }>(StorageKeys.SAVED_NUMBERS, item => item.id === 1);
    
    expect(storage.set).toHaveBeenCalledWith(
      StorageKeys.SAVED_NUMBERS,
      JSON.stringify([{ id: 2 }])
    );
  });
});
