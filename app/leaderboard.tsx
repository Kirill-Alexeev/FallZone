// app/leaderboard.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    View
} from 'react-native';
import BackgroundWithStars from '../components/ui/BackgroundWithStars';
import CustomText from '../components/ui/CustomText';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import LeaderboardService, { LeaderboardEntry, LeaderboardStats } from '../services/leaderboardService';

// Тип для элемента с рангом
interface LeaderboardEntryWithRank extends LeaderboardEntry {
    rank: number;
}

const LeaderboardScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardStats>({
        entries: [],
        totalPlayers: 0,
        hasMore: false
    });
    const [userRank, setUserRank] = useState<number>(-1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LeaderboardEntry[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const { user } = useAuth();
    const { gameData, syncWithLeaderboard } = useGame();

    const loadLeaderboard = useCallback(async () => {
        try {
            setLoading(true);
            const data = await LeaderboardService.getLeaderboard();

            setLeaderboardData(data);

            if (user) {
                const rank = await LeaderboardService.getUserRank(user.uid);
                setUserRank(rank);
            }

        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadLeaderboard();
        setRefreshing(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setShowSearchResults(false);
            return;
        }

        try {
            const results = await LeaderboardService.searchPlayers(searchQuery);
            setSearchResults(results);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Error searching players:', error);
        }
    };

    const syncData = async () => {
        try {
            await syncWithLeaderboard?.();
            await loadLeaderboard();
        } catch (error) {
            console.error('Error syncing data:', error);
        }
    };

    useEffect(() => {
        loadLeaderboard();
    }, [loadLeaderboard]);

    const getDisplayData = (): LeaderboardEntryWithRank[] => {
        return leaderboardData.entries.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));
    };

    const renderLeaderboardItem = ({ item }: { item: LeaderboardEntryWithRank }) => (
        <View style={[
            styles.leaderboardItem,
            user?.uid === item.userId && styles.currentUserItem
        ]}>
            <View style={[
                styles.rankContainer
            ]}>
                <CustomText>
                    {item.rank}
                </CustomText>
            </View>

            <View style={styles.userInfo}>
                <CustomText style={styles.userName}>
                    {item.displayName}
                    {user?.uid === item.userId && ' (Вы)'}
                </CustomText>
                <CustomText style={styles.lastPlayed}>
                    Последняя игра: {new Date(item.lastPlayed).toLocaleDateString('ru-RU')}
                </CustomText>
            </View>

            <View style={styles.scoreContainer}>
                <CustomText style={styles.scoreText}>
                    {item.highScore.toLocaleString()}
                </CustomText>
                <CustomText style={styles.gamesText}>
                    🎮 {item.totalGames}
                </CustomText>
            </View>
        </View>
    );

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <CustomText style={styles.emptyText}>
                Пока никто не играл 😢
            </CustomText>
            <CustomText style={styles.emptySubtext}>
                Будьте первым, кто установит рекорд!
            </CustomText>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <CustomText style={styles.title}>🏆 Таблица лидеров</CustomText>

            <View style={styles.userStats}>
                {userRank > 0 ? (
                    <>
                        <CustomText style={styles.userRankText}>
                            Ваше место: <CustomText style={styles.userRankNumber}>#{userRank}</CustomText>
                        </CustomText>
                        {gameData && (
                            <CustomText style={styles.userScoreText}>
                                Ваш рекорд: <CustomText style={styles.userScoreNumber}>{gameData.highScore}</CustomText>
                            </CustomText>
                        )}
                    </>
                ) : (
                    <CustomText style={styles.userRankText}>
                        Сыграйте хотя бы одну игру, чтобы попасть в таблицу лидеров!
                    </CustomText>
                )}
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <CustomText style={styles.statValue}>
                        {leaderboardData.totalPlayers}
                    </CustomText>
                    <CustomText style={styles.statLabel}>
                        игроков
                    </CustomText>
                </View>
                <View style={styles.statItem}>
                    <CustomText style={styles.statValue}>
                        {leaderboardData.entries.length > 0 ? leaderboardData.entries[0].highScore.toLocaleString() : '0'}
                    </CustomText>
                    <CustomText style={styles.statLabel}>
                        лучший счет
                    </CustomText>
                </View>
            </View>
        </View>
    );

    return (
        <BackgroundWithStars>
            <View style={styles.container}>
                {renderHeader()}

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#00FFFF" />
                        <CustomText style={styles.loadingText}>Загрузка рейтинга...</CustomText>
                    </View>
                ) : (
                    <FlatList
                        data={getDisplayData()}
                        renderItem={renderLeaderboardItem}
                        keyExtractor={(item) => `${item.userId}_${item.rank}`}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#00FFFF']}
                                tintColor="#00FFFF"
                            />
                        }
                        ListEmptyComponent={renderEmptyComponent}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* <TouchableOpacity style={styles.syncButton} onPress={syncData} disabled={!user}>
                    <FontAwesome name="refresh" size={20} color={user ? "#00FFFF" : "#888"} />
                    <CustomText>
                        {user ? "Синхронизировать" : "Войдите для синхронизации"}
                    </CustomText>
                </TouchableOpacity> */}
            </View>
        </BackgroundWithStars>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        color: '#00FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    userStats: {
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#00FFFF',
    },
    userRankText: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 5,
    },
    userRankNumber: {
        color: '#00FF00',
        fontWeight: 'bold',
        fontSize: 20,
    },
    userScoreText: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
    },
    userScoreNumber: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 10,
        minWidth: 120,
    },
    statValue: {
        color: '#00FFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statLabel: {
        color: '#888',
        fontSize: 14,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        color: '#FFF',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.3)',
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        borderRadius: 10,
        padding: 12,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#00FFFF',
    },
    listContainer: {
        paddingBottom: 20,
    },
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    currentUserItem: {
        backgroundColor: 'rgba(0, 255, 255, 0.15)',
        borderColor: '#00FFFF',
    },
    rankContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    rankText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    userEmail: {
        color: '#888',
        fontSize: 12,
        marginBottom: 5,
    },
    lastPlayed: {
        color: '#AAA',
        fontSize: 10,
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    scoreText: {
        color: '#00FF00',
        fontSize: 22,
        fontWeight: 'bold',
    },
    gamesText: {
        color: '#AAA',
        fontSize: 12,
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 10,
    },
    emptySubtext: {
        color: '#666',
        textAlign: 'center',
        fontSize: 14,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#00FFFF',
    },
    syncText: {
        color: '#00FFFF',
        fontSize: 16,
        marginLeft: 10,
    },
    disabledText: {
        color: '#888',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        borderWidth: 2,
        borderColor: '#00FFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 255, 255, 0.3)',
    },
    modalTitle: {
        color: '#00FFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchResultsList: {
        maxHeight: 400,
    },
    searchResultItem: {
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchResultName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchResultEmail: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    searchResultScore: {
        color: '#00FF00',
        fontSize: 14,
        marginTop: 5,
    },
    noResultsText: {
        color: '#888',
        textAlign: 'center',
        fontSize: 16,
        marginVertical: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#00FFFF',
        marginTop: 20,
        fontSize: 16,
    },
});

export default LeaderboardScreen;