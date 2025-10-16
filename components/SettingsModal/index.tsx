// components/SettingsScreen/SettingsModal.tsx
import React, { useState } from 'react';
import { FlatList, Modal, View } from 'react-native';
import { useGame } from '../../context/GameContext';
import CustomButton from '../ui/CustomButton';
import CustomText from '../ui/CustomText';
import ToggleSwitch from '../ui/ToggleSwitch';
import { settingsModalStyles } from './SettingsModal.styles';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

interface SettingsItem {
    id: string;
    type: 'header' | 'toggle' | 'stat';
    label: string;
    value?: string;
    section?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
    const { gameData, updateAudioSettings, playSound, vibrate } = useGame();
    const [activeTab, setActiveTab] = useState<'stats' | 'audio'>('stats');

    // Безопасное получение данных
    const safeGameData = gameData || {
        highScore: 0,
        coins: 0,
        stats: {
            totalGames: 0,
            totalTaps: 0,
            totalPlayTime: 0,
            totalCoinsEarned: 0,
            totalScore: 0,
            totalDeaths: 0,
            deathsByObstacle: { comet: 0, asteroid: 0, drone: 0, wall: 0 },
            totalBonuses: 0,
            bonusesByType: { shield: 0, magnet: 0, slowmo: 0, coin: 0 }
        },
        audioSettings: { sound: true, music: true, vibration: true },
        skins: [],
        currentSkinId: 'default'
    };

    const audioSettings = safeGameData.audioSettings;
    const stats = safeGameData.stats;

