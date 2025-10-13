import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { obstacleStyles } from './Obstacle.styles';

interface ObstacleProps {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'comet' | 'asteroid' | 'drone' | 'wall';
    gap?: number;
}

const Obstacle: React.FC<ObstacleProps> = ({ x, y, width, height, type, gap }) => {
    const getObstacleSvg = (obstacleType: string, isTopPart: boolean = false) => {
        switch (obstacleType) {
            case 'comet':
                return `
                    <svg width="${width}" height="${height}" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="18" fill="url(#cometGradient)"/>
                        <path d="M35 5 L20 20 L25 15" stroke="white" stroke-width="2"/>
                        <defs>
                            <linearGradient id="cometGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#ff6b6b"/>
                                <stop offset="100%" stop-color="#ffa500"/>
                            </linearGradient>
                        </defs>
                    </svg>
                `;

            case 'asteroid':
                return `
                    <svg width="${width}" height="${height}" viewBox="0 0 60 60" fill="none">
                        <path d="M30 5 L55 15 L50 40 L25 55 L5 35 L10 10 Z" fill="#8b4513" stroke="#654321" stroke-width="2"/>
                        <circle cx="20" cy="20" r="3" fill="#a0522d"/>
                        <circle cx="40" cy="25" r="2" fill="#a0522d"/>
                        <circle cx="35" cy="40" r="4" fill="#a0522d"/>
                    </svg>
                `;

            case 'drone':
                return `
                    <svg width="${width}" height="${height}" viewBox="0 0 50 30" fill="none">
                        <rect x="5" y="10" width="40" height="10" rx="2" fill="#4a5568"/>
                        <circle cx="15" cy="25" r="3" fill="#2d3748"/>
                        <circle cx="35" cy="25" r="3" fill="#2d3748"/>
                        <rect x="20" y="5" width="10" height="5" fill="#718096"/>
                        <circle cx="25" cy="15" r="2" fill="#00ff00"/>
                    </svg>
                `;

            // В функции getObstacleSvg для стен:
            case 'wall':
                if (isTopPart) {
                    return `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
                <rect width="${width}" height="${height}" fill="#2d3748" stroke="#4a5568" stroke-width="3"/>
                <rect x="${width / 2 - 15}" y="${height - 25}" width="30" height="15" fill="#1a202c" stroke="#4a5568" stroke-width="2"/>
                <text x="${width / 2}" y="${height - 10}" text-anchor="middle" fill="white" font-size="8">ПРОЛЕТЕЙ</text>
            </svg>
        `;
                } else {
                    const bottomHeight = 1000; // Высота нижней части
                    return `
            <svg width="${width}" height="${bottomHeight}" viewBox="0 0 ${width} ${bottomHeight}" fill="none">
                <rect y="0" width="${width}" height="${bottomHeight}" fill="#2d3748" stroke="#4a5568" stroke-width="3"/>
                <rect x="${width / 2 - 15}" y="0" width="30" height="15" fill="#1a202c" stroke="#4a5568" stroke-width="2"/>
                <text x="${width / 2}" y="12" text-anchor="middle" fill="white" font-size="8">ПРОЛЕТЕЙ</text>
            </svg>
        `;
                }

            default:
                return `
                    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
                        <rect width="${width}" height="${height}" fill="#666" stroke="#333" stroke-width="2"/>
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
                    <SvgXml xml={getObstacleSvg(type, true)} width="100%" height="100%" />
                </View>

                {/* Нижняя часть стены */}
                <View style={[
                    obstacleStyles.obstacle,
                    { left: x, top: y + height + gap, width: width, height: 1000 } // 1000 - достаточная высота для нижней части
                ]}>
                    <SvgXml xml={getObstacleSvg(type, false)} width="100%" height="100%" />
                </View>
            </>
        );
    }

    return (
        <View style={[
            obstacleStyles.obstacle,
            { left: x, top: y, width: width, height: height }
        ]}>
            <SvgXml xml={getObstacleSvg(type)} width="100%" height="100%" />
        </View>
    );
};

export default Obstacle;