// ------------------------------
// 1️⃣ Моки React Native
// ------------------------------
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return { Svg: View, Path: View, Circle: View, Rect: View };
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.ExpoAV = { initialize: jest.fn(), setAudioMode: jest.fn() };
  return RN;
});

// ------------------------------
// 2️⃣ Моки Expo
// ------------------------------
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: {
            playAsync: jest.fn(),
            unloadAsync: jest.fn(),
            setVolumeAsync: jest.fn(),
            stopAsync: jest.fn(),
            replayAsync: jest.fn(),
          },
        })
      ),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { apiKey: 'test-api-key' } },
}));

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  removeNotificationSubscription: jest.fn(),
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
}));
