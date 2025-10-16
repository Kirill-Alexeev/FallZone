// components/ui/ToggleSwitch.tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import CustomText from '../CustomText';
import { toggleSwitchStyles } from './ToggleSwitch.styles';

interface ToggleSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ value, onValueChange, label }) => {
    return (
        <View style={toggleSwitchStyles.container}>
            <CustomText style={toggleSwitchStyles.label}>{label}</CustomText>
            <TouchableOpacity
                style={[
                    toggleSwitchStyles.track,
                    value ? toggleSwitchStyles.trackOn : toggleSwitchStyles.trackOff
                ]}
                onPress={() => onValueChange(!value)}
            >
                <View
                    style={[
                        toggleSwitchStyles.thumb,
                        value ? toggleSwitchStyles.thumbOn : toggleSwitchStyles.thumbOff
                    ]}
                />
            </TouchableOpacity>
        </View>
    );
};

export default ToggleSwitch;