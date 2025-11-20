import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    lightGrayBackground: '#F8F9FD',
    cardBackground: '#FFFFFF',
    borderColor: '#EFEFEF',
    arrowColor: '#9CA3AF',
    primary: '#00c2ff',
    buttonBackground: '#E0E0E0',
};

const NOTIFICATION_SETTINGS = [
    {
        title: "Tilaukset",
        data: [
            { id: 'order_status', label: 'Tilauksen tilan päivitykset' },
            { id: 'delivery_update', label: 'Toimituksen arvioitu saapuminen' },
        ]
    },
    {
        title: "Yleiset & Markkinointi",
        data: [
            { id: 'marketing_offers', label: 'Tarjoukset ja erikoisalennukset' },
            { id: 'app_news', label: 'Sovelluksen uutiset ja parannukset' },
            { id: 'reminders', label: 'Muistutus käyttämättömistä hyvityksistä', isLast: true },
        ]
    },
];

interface ToggleItemProps {
    label: string;
    settingId: string;
    isEnabled: boolean;
    onToggle: (id: string, value: boolean) => void;
    isLast?: boolean;
}

const NotificationToggleItem: React.FC<ToggleItemProps> = ({ label, settingId, isEnabled, onToggle, isLast }) => (
    <View style={[styles.settingsItem, isLast ? styles.settingsItemLast : null]}>
        <Text style={styles.settingsItemText}>{label}</Text>
        <Switch
            trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
            thumbColor={COLORS.white}
            onValueChange={(value) => onToggle(settingId, value)}
            value={isEnabled}
        />
    </View>
);

export default function NotificationSettingsScreen() {
    const router = useRouter();

    const [settingsState, setSettingsState] = useState({
        order_status: true,
        delivery_update: true,
        marketing_offers: false,
        app_news: true,
        reminders: false,
    });

    const handleToggle = (id: string, value: boolean) => {
        setSettingsState(prev => ({
            ...prev,
            [id]: value,
        }));
        console.log(`Päivitettiin ${id}: ${value ? 'PÄÄLLÄ' : 'POIS'}`);
    };

    const handleGoBack = () => {
        router.push('/profile');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                    <Feather name="chevron-left" size={24} color={COLORS.darkText} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ilmoitukset</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {NOTIFICATION_SETTINGS.map((section, sectionIndex) => (
                    <View key={section.title} style={styles.settingsGroup}>
                        <Text style={styles.groupTitle}>{section.title}</Text>

                        <View style={styles.settingsList}>
                            {section.data.map((setting, settingIndex) => (
                                <NotificationToggleItem
                                    key={setting.id}
                                    label={setting.label}
                                    settingId={setting.id}
                                    isEnabled={settingsState[setting.id as keyof typeof settingsState]}
                                    onToggle={handleToggle}
                                    isLast={settingIndex === section.data.length - 1}
                                />
                            ))}
                        </View>
                    </View>
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGrayBackground,
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === 'ios' ? 15 : 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.buttonBackground,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    settingsGroup: {
        marginBottom: 15,
    },
    groupTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.arrowColor,
        marginBottom: 8,
        marginLeft: 5,
        textTransform: 'uppercase',
    },
    settingsList: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        backgroundColor: COLORS.cardBackground,
    },
    settingsItemLast: {
        borderBottomWidth: 0,
    },
    settingsItemText: {
        fontSize: 16,
        color: COLORS.darkText,
        fontWeight: '500',
        flex: 1,
        marginRight: 10,
    },
});