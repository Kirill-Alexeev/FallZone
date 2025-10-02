// Показывает текущий выбранный скин персонажа
// (Динамическая загрузка текущего скина из хранилища
// Система смены персонажа)

import React from 'react';
import DefaultSvg from '../../../assets/sprites/characters/default.svg';
import { characterPreviewStyles } from './CharacterPreview.styles';

const CharacterPreview = () => {
    return (
        <DefaultSvg
            width={characterPreviewStyles.image.width}
            height={characterPreviewStyles.image.height}
        />
    );
};

export default CharacterPreview;