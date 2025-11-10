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
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
}

const COLORS = {
    primary: '#00c2ff',
    white: '#ffffff',
    gray: '#f5f5f5',
    dark: '#333333',
    textGray: '#666666',
    border: '#e0e0e0'
};

export default function PersonalInfoScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<'name' | 'email' | 'phone' | 'address' | null>(null);

    const [tempFirstName, setTempFirstName] = useState('');
    const [tempLastName, setTempLastName] = useState('');
    const [tempValue, setTempValue] = useState('');

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Virhe', 'Kirjaudu sisään nähdäksesi tietosi.');
                router.replace('/auth/login');
                return;
            }

            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (!data) {
                data = {
                    id: user.id,
                    user_id: user.id,
                    email: user.email,
                    first_name: '',
                    last_name: '',
                    phone: '',
                    address: ''
                };
            }

            setProfile(data);

        } catch (error: any) {
            Alert.alert('Virhe', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveField = async () => {
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

            setProfile({ ...profile, ...updates });
            setModalVisible(false);
            Alert.alert('Onnistui', 'Tiedot päivitetty.');

        } catch (error: any) {
            Alert.alert('Päivitys epäonnistui', error.message);
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (field: 'name' | 'email' | 'phone' | 'address') => {
        setEditingField(field);
        if (field === 'name') {
            setTempFirstName(profile?.first_name || '');
            setTempLastName(profile?.last_name || '');
        } else {
            setTempValue(profile ? (profile[field] as string) || '' : '');
        }
        setModalVisible(true);
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="chevron-left" size={28} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Henkilötiedot</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.infoList}>
                    <InfoItem
                        label="Nimi"
                        value={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()}
                        field="name"
                    />
                    <InfoItem
                        label="Sähköposti"
                        value={profile?.email}
                        field="email"
                    />
                    <InfoItem
                        label="Osoite"
                        value={profile?.address}
                        field="address"
                    />
                    <InfoItem
                        label="Puhelinnumero"
                        value={profile?.phone}
                        field="phone"
                    />
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
                                <>
                                    <Text style={styles.inputLabel}>Etunimi</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={tempFirstName}
                                        onChangeText={setTempFirstName}
                                        placeholder="Etunimi"
                                    />
                                    <Text style={styles.inputLabel}>Sukunimi</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={tempLastName}
                                        onChangeText={setTempLastName}
                                        placeholder="Sukunimi"
                                    />
                                </>
                            ) : (
                                <>
                                    <Text style={styles.inputLabel}>
                                        {editingField === 'email' ? 'Sähköposti' :
                                            editingField === 'address' ? 'Osoite' : 'Puhelinnumero'}
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        value={tempValue}
                                        onChangeText={setTempValue}
                                        placeholder="Syötä uusi arvo"
                                        keyboardType={editingField === 'phone' ? 'phone-pad' : editingField === 'email' ? 'email-address' : 'default'}
                                        autoCapitalize={editingField === 'email' ? 'none' : 'words'}
                                    />
                                </>
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
    backButton: {
        padding: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 20,
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