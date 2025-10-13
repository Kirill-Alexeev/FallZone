import React, { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

interface IdleAnimationProps {
    spriteWidth: number;
    spriteHeight: number;
    frames: number;
    frameRate?: number;
    spriteSource: ImageSourcePropType;
    scale?: number;
    gap?: number;
    style?: any;
}

const IdleAnimation: React.FC<IdleAnimationProps> = ({
    spriteWidth = 30,
    spriteHeight = 42,
    frames = 4,
    frameRate = 4,
    spriteSource,
    scale = 3,
    gap = 1,
    style
}) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % frames);
        }, 1000 / frameRate);

        return () => clearInterval(interval);
    }, [frameRate, frames]);

    // Ширина одного кадра с учетом промежутка
    const frameWidthWithGap = (spriteWidth + gap) * scale;
    // Ширина контейнера
    const containerWidth = spriteWidth * scale;
    const containerHeight = spriteHeight * scale;
    
    // ПРАВИЛЬНЫЙ РАСЧЕТ: 
    // (frames - 1) промежутков между кадрами + frames * spriteWidth
    const totalSheetWidth = ((spriteWidth * frames) + (gap * (frames - 1))) * scale;

    return (
        <View style={[styles.container, { width: containerWidth, height: containerHeight }, style]}>
            <View style={[styles.mask, { width: containerWidth, height: containerHeight }]}>
                <Image 
                    source={spriteSource}
                    style={{
                        width: totalSheetWidth,
                        height: spriteHeight * scale,
                        left: -currentFrame * frameWidthWithGap
                    }}
                    resizeMode="stretch"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    mask: {
        overflow: 'hidden',
        position: 'relative',
    },
});

export default IdleAnimation;