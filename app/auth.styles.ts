// app/auth.styles.ts
import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        padding: 20,
    },
    title: {
        fontSize: 36,
        marginBottom: 10,
        color: '#00FFFF',
    },
    subtitle: {
        fontSize: 20,
        marginBottom: 30,
        color: '#FFF',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        color: '#FFF',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.3)',
    },
    button: {
        width: '100%',
        marginTop: 20,
        backgroundColor: '#00FFFF',
    },
    linkButton: {
        width: '100%',
        marginTop: 15,
        backgroundColor: 'transparent',
    },
    linkText: {
        color: '#00FFFF',
        fontSize: 14,
    },
    errorText: {
        color: '#FF4444',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center' as const,
    },
});