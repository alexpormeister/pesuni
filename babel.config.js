module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Tämä on tärkein rivi, joka aktivoi animaatiot
      "react-native-reanimated/plugin",
    ],
  };
};
