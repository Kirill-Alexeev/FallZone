// __mocks__/expo-av.js
const mockReplayAsync = jest.fn();
const mockStopAsync = jest.fn();

const mockSound = {
  replayAsync: mockReplayAsync,
  stopAsync: mockStopAsync,
};

export const Audio = {
  Sound: {
    createAsync: jest.fn(async () => ({ sound: mockSound })),
  },
};
