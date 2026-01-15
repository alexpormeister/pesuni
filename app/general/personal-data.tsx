import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../../lib/supabase';

import { selectUserProfile, updateProfileFields, UserProfile } from '../../redux/profileSlice';
import { fetchUserProfile } from '../../redux/profileThunks';

const COLORS = {
    primary: '#00c2ff',
    white: '#ffffff',
    gray: '#f5f5f5',
    dark: '#333333',
    textGray: '#666666',
    border: '#e0e0e0',
    danger: '#FF3B30'
};

const CALLING_CODES: { [key: string]: string } = {
    'FI': '358',
    'US': '1',
    'SE': '46',
    'NO': '47',
    'DE': '49',
};

const getInitialCountryCode = (phone: string | null | undefined): CountryCode => {
    if (!phone) return 'FI';
    for (const [code, prefix] of Object.entries(CALLING_CODES)) {
        if (phone.startsWith(`+${prefix}`)) return code as CountryCode;
    }
    return 'FI';
};

export default function PersonalInfoScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const reduxProfile = useSelector(selectUserProfile);
    const profile = reduxProfile || {};

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<'name' | 'email' | 'phone' | 'address' | null>(null);

    const [tempFirstName, setTempFirstName] = useState('');
    const [tempLastName, setTempLastName] = useState('');
    const [tempValue, setTempValue] = useState('');

    const [countryCode, setCountryCode] = useState<CountryCode>('FI');
    const [countryPickerVisible, setCountryPickerVisible] = useState(false);

    useEffect(() => {
        dispatch(fetchUserProfile() as any).finally(() => setLoading(false));
    }, [dispatch]);

    // PersonalInfoScreen.tsx sisällä

    const handleSaveField = async () => {
        if (!profile || !editingField) return;
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Ei käyttäjää');

            let updates: Partial<UserProfile> = {};

            // ... muut kentät säilyvät ennallaan ...

            // KORJAUS: Käytetään .update().eq() jotta ei herjaa puuttuvasta sähköpostista
            const { error } = await supabase
                .from('profiles')
                .update({
                    updated_at: new Date().toISOString(),
                    ...updates,
                })
                .eq('user_id', user.id);

            if (error) throw error;

            dispatch(updateProfileFields(updates));
            setModalVisible(false);
            Alert.alert('Onnistui', 'Tiedot päivitetty.');
        } catch (error: any) {
            Alert.alert('Päivitys epäonnistui', error.message);
        } finally {
            setSaving(false);
        }
    };
    const handleDeleteAccount = async () => {
        Alert.alert(
            "Poista käyttäjätili",
            "Oletko varma? Kaikki tietosi, tilaushistoriasi ja asetuksesi poistetaan pysyvästi. Tätä ei voi peruuttaa.",
            [
                { text: "Peruuta", style: "cancel" },
                {
                    text: "Poista tili",
                    style: "destructive",
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            const { error } = await supabase.rpc('delete_user_account');
                            if (error) throw error;

                            // Kirjaudutaan ulos
                            await supabase.auth.signOut();

                            // Tyhjennetään navigointipino ja ohjataan juureen. 
                            // Tämä pakottaa Expo Routerin re-evaluoimaan auth-tilan.
                            router.dismissAll();
                            router.replace('/' as any);

                            Alert.alert("Tili poistettu", "Tiedostosi on poistettu järjestelmästä.");
                        } catch (err: any) {
                            console.error("Poistovirheen syy:", err);
                            Alert.alert("Virhe", "Tilin poistaminen epäonnistui. Ota yhteys tukeen.");
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (field: 'name' | 'email' | 'phone' | 'address') => {
        setEditingField(field);
        if (field === 'name') {
            setTempFirstName(profile.first_name || '');
            setTempLastName(profile.last_name || '');
        } else if (field === 'phone') {
            const fullPhone = profile.phone || '';
            const initialCountry = getInitialCountryCode(fullPhone);
            setCountryCode(initialCountry);
            const callingCodeStr = `+${CALLING_CODES[initialCountry] || ''}`;
            const numberPart = fullPhone.startsWith(callingCodeStr) ? fullPhone.substring(callingCodeStr.length) : fullPhone;
            setTempValue(numberPart);
        } else {
            setTempValue(profile[field] || '');
        }
        setModalVisible(true);
    };

    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <Feather name="chevron-left" size={28} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Henkilötiedot</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.infoList}>
                    <InfoItem label="Nimi" value={fullName} onPress={() => openEditModal('name')} />
                    <InfoItem label="Sähköposti" value={profile.email} onPress={() => openEditModal('email')} />
                    <InfoItem label="Osoite" value={profile.address} onPress={() => openEditModal('address')} />
                    <InfoItem label="Puhelinnumero" value={profile.phone} onPress={() => openEditModal('phone')} />
                </View>

                <View style={styles.dangerZone}>
                    <Text style={styles.dangerTitle}>Tilin hallinta</Text>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteAccount}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator color={COLORS.danger} />
                        ) : (
                            <>
                                <Feather name="trash-2" size={18} color={COLORS.danger} />
                                <Text style={styles.deleteButtonText}>Poista käyttäjätili</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.dangerNote}>
                        Tilin poistaminen poistaa kaikki henkilötiedot ja historiatiedot sovelluksesta.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Muokkaa tietoja</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><Feather name="x" size={24} color={COLORS.dark} /></TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            {editingField === 'name' ? (
                                <View>
                                    <Text style={styles.inputLabel}>Etunimi</Text>
                                    <TextInput style={styles.input} value={tempFirstName} onChangeText={setTempFirstName} placeholder="Etunimi" />
                                    <Text style={styles.inputLabel}>Sukunimi</Text>
                                    <TextInput style={styles.input} value={tempLastName} onChangeText={setTempLastName} placeholder="Sukunimi" />
                                </View>
                            ) : editingField === 'phone' ? (
                                <View style={styles.phoneInputContainer}>
                                    <TouchableOpacity onPress={() => setCountryPickerVisible(true)} style={styles.countryCodeButton}>
                                        <CountryPicker
                                            withFlag
                                            onSelect={({ cca2 }) => setCountryCode(cca2)}
                                            visible={countryPickerVisible}
                                            onClose={() => setCountryPickerVisible(false)}
                                            countryCode={countryCode}
                                        />
                                        <Text style={styles.countryCodeText}>+{CALLING_CODES[countryCode]}</Text>
                                    </TouchableOpacity>
                                    <TextInput style={[styles.input, styles.numberInput]} value={tempValue} onChangeText={setTempValue} keyboardType='phone-pad' />
                                </View>
                            ) : (
                                <TextInput style={styles.input} value={tempValue} onChangeText={setTempValue} placeholder="Syötä uusi arvo" />
                            )}
                        </View>
                        <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSaveField} disabled={saving}>
                            {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Tallenna</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const InfoItem = ({ label, value, onPress }: any) => (
    <TouchableOpacity style={styles.infoItem} onPress={onPress}>
        <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{value || 'Ei määritelty'}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={COLORS.textGray} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.gray },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.white },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
    content: { flex: 1, padding: 20 },
    infoList: { backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    infoItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray },
    infoTextContainer: { flex: 1, marginRight: 10 },
    infoLabel: { fontSize: 16, fontWeight: '600', color: COLORS.dark, marginBottom: 4 },
    infoValue: { fontSize: 14, color: COLORS.textGray },
    dangerZone: { marginTop: 30, paddingHorizontal: 5 },
    dangerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 12 },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.danger + '40'
    },
    deleteButtonText: { color: COLORS.danger, fontWeight: '700', fontSize: 16, marginLeft: 10 },
    dangerNote: { fontSize: 13, color: COLORS.textGray, marginTop: 10, lineHeight: 18 },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 300 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.dark },
    modalBody: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.dark, marginBottom: 8, marginTop: 10 },
    input: { backgroundColor: COLORS.gray, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, fontSize: 16, color: COLORS.dark, borderWidth: 1, borderColor: COLORS.border },
    phoneInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
    countryCodeButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 12, backgroundColor: COLORS.white, borderRightWidth: 1, borderColor: COLORS.border },
    countryCodeText: { fontSize: 16, color: COLORS.dark, fontWeight: 'bold', marginLeft: 5 },
    numberInput: { flex: 1, backgroundColor: 'transparent', borderWidth: 0 },
    saveButton: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});