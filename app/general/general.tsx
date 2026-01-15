import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    ScrollView, // Lisätty ScrollView ehtoja varten
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    lightGrayBackground: '#F8F9FD',
    cardBackground: '#FFFFFF',
    borderColor: '#EFEFEF',
    arrowColor: '#9CA3AF',
    primary: '#00c2ff',
};

const LANGUAGES = [
    { id: 'fi', label: 'Suomi', flag: '🇫🇮' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'sv', label: 'Svenska', flag: '🇸🇪' },
];

const PAYMENT_METHODS = [
    { id: 'card', label: 'Korttimaksu', icon: 'card-outline', color: '#4A90E2' },
    { id: 'apple', label: 'Apple Pay', icon: 'logo-apple', color: '#000000' },
    { id: 'google', label: 'Google Pay', icon: 'logo-google', color: '#EA4335' },
    {
        id: 'mobilepay',
        label: 'MobilePay',
        imageUrl: 'https://avatars.githubusercontent.com/u/22961759?s=280&v=4'
    },
];

export default function GeneralSettingsScreen() {
    const router = useRouter();

    const [langModalVisible, setLangModalVisible] = useState(false);
    const [payModalVisible, setPayModalVisible] = useState(false);
    const [termsModalVisible, setTermsModalVisible] = useState(false); // Uusi tila ehdoille

    const [selectedLang, setSelectedLang] = useState('fi');
    const [selectedPayment, setSelectedPayment] = useState('card');

    const performLogout = async () => {
        try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;
            router.replace('/auth/login');
        } catch (err) {
            console.error('Logout error:', err);
            Alert.alert('Virhe', 'Uloskirjautuminen epäonnistui');
        }
    };

    const handleLogoutConfirmation = () => {
        Alert.alert("Kirjaudu ulos", "Haluatko varmasti kirjautua ulos?", [
            { text: "Peruuta", style: "cancel" },
            { text: "Kirjaudu ulos", onPress: performLogout, style: "destructive" }
        ]);
    };

    const handleOrderHistory = () => {
        router.push('/general/orders');
    };

    const handleGoBack = () => {
        router.push('/profile');
    };

    const versionNumber = Constants.expoConfig?.version;

    const SettingsItem = ({ label, onPress, isLast = false, rightElement }: { label: string, onPress: () => void, isLast?: boolean, rightElement?: React.ReactNode }) => (
        <TouchableOpacity
            style={[styles.settingsItem, isLast && styles.settingsItemLast]}
            onPress={onPress}
        >
            <Text style={styles.settingsItemText}>{label}</Text>
            <View style={styles.rightContainer}>
                {rightElement}
                <Feather name="chevron-right" size={20} color={COLORS.arrowColor} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack}>
                    <Feather name="chevron-left" size={28} color={COLORS.darkText} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Yleiset</Text>
                    <Text style={styles.versionText}>v{versionNumber}</Text>
                </View>
                <TouchableOpacity onPress={handleLogoutConfirmation}>
                    <FontAwesome5 name="sign-out-alt" size={22} color="#E85D5D" />
                </TouchableOpacity>
            </View>

            <View style={styles.settingsList}>
                <SettingsItem
                    label="Kieli"
                    onPress={() => setLangModalVisible(true)}
                    rightElement={<Text style={styles.selectedTabText}>{LANGUAGES.find(l => l.id === selectedLang)?.label}</Text>}
                />
                <SettingsItem
                    label="Maksutavat"
                    onPress={() => setPayModalVisible(true)}
                    rightElement={<Text style={styles.selectedTabText}>{PAYMENT_METHODS.find(p => p.id === selectedPayment)?.label}</Text>}
                />
                <SettingsItem label="Tilaushistoria" onPress={handleOrderHistory} />
                <SettingsItem
                    label="Käyttöehdot"
                    onPress={() => setTermsModalVisible(true)}
                    isLast={true}
                />
            </View>

            {/* KIELI MODAL */}
            <Modal animationType="slide" transparent={true} visible={langModalVisible} onRequestClose={() => setLangModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Valitse kieli</Text>
                            <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                                <Ionicons name="close" size={28} color={COLORS.darkText} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={LANGUAGES}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.modalItem} onPress={() => { setSelectedLang(item.id); setLangModalVisible(false); }}>
                                    <View style={styles.modalItemRow}>
                                        <Text style={styles.flagText}>{item.flag}</Text>
                                        <Text style={[styles.modalItemLabel, selectedLang === item.id && styles.selectedLabel]}>{item.label}</Text>
                                    </View>
                                    {selectedLang === item.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* MAKSUTAPA MODAL */}
            <Modal animationType="slide" transparent={true} visible={payModalVisible} onRequestClose={() => setPayModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Maksutapa</Text>
                            <TouchableOpacity onPress={() => setPayModalVisible(false)}>
                                <Ionicons name="close" size={28} color={COLORS.darkText} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={PAYMENT_METHODS}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.modalItem} onPress={() => { setSelectedPayment(item.id); setPayModalVisible(false); }}>
                                    <View style={styles.modalItemRow}>
                                        {item.id === 'mobilepay' ? (
                                            <Image source={{ uri: item.imageUrl }} style={styles.paymentImage} />
                                        ) : (
                                            <Ionicons name={item.icon as any} size={24} color={item.color} style={{ marginRight: 15 }} />
                                        )}
                                        <Text style={[styles.modalItemLabel, selectedPayment === item.id && styles.selectedLabel]}>{item.label}</Text>
                                    </View>
                                    {selectedPayment === item.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* KÄYTTÖEHDOT MODAL */}
            <Modal animationType="slide" transparent={true} visible={termsModalVisible} onRequestClose={() => setTermsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Käyttöehdot</Text>
                            <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
                                <Ionicons name="close" size={28} color={COLORS.darkText} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.termsText}>
                                <Text style={styles.termsSubTitle}>1. Yleistä{"\n"}</Text>
                                Tervetuloa käyttämään sovellustamme. Käyttämällä tätä palvelua sitoudut noudattamaan näitä käyttöehtoja.{"\n\n"}

                                <Text style={styles.termsSubTitle}>2. Palvelun kuvaus{"\n"}</Text>
                                Sovellus tarjoaa pesulapalveluiden tilausjärjestelmän. Pidätämme oikeuden muuttaa palvelun sisältöä.{"\n\n"}

                                <Text style={styles.termsSubTitle}>3. Tilaukset ja maksut{"\n"}</Text>
                                Kaikki tilaukset ovat sitovia. Maksut käsitellään valitsemallasi maksutavalla tilauksen yhteydessä.{"\n\n"}

                                <Text style={styles.termsSubTitle}>4. Peruutusehdot{"\n"}</Text>
                                Peruutukset on tehtävä viimeistään 24 tuntia ennen sovittua noutoaikaa.{"\n\n"}

                                <Text style={styles.termsSubTitle}>5. Vastuunrajoitus{"\n"}</Text>
                                Emme vastaa vahingoista, jotka johtuvat pesuohjeiden puutteellisuudesta tai väärästä ilmoituksesta.{"\n\n"}

                                <Text style={styles.termsSubTitle}>6. Tietosuoja{"\n"}</Text>
                                Käsittelemme henkilötietojasi tietosuojaselosteemme mukaisesti.
                            </Text>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setTermsModalVisible(false)}
                        >
                            <Text style={styles.closeModalButtonText}>Olen lukenut ehdot</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.lightGrayBackground },
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
    headerTitleContainer: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText },
    versionText: { fontSize: 12, color: COLORS.arrowColor, marginTop: 2 },
    settingsList: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 12,
        margin: 20,
        overflow: 'hidden',
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
    settingsItemLast: { borderBottomWidth: 0 },
    settingsItemText: { fontSize: 16, color: COLORS.darkText, fontWeight: '500' },
    rightContainer: { flexDirection: 'row', alignItems: 'center' },
    selectedTabText: { marginRight: 8, color: COLORS.arrowColor, fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '50%'
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkText },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    modalItemRow: { flexDirection: 'row', alignItems: 'center' },
    flagText: { fontSize: 24, marginRight: 15 },
    modalItemLabel: { fontSize: 16, color: COLORS.darkText },
    selectedLabel: { fontWeight: 'bold', color: COLORS.primary },
    paymentImage: {
        width: 24,
        height: 24,
        marginRight: 15,
        borderRadius: 5
    },
    // Uudet tyylit käyttöehdoille
    termsText: {
        fontSize: 14,
        color: COLORS.darkText,
        lineHeight: 22,
    },
    termsSubTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeModalButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    closeModalButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    }
});