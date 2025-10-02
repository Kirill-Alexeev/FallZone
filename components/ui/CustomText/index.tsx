// Переиспользуемый компонент текста с неоновым стилем. Для логотипов, заголовков и т.д.
// Обертка над Text с дефолтными стилями, переопределяемыми через пропсы.

import React from 'react';
import { Text, TextStyle } from 'react-native';
import { customTextStyles } from './CustomText.styles';

interface CustomTextProps {
    children: React.ReactNode;
    style?: TextStyle;
    fontSize?: number;
}

const CustomText: React.FC<CustomTextProps> = ({ children, style, fontSize = 16 }) => {
    return (
        <Text style={[customTextStyles.text, { fontSize }, style]}>
            {children}
        </Text>
    );
};

export default CustomText;