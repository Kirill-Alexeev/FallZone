// app/index.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import SettingsSvg from '../assets/sprites/ui/settings.svg';
import SettingsModal from '../components/SettingsModal';
import BalanceDisplay from '../components/ui/BalanceDisplay';
import CharacterPreview from '../components/ui/CharacterPreview';
import CustomButton from '../components/ui/CustomButton';
import CustomText from '../components/ui/CustomText';
import StarsAnimation from '../components/ui/StarsAnimation';
import StatsDisplay from '../components/ui/StatsDisplay';
import { homeScreenStyles } from './index.styles';

const HomeScreen = () => {
    const router = useRouter();
    const [settingsVisible, setSettingsVisible] = useState(false);

    const openSettings = () => {
        setSettingsVisible(true);
    };

    const closeSettings = () => {
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
                    onPress={() => router.push('/game')}
                />
            </View>
            <StatsDisplay />

            {/* Модальное окно статистики */}
            <SettingsModal
                visible={settingsVisible}
                onClose={closeSettings}
            />
        </LinearGradient>
    );
};

export default HomeScreen;