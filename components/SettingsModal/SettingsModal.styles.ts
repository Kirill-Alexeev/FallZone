// components/SettingsScreen/SettingsModal.styles.ts
import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const settingsModalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        height: '80%',
        borderWidth: 3,
        borderColor: '#00FFFF',
    },
    title: {
        fontSize: 28,
        color: '#00FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 5,
    },
    tabButton: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 2,
    },
    tabButtonActive: {
        flex: 1,
        backgroundColor: '#00FFFF',
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 2,
    },
    tabButtonText: {
        color: '#00FFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tabButtonTextActive: {
        color: '#1a1a2e',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    list: {
        flex: 1,
        marginBottom: 10,
    },
    sectionHeader: {
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        padding: 12,
        borderRadius: 8,
        marginVertical: 5,
    },
    sectionTitle: {
        fontSize: 18,
        color: '#00FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    statLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        flex: 1,
    },
    statValue: {
        fontSize: 14,
        color: '#00FFFF',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
        borderWidth: 2,
        borderColor: '#FF4444',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 10,
    },
    closeButtonText: {
        color: '#FF4444',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});