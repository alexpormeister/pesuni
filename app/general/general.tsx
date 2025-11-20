import { Feather, FontAwesome5 } from '@expo/vector-icons';

import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// LISÄTTY: Tarvitaan Supabase uloskirjautumiseen
import { supabase } from '../../lib/supabase';

// Vaihdetaan värit vastaamaan kuvaa
const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    lightGrayBackground: '#F8F9FD',
    cardBackground: '#FFFFFF',
    borderColor: '#EFEFEF',
    arrowColor: '#9CA3AF',
    accentBlue: '#5abaff',
    redAccent: '#FF4500',
    buttonBackground: '#E0E0E0',
};

export default function GeneralSettingsScreen() {
    const router = useRouter();

    // 1. ULOSKIRJAUTUMISLOGIIKKA
    const performLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Ohjaa käyttäjä kirjautumisnäyttöön onnistuneen uloskirjautumisen jälkeen
            router.replace('/auth/login');

        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Uloskirjautuminen epäonnistui', error.message);
            } else {
                Alert.alert('Uloskirjautuminen epäonnistui', 'Yritä myöhemmin uudelleen.');
            }
        }
    };

    // 2. VAHVISTUSKYSELY
    const handleLogoutConfirmation = () => {
        Alert.alert(
            "Vahvista uloskirjautuminen",
            "",
            [
                { text: "Peruuta", style: "cancel" },
                {
                    text: "Kirjaudu ulos",
                    onPress: performLogout, // KUTSUU ULOSKIRJAUTUMISEN
                    style: "destructive"
                }
            ]
        );
    };

    // Funktio, joka ohjaa käyttäjän tilaushistoriaan
    const handleOrderHistory = () => {
        router.push({
            pathname: '/orders',
            params: { initialTab: 'History' }
        });
    };

    // Funktio, joka ohjaa käyttäjän takaisin profile-sivulle
    const handleGoBack = () => {
        router.push('/profile');
    };

    const versionNumber = Constants.expoConfig?.version;

    // Apukomponentti listan kohteille
    const SettingsItem = ({ label, onPress, isLast = false, isDanger = false }: { label: string, onPress: () => void, isLast?: boolean, isDanger?: boolean }) => (
        <TouchableOpacity
            style={[
                styles.settingsItem,
                isLast ? styles.settingsItemLast : null,
                isDanger ? { backgroundColor: COLORS.redAccent } : null
            ]}
            onPress={onPress}
        >
            <Text style={[styles.settingsItemText, isDanger ? { color: COLORS.white } : null]}>{label}</Text>
            <Feather name="chevron-right" size={20} color={COLORS.arrowColor} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header - Kuvan mukainen */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack}>
                    <Feather name="chevron-left" size={28} color={COLORS.darkText} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Yleiset</Text>
                    <Text style={styles.versionText}>v{versionNumber}</Text>
                </View>
                {/* 3. ULOSKIRJAUTUMISNAPPI KUTSUU VAHVISTUKSEN */}
                <TouchableOpacity onPress={handleLogoutConfirmation}>
                    <FontAwesome5 name="sign-out-alt" size={24} color="#E85D5D" />
                </TouchableOpacity>
            </View>

            {/* Asetuslista */}
            <View style={styles.settingsList}>
                <SettingsItem label="Kieli" onPress={() => Alert.alert("Kieli", "Kieliasetukset")} />
                <SettingsItem label="Maksutavat" onPress={() => Alert.alert("Maksutavat", "Maksutapojen hallinta")} />
                <SettingsItem label="Tilaushistoria" onPress={handleOrderHistory} />
                <SettingsItem label="Käyttöehdot" onPress={() => Alert.alert("Käyttöehdot", "Avaa käyttöehdot")} isLast={true} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGrayBackground,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    versionText: {
        fontSize: 12,
        color: COLORS.arrowColor,
        marginTop: 2,
    },
    settingsList: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 12,
        margin: 20,
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
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    settingsItemLast: {
        borderBottomWidth: 0,
    },
    settingsItemText: {
        fontSize: 16,
        color: COLORS.darkText,
        fontWeight: '500',
    },
});