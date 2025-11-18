export const addNotificationReceivedListener = jest.fn();
export const addNotificationResponseReceivedListener = jest.fn();
export const scheduleNotificationAsync = jest.fn();
export const removeNotificationSubscription = jest.fn();
export const setNotificationHandler = jest.fn();
export const getPermissionsAsync = jest.fn().mockResolvedValue({ granted: true });
export const requestPermissionsAsync = jest.fn().mockResolvedValue({ granted: true });