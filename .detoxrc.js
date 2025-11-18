/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'expo.android': {
      type: 'expo',
      build: 'npx expo start --no-dev --minify',
      start: 'npx expo start',
      bundleId: 'host.exp.exponent',
      // Для Expo Go
      binaryPath: 'node_modules/.bin/expo'
    }
  },
  devices: {
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_4_API_30' // Убедись что этот эмулятор существует
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    }
  },
  configurations: {
    'android.emu.expo': {
      device: 'emulator',
      app: 'expo.android'
    },
    'android.att.expo': {
      device: 'attached',
      app: 'expo.android'
    }
  }
};