// Главный навигационный компонент приложения с нижним таб-меню
// Создает нижнюю панель с 3 вкладками: Главная, Лидерборд, Магазин
// Скрывает экран игры из таб-меню (href: null)
// Настраивает стили табов (неоновые цвета, прозрачный фон)
// Игра доступна только через кнопку на главной

import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { GameProvider } from '../context/GameContext';
import { NavigationProvider, useNavigation } from '../context/NavigationContext';

const TabNavigator = () => {
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
                    display: isTabBarVisible ? 'flex' : 'none', // Скрываем/показываем панель
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
                    tabBarIcon: ({ color }) => <FontAwesome name="shopping-cart" size={28} color={color} />, // Иконка корзины для магазина
                }}
            />
            <Tabs.Screen
                name="game"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
};

const Layout = () => {
    return (
        <NavigationProvider>
            <GameProvider>
                <TabNavigator />
            </GameProvider>
        </NavigationProvider>
    );
};

export default Layout;