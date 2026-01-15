import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
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
    danger: '#FF3B30',
    success: '#34C759'
};

const CALLING_CODES: { [key: string]: string } = {
    'FI': '358', 'US': '1', 'SE': '46', 'NO': '47', 'DE': '49',
};

const validateEmail = (email: string) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

const getInitialCountryCode = (phone: string | null | undefined): CountryCode => {
    if (!phone) return 'FI';
    for (const [code, prefix] of Object.entries(CALLING_CODES)) {
        if (phone.startsWith(`+${prefix}`)) return code as CountryCode;
    }
    return 'FI';
};

// --- CUSTOM ALERT KOMPONENTTI ---
const StatusAlert = ({ visible, type, message, onClose }: { visible: boolean, type: 'success' | 'error', message: string, onClose: () => void }) => {
    if (!visible) return null;
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.alertOverlay}>
                <View style={styles.alertBox}>
                    <View style={[styles.alertIconBg, { backgroundColor: type === 'success' ? COLORS.success + '20' : COLORS.danger + '20' }]}>
                        <Feather name={type === 'success' ? "check-circle" : "alert-circle"} size={40} color={type === 'success' ? COLORS.success : COLORS.danger} />
                    </View>
                    <Text style={styles.alertTitle}>{type === 'success' ? 'Onnistui!' : 'Hups!'}</Text>
                    <Text style={styles.alertMessage}>{message}</Text>
                    <TouchableOpacity style={[styles.alertButton, { backgroundColor: type === 'success' ? COLORS.primary : COLORS.danger }]} onPress={onClose}>
                        <Text style={styles.alertButtonText}>Selvä</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function PersonalInfoScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const reduxProfile = useSelector(selectUserProfile);
    const profile = reduxProfile || {};

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [alertConfig, setAlertConfig] = useState<{ visible: boolean, type: 'success' | 'error', message: string }>({
        visible: false, type: 'success', message: ''
    });

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

    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlertConfig({ visible: true, type, message });
    };

    const handleSaveField = async () => {
        if (!profile || !editingField) return;

        if (editingField === 'email' && !validateEmail(tempValue)) {
            showAlert('error', 'Syötä oikea sähköpostiosoite.');
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Ei käyttäjää');

            let updates: Partial<UserProfile> = {};
            if (editingField === 'name') {
                updates = { first_name: tempFirstName, last_name: tempLastName };
            } else if (editingField === 'phone') {
                const callingCode = CALLING_CODES[countryCode];
                const numberPart = tempValue.replace(/[^0-9]/g, '');
                updates = { phone: `+${callingCode}${numberPart}` };
            } else {
                updates = { [editingField]: tempValue };
            }

            const { error } = await supabase.from('profiles').update({ updated_at: new Date().toISOString(), ...updates }).eq('user_id', user.id);
            if (error) throw error;

            dispatch(updateProfileFields(updates));
            setModalVisible(false);
            showAlert('success', 'Tietosi on nyt päivitetty järjestelmään.');
        } catch (error: any) {
            showAlert('error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        showAlert('error', 'Tilin poistaminen vaatii yhteydenoton tukeen turvallisuussyistä.');
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

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusAlert
                visible={alertConfig.visible}
                type={alertConfig.type}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <Feather name="chevron-left" size={28} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Henkilötiedot</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.infoList}>
                    <InfoItem label="Nimi" value={`${profile.first_name || ''} ${profile.last_name || ''}`.trim()} onPress={() => openEditModal('name')} />
                    <InfoItem label="Sähköposti" value={profile.email} onPress={() => openEditModal('email')} />
                    <InfoItem label="Osoite" value={profile.address} onPress={() => openEditModal('address')} />
                    <InfoItem label="Puhelinnumero" value={profile.phone} onPress={() => openEditModal('phone')} />
                </View>

                <View style={styles.dangerZone}>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Feather name="trash-2" size={18} color={COLORS.danger} />
                        <Text style={styles.deleteButtonText}>Poista käyttäjätili</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Muokkaa</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><Feather name="x" size={24} color={COLORS.dark} /></TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {editingField === 'address' ? (
                                <View style={{ height: 300, zIndex: 1000 }}>
                                    <GooglePlacesAutocomplete
                                        placeholder="Etsi osoitetta..."
                                        onPress={(data) => setTempValue(data.description)}
                                        query={{ key: 'YOUR_GOOGLE_API_KEY', language: 'fi', components: 'country:fi' }}
                                        styles={{ textInput: styles.input, listView: { backgroundColor: 'white', position: 'absolute', top: 50, zIndex: 5000 } }}
                                        enablePoweredByContainer={false}
                                    />
                                </View>
                            ) : editingField === 'name' ? (
                                <View>
                                    <TextInput style={styles.input} value={tempFirstName} onChangeText={setTempFirstName} placeholder="Etunimi" />
                                    <TextInput style={[styles.input, { marginTop: 10 }]} value={tempLastName} onChangeText={setTempLastName} placeholder="Sukunimi" />
                                </View>
                            ) : (
                                <View>
                                    {editingField === 'phone' ? (
                                        <View style={styles.phoneInputContainer}>
                                            <TouchableOpacity onPress={() => setCountryPickerVisible(true)} style={styles.countryCodeButton}>
                                                <CountryPicker withFlag onSelect={({ cca2 }) => setCountryCode(cca2)} visible={countryPickerVisible} onClose={() => setCountryPickerVisible(false)} countryCode={countryCode} />
                                                <Text style={styles.countryCodeText}>+{CALLING_CODES[countryCode]}</Text>
                                            </TouchableOpacity>
                                            <TextInput style={[styles.input, styles.numberInput]} value={tempValue} onChangeText={setTempValue} keyboardType='phone-pad' />
                                        </View>
                                    ) : (
                                        <TextInput style={styles.input} value={tempValue} onChangeText={setTempValue} autoCapitalize="none" keyboardType={editingField === 'email' ? 'email-address' : 'default'} />
                                    )}
                                </View>
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
            <Text style={styles.infoValue}>{value || 'Ei määritelty'}</Text>
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
    infoList: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 },
    infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray },
    infoTextContainer: { flex: 1 },
    infoLabel: { fontSize: 14, color: COLORS.textGray, marginBottom: 2 },
    infoValue: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
    dangerZone: { marginTop: 30 },
    deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: COLORS.danger + '40' },
    deleteButtonText: { color: COLORS.danger, fontWeight: '700', marginLeft: 10 },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    modalBody: { marginBottom: 20, minHeight: 100 },
    input: { backgroundColor: COLORS.gray, padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: COLORS.border },
    phoneInputContainer: { flexDirection: 'row', backgroundColor: COLORS.gray, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
    countryCodeButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: COLORS.white, borderRightWidth: 1, borderColor: COLORS.border },
    countryCodeText: { fontWeight: 'bold', marginLeft: 5 },
    numberInput: { flex: 1, padding: 16 },
    saveButton: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    alertOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 30 },
    alertBox: {
        backgroundColor: 'white', borderRadius: 24, padding: 25, width: '100%', alignItems: 'center', elevation: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20,
    },
    alertIconBg: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    alertTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.dark, marginBottom: 10 },
    alertMessage: { fontSize: 16, color: COLORS.textGray, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
    alertButton: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, width: '100%', alignItems: 'center' },
    alertButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});