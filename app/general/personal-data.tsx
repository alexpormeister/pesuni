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

// 🔥 REDUX IMPORTIT KORJATTU 🔥
// Tuodaan tarvittavat Redux-toiminnot ja UserProfile-tyyppi
import { selectUserProfile, updateProfileFields, UserProfile } from '../../redux/profileSlice';
// Tuodaan uusi asynkroninen Thunk profiilin lataamiseen
import { fetchUserProfile } from '../../redux/profileThunks';
// --------------------

const COLORS = {
    primary: '#00c2ff',
    white: '#ffffff',
    gray: '#f5f5f5',
    dark: '#333333',
    textGray: '#666666',
    border: '#e0e0e0'
};

// --- MAKOODI VAKIOT & APUFUNKTIOT ---
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
        if (phone.startsWith(`+${prefix}`)) {
            return code as CountryCode;
        }
    }
    return 'FI';
};

export default function PersonalInfoScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    // 🔥 UUSI: LUE PROFIILIDATA AINA REDUXISTA 🔥
    const reduxProfile = useSelector(selectUserProfile);

    // Käytetään Redux-tilaa (`reduxProfile`) tietojen näyttämiseen.
    // Alustetaan `profile` tyhjänä objektina, jos Redux on vielä tyhjä (initialState).
    const profile = reduxProfile || {};

    // Käytetään `loading` tilaa vain kun sivu latautuu ensimmäisen kerran.
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<'name' | 'email' | 'phone' | 'address' | null>(null);

    const [tempFirstName, setTempFirstName] = useState('');
    const [tempLastName, setTempLastName] = useState('');
    const [tempValue, setTempValue] = useState('');

    const [countryCode, setCountryCode] = useState<CountryCode>('FI');
    const [countryPickerVisible, setCountryPickerVisible] = useState(false);

    // --- 1. PROFIILIN LATAUS (THUNK) ---
    useEffect(() => {
        // Dispatchataan Thunk, joka hakee tiedot Supabasesta ja asettaa ne Reduxiin.
        // Koska Thunk hakee tiedot ja päivittää ne globaalisti, Checkout-sivu saa ne.
        dispatch(fetchUserProfile() as any) // 'as any' poistaa tyyppivirheen
            .finally(() => {
                setLoading(false); // Aseta lataus pois, kun haku on valmis
            });
    }, [dispatch]);


    // --- 2. HAKUJEN TALLENNUS JA REDUXIN PÄIVITYS ---
    const handleSaveField = async () => {
        // Käytetään Redux-profiilia, jos se on olemassa
        if (!profile || !editingField) return;
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Ei käyttäjää');

            let updates: Partial<UserProfile> = {};

            if (editingField === 'name') {
                updates = {
                    first_name: tempFirstName,
                    last_name: tempLastName,
                };
            } else if (editingField === 'phone') {

                const callingCode = CALLING_CODES[countryCode];
                if (!callingCode) throw new Error('Maakoodia ei valittu tai löydy.');
                if (!tempValue.trim()) throw new Error('Puhelinnumero ei voi olla tyhjä.');

                const numberPart = tempValue.replace(/[^0-9]/g, '');
                const fullPhoneNumber = `+${callingCode}${numberPart}`;

                updates = { phone: fullPhoneNumber };

            } else {
                updates = { [editingField]: tempValue };
            }

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    user_id: user.id,
                    updated_at: new Date().toISOString(),
                    ...updates,
                });

            if (error) throw error;

            // Päivitä Redux-tila
            dispatch(updateProfileFields(updates));

            setModalVisible(false);
            Alert.alert('Onnistui', 'Tiedot päivitetty.');

        } catch (error: any) {
            Alert.alert('Päivitys epäonnistui', error.message);
        } finally {
            setSaving(false);
        }
    };

    // --- 3. MUOKKAUSMODAALIN AVAUS (Käyttää Redux-dataa) ---
    // Nyt "profile" tulee Reduxista, joten se on aina tuorein tieto.
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

            const numberPart = fullPhone.startsWith(callingCodeStr)
                ? fullPhone.substring(callingCodeStr.length)
                : fullPhone;

            setTempValue(numberPart);

        } else {
            setTempValue(profile[field] || '');
        }
        setModalVisible(true);
    };

    const handleGoBack = () => {
        router.push('/profile');
    };

    const InfoItem = ({ label, value, field }: { label: string, value: string | null | undefined, field: 'name' | 'email' | 'phone' | 'address' }) => (
        <TouchableOpacity style={styles.infoItem} onPress={() => openEditModal(field)}>
            <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                    {value || 'Ei määritelty'}
                </Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textGray} />
        </TouchableOpacity>
    );

    // Täysi nimi (käyttää Reduxista saatua dataa)
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();


    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack}>
                    <Feather name="chevron-left" size={28} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Henkilötiedot</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.infoList}>
                    <InfoItem label="Nimi" value={fullName} field="name" />
                    <InfoItem label="Sähköposti" value={profile.email} field="email" />
                    <InfoItem label="Osoite" value={profile.address} field="address" />
                    <InfoItem label="Puhelinnumero" value={profile.phone} field="phone" />
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Muokkaa {editingField === 'name' ? 'nimeä' :
                                    editingField === 'email' ? 'sähköpostia' :
                                        editingField === 'address' ? 'osoitetta' : 'puhelinnumeroa'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
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
                                <>
                                    <Text style={styles.inputLabel}>Puhelinnumero</Text>
                                    <View style={styles.phoneInputContainer}>
                                        <TouchableOpacity
                                            onPress={() => setCountryPickerVisible(true)}
                                            style={styles.countryCodeButton}
                                        >
                                            <CountryPicker
                                                withFlag
                                                withCallingCode={false}
                                                onSelect={({ cca2 }) => setCountryCode(cca2)}
                                                visible={countryPickerVisible}
                                                onClose={() => setCountryPickerVisible(false)}
                                                containerButtonStyle={{ paddingRight: 5 }}
                                                preferredCountries={Object.keys(CALLING_CODES) as CountryCode[]}
                                                countryCode={countryCode}
                                            />
                                            <Text style={styles.countryCodeText}>
                                                +{CALLING_CODES[countryCode] || '—'}
                                            </Text>
                                            <Feather name="chevron-down" size={14} color={COLORS.dark} style={{ marginLeft: 5 }} />
                                        </TouchableOpacity>

                                        <TextInput
                                            style={[styles.input, styles.numberInput]}
                                            value={tempValue}
                                            onChangeText={setTempValue}
                                            placeholder="40 123 4567"
                                            keyboardType='phone-pad'
                                            autoCapitalize='none'
                                        />
                                    </View>
                                </>
                            ) : (
                                <View>
                                    <Text style={styles.inputLabel}>
                                        {editingField === 'email' ? 'Sähköposti' : editingField === 'address' ? 'Osoite' : 'Puhelinnumero'}
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        value={tempValue}
                                        onChangeText={setTempValue}
                                        placeholder="Syötä uusi arvo"
                                        keyboardType={editingField === 'email' ? 'email-address' : 'default'}
                                        autoCapitalize={editingField === 'email' ? 'none' : 'words'}
                                        multiline={editingField === 'address'}
                                        textAlignVertical={editingField === 'address' ? 'top' : 'center'}
                                    />
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                            onPress={handleSaveField}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.saveButtonText}>Tallenna</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
// --- TYYLIT ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray,
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
        paddingVertical: 15,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    infoList: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingVertical: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    infoTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.textGray,
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: 300,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    modalBody: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        backgroundColor: COLORS.gray,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        color: COLORS.dark,
        borderWidth: 1,
        borderColor: COLORS.border,
        minHeight: 50,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    countryCodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderRightWidth: 1,
        borderColor: COLORS.border,
    },
    countryCodeText: {
        fontSize: 16,
        color: COLORS.dark,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    countryCodeIcon: {
        marginLeft: 5,
    },
    numberInput: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});