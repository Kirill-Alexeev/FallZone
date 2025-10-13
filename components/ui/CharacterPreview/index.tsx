import React from 'react';
import { View } from 'react-native';
import PlayerDefaultIdle from '../../../assets/sprites/characters/player_default_idle.png';
import { characterPreviewStyles } from './CharacterPreview.styles';
import IdleAnimation from './IdleAnimation';

const CharacterPreview = () => {
    return (
        <View style={characterPreviewStyles.container}>
            <IdleAnimation
                spriteWidth={30}     // Новая ширина кадра
                spriteHeight={42}    // Высота
                frames={4}           // 4 кадра
                frameRate={5}        // Скорость анимации (3 кадра в секунду)
                spriteSource={PlayerDefaultIdle}
                scale={3}            // Масштаб
                gap={1}              // Промежуток 1px
                style={characterPreviewStyles.animation}
            />
        </View>
    );
};

export default CharacterPreview;