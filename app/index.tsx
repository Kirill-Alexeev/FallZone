// Главный экран.
// LinearGradient для фона, StarsAnimation для звезд, персонаж в центре, кнопка под ним.
// Переход на игру через router.push('/game'), настройки через иконку (пока console.log).

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import SettingsSvg from '../assets/sprites/ui/settings.svg';
import BalanceDisplay from '../components/ui/BalanceDisplay';
import CharacterPreview from '../components/ui/CharacterPreview';
import CustomButton from '../components/ui/CustomButton';
import CustomText from '../components/ui/CustomText';
import StarsAnimation from '../components/ui/StarsAnimation';
import StatsDisplay from '../components/ui/StatsDisplay';
import { homeScreenStyles } from './index.styles';

const HomeScreen = () => {
    const router = useRouter();
    const balance = 500; // Заглушка, позже из storage
    const highScore = 1000; // Заглушка

    const openSettings = () => {
        // Позже: Открыть модал или router.push('/settings')
        console.log('Открыть настройки');
    };

    return (
        <LinearGradient
            colors={['#000', '#4B0082', '#00008B']} // Черный, темно-фиолетовый, темно-синий
            style={homeScreenStyles.container}
        >
            <StarsAnimation />
            <View style={homeScreenStyles.header}>
                <CustomText style={homeScreenStyles.logo}>Fall Zone</CustomText>
                <View style={homeScreenStyles.topRow}>
                    <BalanceDisplay balance={balance} />
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
                    onPress={() => router.push('/game')}
                />
            </View>
            <StatsDisplay highScore={highScore} style={homeScreenStyles.statsDisplay} />
        </LinearGradient>
    );
};

export default HomeScreen;