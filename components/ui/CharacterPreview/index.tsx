// Компонент для превью текущего персонажа.
// Image с источником из storage (текущий скин), заглушка для дефолтного.

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