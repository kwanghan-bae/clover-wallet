module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel', 'react-native-reanimated/plugin'],
    env: {
      test: {
        plugins: ['nativewind/babel'] // 테스트 시 reanimated plugin 제외
      }
    }
  };
};