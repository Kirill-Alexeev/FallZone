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
    const { playSound, switchToMenuMusic, vibrate, gameData } = useGame();
    const { logout } = useAuth();

    // Включаем музыку меню при загрузке
    useEffect(() => {
        try {
            switchToMenuMusic();
        } catch (error) {
            console.error('Error playing menu music:', error);
        }
    }, [switchToMenuMusic]);

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
                <CustomButton
                    title="Полетели!"
                    onPress={startGame}
                />
            </View>
            <StatsDisplay />
            <CustomButton
                title="Выйти"
                onPress={() => logout()}
                buttonStyle={{
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: '#FF4444',
                    marginTop: 10,
                    marginBottom: 20
                }}
                textStyle={{ color: '#FF4444' }}
            />

            {/* Модальное окно статистики */}
            <SettingsModal
                visible={settingsVisible}
                onClose={handleCloseSettings}
            />
        </LinearGradient>
    );
};

export default HomeScreen;