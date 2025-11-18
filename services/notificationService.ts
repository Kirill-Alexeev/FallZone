// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Для ярлыков
import * as IntentLauncher from 'expo-intent-launcher';

class NotificationService {
    private initialized = false;

    // Инициализация — запрос разрешений и создание Android-канала
    async initNotifications() {
        if (this.initialized) return;

        try {
            // Не зависим от expo-device — просто логируем платформу.
            if (Platform.OS === 'web') {
                console.warn('Notifications: running on web — native notifications are limited');
            }

            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: false,
                    // Новые поля для совместимости с разными версиями API
                    shouldShowBanner: true,
                    shouldShowList: true,
                })
            });

            const existing = await Notifications.getPermissionsAsync();
            let finalStatus = existing.status;

            if (finalStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (Platform.OS === 'android') {
                // Создаем канал для уведомлений игры с высоким приоритетом
                await Notifications.setNotificationChannelAsync('game-reminders', {
                    name: 'Game Reminders',
                    importance: Notifications.AndroidImportance.MAX,
                    sound: 'default',
                    vibrationPattern: [0, 250, 250, 250],
                });
            }

            this.initialized = true;
            console.log('NotificationService initialized, permission:', finalStatus);
        } catch (e) {
            console.error('NotificationService init error:', e);
        }
    }

    // Планирование локального уведомления через seconds от текущего времени
    async scheduleNotification({ title, body, seconds = 1 }: { title: string; body: string; seconds?: number }) {
        try {
            if (!this.initialized) await this.initNotifications();

            // Триггер делаем any — тайпинги разные между платформами/версиями
            const trigger: any = seconds <= 0 ? null : { seconds, repeats: false };

            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: 'default',
                },
                trigger
            });

            console.log('Scheduled notification id=', id, 'in', seconds, 's');
            return id;
        } catch (e) {
            console.error('scheduleNotification error:', e);
            return null;
        }
    }

    // Планирование ежедневного напоминания в следующий запуск (пример)
    async scheduleDailyReminder({ title, body, secondsFromNow = 60 * 60 * 24 }: { title: string; body: string; secondsFromNow?: number }) {
        return this.scheduleNotification({ title, body, seconds: secondsFromNow });
    }

    async cancelAllScheduled() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('All scheduled notifications cancelled');
        } catch (e) {
            console.error('cancelAllScheduled error:', e);
        }
    }

    // Создание ярлыка приложения на рабочем столе Android
    async createAppShortcut() {
        if (Platform.OS !== 'android') {
            console.warn('App Shortcuts доступны только на Android');
            return;
        }
        try {
            await IntentLauncher.startActivityAsync('com.android.launcher.action.INSTALL_SHORTCUT', {
                extra: {
                    'android.intent.extra.shortcut.NAME': 'FallZone',
                    'android.intent.extra.shortcut.INTENT': {
                        action: 'android.intent.action.MAIN',
                        category: 'android.intent.category.LAUNCHER',
                        package: 'host.exp.exponent', // Замените на ваш package, если билдите standalone
                    },
                    // Иконка по умолчанию Expo, можно заменить на свою
                    'android.intent.extra.shortcut.ICON_RESOURCE': {
                        package: 'host.exp.exponent',
                        resourceName: 'ic_launcher',
                    },
                },
            });
            console.log('Ярлык приложения создан!');
        } catch (e) {
            console.error('Ошибка создания ярлыка:', e);
        }
    }
}

export default new NotificationService();
