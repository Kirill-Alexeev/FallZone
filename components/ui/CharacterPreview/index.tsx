// components/ui/CharacterPreview.tsx
import React from 'react';
import { View } from 'react-native';
import { useGame } from '../../../context/GameContext';
import { characterPreviewStyles } from './CharacterPreview.styles';
import IdleAnimation from './IdleAnimation';

const CharacterPreview = () => {
    const { gameData, getCurrentSkin } = useGame();

    // Получаем текущий скин
    const currentSkin = getCurrentSkin();

    // Выбираем изображение в зависимости от скина
    const getSpriteSource = () => {
        const skinId = currentSkin?.id || 'default';

        switch (skinId) {
            case 'green':
                return require('../../../assets/sprites/characters/player_green_idle.png');
            case 'red':
                return require('../../../assets/sprites/characters/player_red_idle.png');
            case 'gold':
                return require('../../../assets/sprites/characters/player_gold_idle.png');
            default:
                return require('../../../assets/sprites/characters/player_default_idle.png');
        }
    };

    return (
        <View style={characterPreviewStyles.container}>
            <IdleAnimation
                spriteWidth={30}
                spriteHeight={42}
                frames={4}
                frameRate={5}
                spriteSource={getSpriteSource()}
                scale={3}
                gap={1}
                style={characterPreviewStyles.animation}
            />
        </View>
    );
};

export default CharacterPreview;