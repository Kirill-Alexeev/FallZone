// app/shop.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import BackgroundWithStars from '../components/ui/BackgroundWithStars';
import CustomButton from '../components/ui/CustomButton';
import CustomText from '../components/ui/CustomText';
import { useGame } from '../context/GameContext';

interface SkinItem {
    id: string;
    name: string;
    price: number;
    color: string;
    previewImage: any;
    staticImage: any;
    unlocked: boolean; // Изменяем с isUnlocked на unlocked
    equipped: boolean; // Изменяем с isEquipped на equipped
}

const ShopScreen = () => {
    const { gameData, addCoins, unlockSkin, equipSkin } = useGame();
    const [selectedSkin, setSelectedSkin] = useState<string>(gameData?.currentSkinId || 'default');
    const [skins, setSkins] = useState<SkinItem[]>([]);

    // Скины с их параметрами
    useEffect(() => {
        if (gameData?.skins) {
            console.log('ShopScreen: Updating skins from gameData', gameData.skins);
            updateSkinsListFromGameData();
        }
    }, [gameData]);

    // Функция для получения списка скинов из gameData
    const updateSkinsListFromGameData = () => {
        if (!gameData?.skins) return;

        // Сопоставление ID скинов с изображениями
        const getImageForSkin = (skinId: string) => {
            switch (skinId) {
                case 'default':
                    return require('../assets/sprites/characters/player_default_static.png');
                case 'green':
                    return require('../assets/sprites/characters/player_green_static.png');
                case 'red':
                    return require('../assets/sprites/characters/player_red_static.png');
                case 'gold':
                    return require('../assets/sprites/characters/player_gold_static.png');
                default:
                    return require('../assets/sprites/characters/player_default_static.png');
            }
        };

        const getColorForSkin = (skinId: string) => {
            switch (skinId) {
                case 'default': return '#FFFFFF';
                case 'green': return '#00FF00';
                case 'red': return '#FF0000';
                case 'gold': return '#FFD700';
                default: return '#FFFFFF';
            }
        };

        const getNameForSkin = (skinId: string) => {
            switch (skinId) {
                case 'default': return 'Космонавт';
                case 'green': return 'Зеленый скафандр';
                case 'red': return 'Красный скафандр';
                case 'gold': return 'Золотой скафандр';
                default: return skinId;
            }
        };

        const skinsList: SkinItem[] = gameData.skins.map(skin => ({
            id: skin.id,
            name: getNameForSkin(skin.id),
            price: skin.price || 0,
            color: getColorForSkin(skin.id),
            previewImage: getImageForSkin(skin.id),
            staticImage: getImageForSkin(skin.id),
            unlocked: skin.unlocked,
            equipped: skin.equipped || gameData.currentSkinId === skin.id
        }));

        // Сортируем: сначала разблокированные, потом по цене
        const sortedSkins = [...skinsList].sort((a, b) => {
            if (a.unlocked && !b.unlocked) return -1;
            if (!a.unlocked && b.unlocked) return 1;
            return a.price - b.price;
        });

        setSkins(sortedSkins);
        setSelectedSkin(gameData.currentSkinId || 'default');
    };

    const handleBuySkin = async (skin: SkinItem) => {
        console.log('Buying skin:', {
            skinId: skin.id,
            price: skin.price,
            unlocked: skin.unlocked,
            coins: gameData?.coins
        });

        if (!gameData) {
            console.error('No game data');
            return;
        }

        if (skin.unlocked) {
            console.log('Skin already unlocked');
            return;
        }

        if (gameData.coins < skin.price) {
            console.log(`Not enough coins: ${gameData.coins} < ${skin.price}`);
            return;
        }

        try {
            console.log(`Processing purchase for skin: ${skin.id}`);

            // Просто вызываем unlockSkin - она сама спишет монеты
            await unlockSkin(skin.id);

            // Данные обновятся автоматически через useEffect

        } catch (error) {
            console.error('Error purchasing skin:', error);
        }
    };

    const handleEquipSkin = async (skinId: string) => {
        try {
            console.log(`Equipping skin: ${skinId}`);
            await equipSkin(skinId);
            // Не нужно вызывать setSelectedSkin - это сделает useEffect
            console.log(`Skin ${skinId} equipped successfully`);
        } catch (error) {
            console.error('Error equipping skin:', error);
        }
    };

    const renderSkinItem = ({ item, index }: { item: SkinItem; index: number }) => {
        console.log(`Rendering skin ${item.id}:`, {
            unlocked: item.unlocked,
            equipped: item.equipped,
            price: item.price
        });

        return (
            <TouchableOpacity
                style={[
                    styles.skinCard,
                    item.equipped && styles.equippedSkinCard,
                    selectedSkin === item.id && styles.selectedSkinCard
                ]}
                onPress={() => setSelectedSkin(item.id)}
                activeOpacity={0.7}
            >
                {/* Иконка персонажа */}
                <View style={styles.skinImageContainer}>
                    <Image
                        source={item.staticImage}
                        style={[
                            styles.skinImage,
                            !item.unlocked && styles.lockedSkinImage
                        ]}
                        resizeMode="contain"
                    />

                    {item.equipped && (
                        <View style={styles.equippedOverlay}>
                            <CustomText style={styles.equippedText}>✓</CustomText>
                        </View>
                    )}
                </View>

                {/* Название скина */}
                <CustomText style={styles.skinName}>
                    {item.name}
                </CustomText>

                {/* Цена */}
                <CustomText style={styles.priceText}>
                    {item.price === 0 ? 'Бесплатно' : `${item.price} монет`}
                </CustomText>

                {/* Кнопка действия */}
                <View style={styles.actionContainer}>
                    {item.unlocked ? (
                        <CustomButton
                            title={item.equipped ? "Экипирован" : "Надеть"}
                            onPress={() => handleEquipSkin(item.id)}
                            disabled={item.equipped}
                            buttonStyle={item.equipped ? styles.equippedButton : styles.actionButton}
                            textStyle={styles.actionButtonText}
                        />
                    ) : (
                        <CustomButton
                            title={`Купить (${item.price})`}
                            onPress={() => handleBuySkin(item)}
                            disabled={gameData ? gameData.coins < item.price : true}
                            textStyle={styles.actionButtonText}
                        />
                    )}
                </View>

                {/* Иконка замка для заблокированных */}
                {!item.unlocked && (
                    <View style={styles.lockedIconContainer}>
                        <CustomText style={styles.lockedIcon}>🔒</CustomText>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <BackgroundWithStars>
            <View style={styles.container}>
                <CustomText style={styles.title}>🎮 Магазин скинов</CustomText>

                <View style={styles.coinsContainer}>
                    <CustomText style={styles.coinsText}>
                        Ваши монеты: <CustomText style={styles.coinsValue}>{gameData?.coins || 0}</CustomText>
                    </CustomText>
                </View>

                <FlatList
                    data={skins}
                    renderItem={renderSkinItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                />

                <View style={styles.selectedSkinInfo}>
                    <CustomText style={styles.selectedSkinTitle}>
                        Выбранный скин: {skins.find(s => s.id === selectedSkin)?.name || 'Космонавт'}
                    </CustomText>
                    <CustomText style={styles.hintText}>
                        💡 Нажмите на скин для предпросмотра
                    </CustomText>
                </View>
            </View>
        </BackgroundWithStars>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 28,
        color: '#00FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    coinsContainer: {
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#00FFFF',
    },
    coinsText: {
        color: '#FFF',
        fontSize: 18,
        textAlign: 'center',
    },
    coinsValue: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 22,
    },
    listContainer: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    skinCard: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 15,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        position: 'relative',
        minHeight: 200,
    },
    selectedSkinCard: {
        borderColor: '#00FFFF',
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        transform: [{ scale: 1.02 }],
    },
    equippedSkinCard: {
        borderColor: '#00FF00',
        backgroundColor: 'rgba(0, 255, 0, 0.05)',
    },
    skinImageContainer: {
        width: 80,
        height: 80,
        marginBottom: 10,
        position: 'relative',
    },
    skinImage: {
        width: '100%',
        height: '100%',
    },
    lockedSkinImage: {
        opacity: 0.5,
        filter: 'grayscale(100%)', // Делаем изображение черно-белым
    },
    equippedOverlay: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#00FF00',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    equippedText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skinName: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    lockedSkinName: {
        color: '#888',
    },
    priceText: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    unlockedPrice: {
        color: '#00FF00',
    },
    actionContainer: {
        width: '100%',
        marginTop: 'auto',
        zIndex: 20, // Кнопка сверху всего
        position: 'relative',
    },
    actionButton: {
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: '#00FFFF',
    },
    buyButton: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        borderColor: '#FFD700',
    },
    equippedButton: {
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        borderColor: '#00FF00',
    },
    disabledButton: {
        opacity: 0.5,
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Изменяем оверлей на иконку замка поверх изображения
    lockedIconContainer: {
        position: 'absolute',
        top: 30, // Центрируем над изображением
        left: '50%',
        transform: [{ translateX: -20 }],
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 20,
        zIndex: 5, // Ниже кнопки, но выше изображения
    },
    lockedIcon: {
        fontSize: 24,
        color: '#FFF',
    },
    // Убираем старый оверлей
    lockedOverlay: {
        display: 'none',
    },
    lockedText: {
        display: 'none',
    },
    selectedSkinInfo: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    selectedSkinTitle: {
        color: '#00FFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    hintText: {
        color: '#AAA',
        fontSize: 12,
        textAlign: 'center',
    },
});

export default ShopScreen;