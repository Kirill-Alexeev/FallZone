import { Platform, StyleSheet } from 'react-native';

export const homeScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
        paddingBottom: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        color: '#00FFFF',
        fontWeight: 'bold',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
    },
    statsDisplay: {
        position: 'absolute',
        bottom: 60,
        alignSelf: 'center',
        zIndex: 10,
        padding: 10,
        borderRadius: 5,
    },
});