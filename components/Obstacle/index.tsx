import React from 'react';
import { Image, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { obstacleStyles } from './Obstacle.styles';

interface ObstacleProps {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'asteroid' | 'drone' | 'wall';
    gap?: number;
}

const Obstacle: React.FC<ObstacleProps> = ({ x, y, width, height, type, gap }) => {
    const getObstacleImage = (obstacleType: string) => {
        switch (obstacleType) {
            case 'asteroid':
                return require('../../assets/sprites/obstacles/asteroid.png');
            case 'drone':
                return require('../../assets/sprites/obstacles/drone.png');
            default:
                return require('../../assets/sprites/obstacles/asteroid.png');
        }
    };

    const getWallSvg = (isTopPart: boolean = false) => {
        if (isTopPart) {
            return `
                <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
                    <defs>
                        <linearGradient id="wallTopGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#1a365d"/>
                            <stop offset="50%" stop-color="#2d3748"/>
                            <stop offset="100%" stop-color="#4a5568"/>
                        </linearGradient>
                        <pattern id="techPatternTop" patternUnits="userSpaceOnUse" width="20" height="20">
                            <rect width="20" height="20" fill="none"/>
                            <path d="M0 0 L20 0 M0 5 L20 5 M0 10 L20 10 M0 15 L20 15" stroke="#00ffff" stroke-width="1" opacity="0.3"/>
                            <path d="M0 0 L0 20 M5 0 L5 20 M10 0 L10 20 M15 0 L15 20" stroke="#00ffff" stroke-width="1" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="${width}" height="${height}" fill="url(#wallTopGradient)" stroke="#00ffff" stroke-width="2"/>
                    <rect width="${width}" height="${height}" fill="url(#techPatternTop)" opacity="0.2"/>
                    
                    <!-- Энергетическое свечение внизу -->
                    <rect x="0" y="${height - 10}" width="${width}" height="10" fill="url(#wallTopGradient)" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
                    </rect>
                    <rect x="0" y="${height - 5}" width="${width}" height="2" fill="#00ffff">
                        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                    </rect>
                </svg>
            `;
        } else {
            const bottomHeight = 1000;
            return `
                <svg width="${width}" height="${bottomHeight}" viewBox="0 0 ${width} ${bottomHeight}" fill="none">
                    <defs>
                        <linearGradient id="wallBottomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#4a5568"/>
                            <stop offset="50%" stop-color="#2d3748"/>
                            <stop offset="100%" stop-color="#1a365d"/>
                        </linearGradient>
                        <pattern id="techPatternBottom" patternUnits="userSpaceOnUse" width="20" height="20">
                            <rect width="20" height="20" fill="none"/>
                            <path d="M0 0 L20 0 M0 5 L20 5 M0 10 L20 10 M0 15 L20 15" stroke="#00ffff" stroke-width="1" opacity="0.3"/>
                            <path d="M0 0 L0 20 M5 0 L5 20 M10 0 L10 20 M15 0 L15 20" stroke="#00ffff" stroke-width="1" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect y="0" width="${width}" height="${bottomHeight}" fill="url(#wallBottomGradient)" stroke="#00ffff" stroke-width="2"/>
                    <rect y="0" width="${width}" height="${bottomHeight}" fill="url(#techPatternBottom)" opacity="0.2"/>
                    
                    <!-- Энергетическое свечение вверху -->
                    <rect x="0" y="0" width="${width}" height="10" fill="url(#wallBottomGradient)" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
                    </rect>
                    <rect x="0" y="8" width="${width}" height="2" fill="#00ffff">
                        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                    </rect>
                </svg>
            `;
        }
    };

    if (type === 'wall' && gap) {
        return (
            <>
                {/* Верхняя часть стены */}
                <View style={[
                    obstacleStyles.obstacle,
                    { left: x, top: y, width: width, height: height }
                ]}>
                    <SvgXml xml={getWallSvg(true)} width="100%" height="100%" />
                </View>

                {/* Нижняя часть стены */}
                <View style={[
                    obstacleStyles.obstacle,
                    { left: x, top: y + height + gap, width: width, height: 1000 }
                ]}>
                    <SvgXml xml={getWallSvg(false)} width="100%" height="100%" />
                </View>
            </>
        );
    }

    // Для всех остальных препятствий используем PNG
    return (
        <View style={[
            obstacleStyles.obstacle,
            { left: x, top: y, width: width, height: height }
        ]}>
            <Image
                source={getObstacleImage(type)}
                style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain'
                }}
            />
        </View>
    );
};

export default Obstacle;