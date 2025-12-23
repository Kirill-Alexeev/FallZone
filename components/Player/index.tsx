// components/Player.tsx (если он у тебя есть)
import React from 'react';
import { Image, View } from 'react-native';
import { useGame } from '../../context/GameContext';

interface PlayerProps {
    x: number;
    y: number;
    size: number;
    rotation: number;
    // Убираем character, т.к. теперь используем скины из контекста
}

const Player: React.FC<PlayerProps> = ({ x, y, size, rotation }) => {
    const { getCurrentSkin } = useGame();

    const currentSkin = getCurrentSkin();

    // Выбираем статическое изображение в зависимости от скина
    const getPlayerImage = () => {
        const skinId = currentSkin?.id || 'default';

        switch (skinId) {
            case 'green':
                return require('../../assets/sprites/characters/player_green_static.png');
            case 'red':
                return require('../../assets/sprites/characters/player_red_static.png');
            case 'gold':
                return require('../../assets/sprites/characters/player_gold_static.png');
            default:
                return require('../../assets/sprites/characters/player_default_static.png');
        }
    };

    return (
        <View
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: size,
                height: size,
                transform: [{ rotate: `${rotation}deg` }],
            }}
        >
            <Image
                source={getPlayerImage()}
                style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain',
                }}
            />
        </View>
    );
};

export default Player;