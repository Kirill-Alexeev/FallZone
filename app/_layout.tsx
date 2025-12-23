// Главный навигационный компонент приложения с нижним таб-меню
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import CustomText from '../components/ui/CustomText';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { GameProvider, useGame } from '../context/GameContext';
import { NavigationProvider, useNavigation } from '../context/NavigationContext';

// Импортируем LoginScreen напрямую
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import LoginScreen from './login';

// Компонент для защищенных экранов (требует авторизации)
const ProtectedTabNavigator = () => {
    const { isTabBarVisible } = useNavigation();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#00FFFF',
                tabBarInactiveTintColor: '#888',
                tabBarStyle: {
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    display: isTabBarVisible ? 'flex' : 'none',
                },
                headerShown: false,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Главная',
                    tabBarIcon: ({ color }) => <FontAwesome name="home" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="leaderboard"
                options={{
                    title: 'Таблица лидеров',
                    tabBarIcon: ({ color }) => <FontAwesome name="trophy" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="shop"
                options={{
                    title: 'Магазин',
                    tabBarIcon: ({ color }) => <FontAwesome name="shopping-cart" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="game"
                options={{
                    href: null,
                }}
            />
            {/* Оставляем экраны аутентификации скрытыми */}
            <Tabs.Screen
                name="login"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="signup"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
};

// Компонент загрузки
export const LoadingScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#00FFFF" />
        <CustomText style={{ color: '#00FFFF', fontSize: 20, marginTop: 20 }}>Загрузка...</CustomText>
    </View>
);

// Главный лейаут с логикой проверки авторизации
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    // Показываем лоадер при загрузке
    if (loading) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
};

// Главный компонент
const MainApp = () => {
    const { user } = useAuth();
    const { gameData, refreshGameData } = useGame();

    // Эффект для переноса данных при входе/выходе
    useEffect(() => {
        const transferGuestData = async () => {
            if (user && gameData) {
                try {
                    // При входе: сохраняем гостевые данные в аккаунт пользователя
                    const guestKey = 'fallzone_game_data_session';
                    const guestData = await AsyncStorage.getItem(guestKey);

                    if (guestData) {
                        // Если у пользователя нет данных или гостевые данные лучше
                        const parsedGuestData = JSON.parse(guestData);

                        if (parsedGuestData.highScore > (gameData.highScore || 0)) {
                            // Переносим рекорд гостя в аккаунт
                            console.log('Transferring guest high score to user account');
                            // Здесь нужно вызвать метод updateHighScore из GameContext
                        }

                        // Очищаем гостевые данные
                        await AsyncStorage.removeItem(guestKey);
                    }
                } catch (error) {
                    console.error('Error transferring guest data:', error);
                }
            }
        };

        transferGuestData();
    }, [user, gameData]);

    // Если не авторизован - показываем логин
    if (!user) {
        return <LoginScreen />;
    }

    // Если авторизован - показываем основной интерфейс
    return (
        <NavigationProvider>
            <ProtectedTabNavigator />
        </NavigationProvider>
    );
};

// Корневой компонент
const RootLayout = () => {
    return (
        <AuthProvider>
            <AuthWrapper>
                <GameProvider>
                    <MainApp />
                </GameProvider>
            </AuthWrapper>
        </AuthProvider>
    );
};

export default RootLayout;