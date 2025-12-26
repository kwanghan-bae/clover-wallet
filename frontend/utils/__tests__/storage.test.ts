import { saveItem, loadItem, removeItem, appendToItemArray, removeFromItemArray, StorageKeys, storage } from '../storage';

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      getString: jest.fn(),
      delete: jest.fn(),
    })),
  };
});

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('saveItem should save string', () => {
    saveItem('key', 'value');
    expect(storage.set).toHaveBeenCalledWith('key', 'value');
  });

  test('saveItem should save object as string', () => {
    const obj = { foo: 'bar' };
    saveItem('key', obj);
    expect(storage.set).toHaveBeenCalledWith('key', JSON.stringify(obj));
  });

  test('loadItem should return null if key not found', () => {
    (storage.getString as jest.Mock).mockReturnValue(undefined);
    expect(loadItem('key')).toBeNull();
  });

  test('loadItem should return string', () => {
    (storage.getString as jest.Mock).mockReturnValue('value');
    expect(loadItem<string>('key')).toBe('value');
  });

  test('loadItem should return parsed object', () => {
    const obj = { foo: 'bar' };
    (storage.getString as jest.Mock).mockReturnValue(JSON.stringify(obj));
    expect(loadItem<{ foo: string }>('key')).toEqual(obj);
  });

  test('removeItem should delete key', () => {
    removeItem('key');
    expect(storage.delete).toHaveBeenCalledWith('key');
  });

  test('appendToItemArray should append item', () => {
    (storage.getString as jest.Mock).mockReturnValue(JSON.stringify([1, 2]));
    appendToItemArray('key', 3);
    expect(storage.set).toHaveBeenCalledWith('key', JSON.stringify([3, 1, 2]));
  });

  test('removeFromItemArray should remove item', () => {
    (storage.getString as jest.Mock).mockReturnValue(JSON.stringify([1, 2, 3]));
    removeFromItemArray<number>('key', (item) => item === 2);
    expect(storage.set).toHaveBeenCalledWith('key', JSON.stringify([1, 3]));
  });
});
