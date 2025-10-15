// components/SettingsScreen/SettingsModal.tsx (альтернативная версия)
import React from 'react';
import { FlatList, Modal, View } from 'react-native';
import { useGame } from '../../context/GameContext';
import CustomButton from '../ui/CustomButton';
import CustomText from '../ui/CustomText';
import { settingsModalStyles } from './SettingsModal.styles';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

interface StatItem {
    id: string;
    label: string;
    value: string;
    section: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
    const { gameData } = useGame();

    console.log('SettingsModal - gameData stats:', gameData.stats);

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
        const totalDeaths = gameData.stats.totalDeaths;
        if (totalDeaths === 0) return '0%';
        return `${((deathCount / totalDeaths) * 100).toFixed(1)}%`;
    };

    // Создаем данные для FlatList
    const statsData: StatItem[] = [
        // Основная статистика
        { id: 'section1', label: 'Основная статистика', value: '', section: 'header' },
        { id: 'totalGames', label: 'Всего игр', value: gameData.stats.totalGames.toString(), section: 'main' },
        { id: 'highScore', label: 'Лучший рекорд', value: gameData.highScore.toString(), section: 'main' },
        { id: 'totalScore', label: 'Всего очков', value: gameData.stats.totalScore.toString(), section: 'main' },
        { id: 'totalCoins', label: 'Всего монет', value: gameData.stats.totalCoinsEarned.toString(), section: 'main' },
        { id: 'totalTime', label: 'Время в игре', value: formatTime(gameData.stats.totalPlayTime), section: 'main' },
        { id: 'totalTaps', label: 'Всего тапов', value: gameData.stats.totalTaps.toString(), section: 'main' },

        // Статистика смертей
        { id: 'section2', label: 'Причины смертей', value: '', section: 'header' },
        { id: 'totalDeaths', label: 'Всего смертей', value: gameData.stats.totalDeaths.toString(), section: 'deaths' },
        { id: 'cometDeaths', label: '💥 Кометы', value: `${gameData.stats.deathsByObstacle.comet} (${getDeathPercentage(gameData.stats.deathsByObstacle.comet)})`, section: 'deaths' },
        { id: 'asteroidDeaths', label: '🪨 Астероиды', value: `${gameData.stats.deathsByObstacle.asteroid} (${getDeathPercentage(gameData.stats.deathsByObstacle.asteroid)})`, section: 'deaths' },
        { id: 'droneDeaths', label: '🤖 Дроны', value: `${gameData.stats.deathsByObstacle.drone} (${getDeathPercentage(gameData.stats.deathsByObstacle.drone)})`, section: 'deaths' },
        { id: 'wallDeaths', label: '🧱 Стены', value: `${gameData.stats.deathsByObstacle.wall} (${getDeathPercentage(gameData.stats.deathsByObstacle.wall)})`, section: 'deaths' },

        // Статистика бонусов
        { id: 'section3', label: 'Собранные бонусы', value: '', section: 'header' },
        { id: 'totalBonuses', label: 'Всего бонусов', value: gameData.stats.totalBonuses.toString(), section: 'bonuses' },
        { id: 'shieldBonuses', label: '🛡️ Щиты', value: gameData.stats.bonusesByType.shield.toString(), section: 'bonuses' },
        { id: 'magnetBonuses', label: '🧲 Магниты', value: gameData.stats.bonusesByType.magnet.toString(), section: 'bonuses' },
        { id: 'slowmoBonuses', label: '⏱️ Замедление', value: gameData.stats.bonusesByType.slowmo.toString(), section: 'bonuses' },
        { id: 'coinBonuses', label: '💰 Монеты', value: gameData.stats.bonusesByType.coin.toString(), section: 'bonuses' },

        // Средние показатели
        { id: 'section4', label: 'Средние показатели', value: '', section: 'header' },
        { id: 'avgScore', label: 'Средний счет', value: gameData.stats.totalGames > 0 ? Math.round(gameData.stats.totalScore / gameData.stats.totalGames).toString() : '0', section: 'average' },
        { id: 'avgTime', label: 'Среднее время', value: gameData.stats.totalGames > 0 ? formatTime(gameData.stats.totalPlayTime / gameData.stats.totalGames) : '0с', section: 'average' },
        { id: 'avgTaps', label: 'Тапов/игру', value: gameData.stats.totalGames > 0 ? Math.round(gameData.stats.totalTaps / gameData.stats.totalGames).toString() : '0', section: 'average' },
    ];

    const renderStatItem = ({ item }: { item: StatItem }) => {
        if (item.section === 'header') {
            return (
                <View style={settingsModalStyles.sectionHeader}>
                    <CustomText style={settingsModalStyles.sectionTitle}>
                        {item.label}
                    </CustomText>
                </View>
            );
        }

        return (
            <View style={settingsModalStyles.statsRow}>
                <CustomText style={settingsModalStyles.statLabel}>{item.label}</CustomText>
                <CustomText style={settingsModalStyles.statValue}>{item.value}</CustomText>
            </View>
        );
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
                    <CustomText style={settingsModalStyles.title}>Статистика</CustomText>

                    <FlatList
                        data={statsData}
                        renderItem={renderStatItem}
                        keyExtractor={(item) => item.id}
                        style={settingsModalStyles.list}
                        showsVerticalScrollIndicator={true}
                    />

                    <CustomButton
                        title="Закрыть"
                        onPress={onClose}
                        buttonStyle={settingsModalStyles.closeButton}
                        textStyle={settingsModalStyles.closeButtonText}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default SettingsModal;