// config/firebase-check.ts
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Функция для проверки подключения к Firebase
export const checkFirebaseConnection = () => {
    console.log('🔄 Проверка подключения к Firebase...');

    try {
        // Проверяем состояние аутентификации
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('✅ Firebase подключен успешно');
            console.log('📱 Пользователь:', user ? 'Авторизован' : 'Не авторизован');
            unsubscribe();
        }, (error) => {
            console.error('❌ Ошибка подключения Firebase:', error);
        });

        // Автоматически отпишемся через 5 секунд
        setTimeout(() => {
            try {
                unsubscribe();
            } catch (e) {
                // Игнорируем ошибки отписки
            }
        }, 5000);

    } catch (error) {
        console.error('❌ Критическая ошибка инициализации Firebase:', error);
    }
};