// app/index.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import SettingsSvg from '../assets/sprites/ui/settings.svg';
import SettingsModal from '../components/SettingsModal';
import BalanceDisplay from '../components/ui/BalanceDisplay';
import CharacterPreview from '../components/ui/CharacterPreview';
import CustomButton from '../components/ui/CustomButton';
import CustomText from '../components/ui/CustomText';
import StarsAnimation from '../components/ui/StarsAnimation';
import StatsDisplay from '../components/ui/StatsDisplay';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import AudioService from '../services/audioService';
import { homeScreenStyles } from './index.styles';

const HomeScreen = () => {
    const router = useRouter();
    const [settingsVisible, setSettingsVisible] = React.useState(false);
    const { logout } = useAuth();
    const { user } = useAuth();

    // Безопасное использование useGame - только если пользователь авторизован
    const gameContext = user ? useGame() : null;

    const { getCurrentSkin } = useGame();
    const currentSkin = getCurrentSkin();

    const playSound = (soundName: string) => {
        if (gameContext) {
            try {
                gameContext.playSound(soundName);
            } catch (error) {
                console.error('Error playing sound:', error);
            }
        }
    };

    const vibrate = (type: 'light' | 'medium' | 'heavy') => {
        if (gameContext) {
            try {
                gameContext.vibrate(type);
            } catch (error) {
                console.error('Error vibrating:', error);
            }
        }
    };

    const switchToMenuMusic = () => {
        if (gameContext) {
            try {
                gameContext.switchToMenuMusic();
            } catch (error) {
                console.error('Error switching to menu music:', error);
            }
        }
    };

    const gameData = gameContext?.gameData;

    // Включаем музыку меню при загрузке
    useEffect(() => {
        if (user) {
            try {
                switchToMenuMusic();
            } catch (error) {
                console.error('Error playing menu music:', error);
            }
        }
    }, [user, switchToMenuMusic]);

    // Дополнительная проверка настроек музыки при изменении настроек
    useEffect(() => {
        if (gameData?.audioSettings) {
            if (!gameData.audioSettings.music) {
                // Если музыка отключена, останавливаем её
                AudioService.stopBackgroundMusic();
            }
        }
    }, [gameData?.audioSettings?.music]);

    const openSettings = () => {
        try {
            playSound('button_click');
            vibrate('light');
        } catch (error) {
            console.error('Error in openSettings:', error);
        }
        setSettingsVisible(true);
    };

    const startGame = () => {
        try {
            playSound('button_click');
            vibrate('medium');
        } catch (error) {
            console.error('Error in startGame:', error);
        }
        router.push('/game');
    };

    const handleCloseSettings = () => {
        try {
            playSound('button_click');
            vibrate('light');
        } catch (error) {
            console.error('Error in handleCloseSettings:', error);
        }
        setSettingsVisible(false);
    };

    const handleLogout = () => {
        try {
            playSound('button_click');
            vibrate('medium');
            logout();
        } catch (error) {
            console.error('Error in logout:', error);
        }
    };

    // Если пользователь не авторизован, не рендерим этот экран
    // (должен быть редирект на логин через _layout.tsx)
    if (!user) {
        return null;
    }

    return (
        <LinearGradient
            colors={['#000', '#4B0082', '#00008B']}
            style={homeScreenStyles.container}
        >
            <StarsAnimation />
            <View style={homeScreenStyles.header}>
                <CustomText style={homeScreenStyles.logo}>Fall Zone</CustomText>
                <View style={homeScreenStyles.topRow}>
                    <BalanceDisplay />
                    <CustomButton
                        icon={<SettingsSvg width={30} height={30} />}
                        onPress={openSettings}
                    />
                </View>
            </View>
            <View style={homeScreenStyles.center}>
                <CharacterPreview />

                {/* Отображаем название текущего скина */}
                {currentSkin && (
                    <CustomText>
                        Скин: {currentSkin.name}
                    </CustomText>
                )}

                <CustomButton
                    title="Полетели!"
                    onPress={startGame}
                />
            </View>
            <StatsDisplay />

            {/* Модальное окно настроек */}
            <SettingsModal
                visible={settingsVisible}
                onClose={handleCloseSettings}
            />
        </LinearGradient>
    );
};

export default HomeScreen;