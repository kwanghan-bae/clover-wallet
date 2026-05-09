import { Platform } from 'react-native';

interface QueryStorage {
  set: (key: string, value: string) => void;
  getString: (key: string) => string | undefined;
  remove: (key: string) => void;
}

function createStorage(): QueryStorage {
  if (Platform.OS === 'web') {
    return {
      set: (key, value) => localStorage.setItem(key, value),
      getString: (key) => localStorage.getItem(key) ?? undefined,
      remove: (key) => localStorage.removeItem(key),
    };
  }
  const { MMKV } = require('react-native-mmkv');
  const mmkv = new MMKV({ id: 'query-cache' });
  return {
    set: (key, value) => mmkv.set(key, value),
    getString: (key) => mmkv.getString(key),
    remove: (key) => mmkv.delete(key),
  };
}

const queryStorage = createStorage();

export const persister = {
  persistClient: (client: unknown) => {
    queryStorage.set('react-query-cache', JSON.stringify(client));
  },
  restoreClient: () => {
    const cache = queryStorage.getString('react-query-cache');
    return cache ? JSON.parse(cache) : undefined;
  },
  removeClient: () => {
    queryStorage.remove('react-query-cache');
  },
};
