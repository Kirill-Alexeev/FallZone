// Главный навигационный компонент приложения с нижним таб-меню
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import CustomText from '../components/ui/CustomText';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { GameProvider } from '../context/GameContext';
import { NavigationProvider, useNavigation } from '../context/NavigationContext';

// Импортируем LoginScreen напрямую
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
const LoadingScreen = () => (
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

    // Если не авторизован - показываем логин
    if (!user) {
        return <LoginScreen />;
    }

    // Если авторизован - показываем основной интерфейс
    return (
        <NavigationProvider>
            <GameProvider>
                <ProtectedTabNavigator />
            </GameProvider>
        </NavigationProvider>
    );
};

// Корневой компонент
const RootLayout = () => {
    return (
        <AuthProvider>
            <AuthWrapper>
                <MainApp />
            </AuthWrapper>
        </AuthProvider>
    );
};

export default RootLayout;