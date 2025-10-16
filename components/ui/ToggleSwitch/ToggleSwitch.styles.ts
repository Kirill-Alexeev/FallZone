// components/ui/ToggleSwitch.styles.ts
import { StyleSheet } from 'react-native';

export const toggleSwitchStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    label: {
        fontSize: 16,
        color: '#FFFFFF',
        flex: 1,
    },
    track: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 2,
        justifyContent: 'center',
    },
    trackOn: {
        backgroundColor: '#00FFFF',
    },
    trackOff: {
        backgroundColor: '#666666',
    },
    thumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    thumbOn: {
        alignSelf: 'flex-end',
    },
    thumbOff: {
        alignSelf: 'flex-start',
    },
});