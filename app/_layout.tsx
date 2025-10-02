// Навигация через нижнее tab-меню: Главная, Таблица лидеров, Магазин.
// Переход на игру и настройки через кнопки/иконки на главном экране.А

import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

const Layout = () => {
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
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Главная',
                    headerShown: false,
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

export default Layout;