    const formatTime = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}ч ${minutes % 60}м`;
        } else if (minutes > 0) {
            return `${minutes}м ${seconds % 60}с`;
        } else {
            return `${seconds}с`;
        }
    };

    const getDeathPercentage = (deathCount: number) => {
        const totalDeaths = stats.totalDeaths;
        if (totalDeaths === 0) return '0%';
        return `${((deathCount / totalDeaths) * 100).toFixed(1)}%`;
    };

    const handleToggleChange = (setting: keyof typeof audioSettings, value: boolean) => {
        updateAudioSettings({ [setting]: value });
        try {
            playSound('button_click');
            vibrate('light');
        } catch (error) {
            console.error('Error in handleToggleChange:', error);
        }
    };

    // Данные для вкладки статистики
    const statsData: SettingsItem[] = [
        { id: 'section1', type: 'header', label: 'Основная статистика' },
        { id: 'totalGames', type: 'stat', label: 'Всего игр', value: stats.totalGames.toString() },
        { id: 'highScore', type: 'stat', label: 'Лучший рекорд', value: safeGameData.highScore.toString() },
        { id: 'totalScore', type: 'stat', label: 'Всего очков', value: stats.totalScore.toString() },
        { id: 'totalCoins', type: 'stat', label: 'Всего монет', value: stats.totalCoinsEarned.toString() },
        { id: 'totalTime', type: 'stat', label: 'Время в игре', value: formatTime(stats.totalPlayTime) },
        { id: 'totalTaps', type: 'stat', label: 'Всего тапов', value: stats.totalTaps.toString() },

        { id: 'section2', type: 'header', label: 'Причины смертей' },
        { id: 'totalDeaths', type: 'stat', label: 'Всего смертей', value: stats.totalDeaths.toString() },
        { id: 'cometDeaths', type: 'stat', label: '💥 Кометы', value: `${stats.deathsByObstacle.comet} (${getDeathPercentage(stats.deathsByObstacle.comet)})` },
        { id: 'asteroidDeaths', type: 'stat', label: '🪨 Астероиды', value: `${stats.deathsByObstacle.asteroid} (${getDeathPercentage(stats.deathsByObstacle.asteroid)})` },
        { id: 'droneDeaths', type: 'stat', label: '🤖 Дроны', value: `${stats.deathsByObstacle.drone} (${getDeathPercentage(stats.deathsByObstacle.drone)})` },
        { id: 'wallDeaths', type: 'stat', label: '🧱 Стены', value: `${stats.deathsByObstacle.wall} (${getDeathPercentage(stats.deathsByObstacle.wall)})` },

        { id: 'section3', type: 'header', label: 'Собранные бонусы' },
        { id: 'totalBonuses', type: 'stat', label: 'Всего бонусов', value: stats.totalBonuses.toString() },
        { id: 'shieldBonuses', type: 'stat', label: '🛡️ Щиты', value: stats.bonusesByType.shield.toString() },
        { id: 'magnetBonuses', type: 'stat', label: '🧲 Магниты', value: stats.bonusesByType.magnet.toString() },
        { id: 'slowmoBonuses', type: 'stat', label: '⏱️ Замедление', value: stats.bonusesByType.slowmo.toString() },
        { id: 'coinBonuses', type: 'stat', label: '💰 Монеты', value: stats.bonusesByType.coin.toString() },

        { id: 'section4', type: 'header', label: 'Средние показатели' },
        { id: 'avgScore', type: 'stat', label: 'Средний счет', value: stats.totalGames > 0 ? Math.round(stats.totalScore / stats.totalGames).toString() : '0' },
        { id: 'avgTime', type: 'stat', label: 'Среднее время', value: stats.totalGames > 0 ? formatTime(stats.totalPlayTime / stats.totalGames) : '0с' },
        { id: 'avgTaps', type: 'stat', label: 'Тапов/игру', value: stats.totalGames > 0 ? Math.round(stats.totalTaps / stats.totalGames).toString() : '0' },
    ];

    // Данные для вкладки аудио
    const audioData: SettingsItem[] = [
        { id: 'sectionAudio', type: 'header', label: 'Настройки звука' },
        { id: 'sound', type: 'toggle', label: '🔊 Звуки эффектов' },
        { id: 'music', type: 'toggle', label: '🎵 Фоновая музыка' },
        { id: 'vibration', type: 'toggle', label: '📳 Вибрация' },
    ];

    const currentData = activeTab === 'stats' ? statsData : audioData;

    const renderItem = ({ item }: { item: SettingsItem }) => {
        if (item.type === 'header') {
            return (
                <View style={settingsModalStyles.sectionHeader}>
                    <CustomText style={settingsModalStyles.sectionTitle}>
                        {item.label}
                    </CustomText>
                </View>
            );
        }

        if (item.type === 'toggle') {
            return (
                <ToggleSwitch
                    value={audioSettings[item.id as keyof typeof audioSettings] as boolean}
                    onValueChange={(value) => handleToggleChange(item.id as keyof typeof audioSettings, value)}
                    label={item.label}
                />
            );
        }

        if (item.type === 'stat') {
            return (
                <View style={settingsModalStyles.statsRow}>
                    <CustomText style={settingsModalStyles.statLabel}>{item.label}</CustomText>
                    <CustomText style={settingsModalStyles.statValue}>{item.value}</CustomText>
                </View>
            );
        }

        return null;
    };

    // Функции для получения стилей кнопок табов
    const getStatsTabButtonStyle = () => {
        return activeTab === 'stats'
            ? settingsModalStyles.tabButtonActive
            : settingsModalStyles.tabButton;
    };

    const getAudioTabButtonStyle = () => {
        return activeTab === 'audio'
            ? settingsModalStyles.tabButtonActive
            : settingsModalStyles.tabButton;
    };

    const getStatsTabTextStyle = () => {
        return activeTab === 'stats'
            ? settingsModalStyles.tabButtonTextActive
            : settingsModalStyles.tabButtonText;
    };

    const getAudioTabTextStyle = () => {
        return activeTab === 'audio'
            ? settingsModalStyles.tabButtonTextActive
            : settingsModalStyles.tabButtonText;
    };

    const handleTabPress = (tab: 'stats' | 'audio') => {
        setActiveTab(tab);
        try {
            playSound('button_click');
            vibrate('light');
        } catch (error) {
            console.error('Error in handleTabPress:', error);
        }
    };

    const handleClose = () => {
        try {
            playSound('button_click');
            vibrate('light');
        } catch (error) {
            console.error('Error in handleClose:', error);
        }
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={settingsModalStyles.modalOverlay}>
                <View style={settingsModalStyles.modalContent}>
                    <CustomText style={settingsModalStyles.title}>
                        {activeTab === 'stats' ? 'Статистика' : 'Настройки'}
                    </CustomText>

                    {/* Табы */}
                    <View style={settingsModalStyles.tabsContainer}>
                        <CustomButton
                            title="Статистика"
                            onPress={() => handleTabPress('stats')}
                            buttonStyle={getStatsTabButtonStyle()}
                            textStyle={getStatsTabTextStyle()}
                        />
                        <CustomButton
                            title="Аудио"
                            onPress={() => handleTabPress('audio')}
                            buttonStyle={getAudioTabButtonStyle()}
                            textStyle={getAudioTabTextStyle()}
                        />
                    </View>

                    <FlatList
                        data={currentData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        style={settingsModalStyles.list}
                        showsVerticalScrollIndicator={true}
                    />

                    <CustomButton
                        title="Закрыть"
                        onPress={handleClose}
                        buttonStyle={settingsModalStyles.closeButton}
                        textStyle={settingsModalStyles.closeButtonText}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default SettingsModal;