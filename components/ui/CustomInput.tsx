// Переиспользуемый компонент ввода текста для настроек, аутентификации или других экранов. 
// Поддерживает плейсхолдер, тип ввода и обработчик изменений.
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

interface CustomInputProps {
    placeholder: string;
    value?: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({ placeholder, value, onChangeText, secureTextEntry = false }) => {
    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        margin: 10,
        width: '80%',
    },
});

export default CustomInput;