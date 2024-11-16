module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }], // Handles Expo Router and NativeWind
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin", // Always place this last
    ],
  };
};
