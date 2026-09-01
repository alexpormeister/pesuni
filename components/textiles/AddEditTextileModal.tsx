import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
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
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export interface SavedTextile {
    id?: string;
    user_id?: string;
    name: string;
    category: string;
    product_id?: string | null;
    length_cm?: number | null;
    width_cm?: number | null;
    square_meters?: number | null;
    material?: string | null;
    care_instructions?: string | null;
    special_notes?: string | null;
    photo_url?: string | null;
    last_washed_at?: string | null;
    last_order_id?: string | null;
    created_at?: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (textile: SavedTextile) => Promise<void>;
    initialData?: SavedTextile | null;
}

const CATEGORIES = [
    { id: 'Matto', name: 'Matto', icon: 'rug' },
    { id: 'Puku / Juhlavaate', name: 'Puku / Juhlavaate', icon: 'tshirt-crew' },
    { id: 'Takki / Untuvatuote', name: 'Takki / Untuvatuote', icon: 'jacket' },
    { id: 'Kodintekstiili / Verhot', name: 'Kodintekstiili / Verhot', icon: 'curtains' },
    { id: 'Muu', name: 'Muu tekstiili', icon: 'tag-outline' },
];

const MATERIAL_TAGS = ['100% Villa', 'Puuvilla', 'Silkki', 'Untuva', 'Pellava', 'Nahka / Mokka', 'Synteettinen', 'Viskoosi'];
const CARE_TAGS = ['Vain laakapesu', 'Kemiallinen pesu', 'Hellävarainen vesipesu', 'Ei rumpukuivausta', 'Emulsiopesu'];

export const AddEditTextileModal: React.FC<Props> = ({
    visible,
    onClose,
    onSave,
    initialData,
}) => {
    const isEditing = !!initialData?.id;

    const [name, setName] = useState('');
    const [category, setCategory] = useState('Matto');
    const [lengthCm, setLengthCm] = useState('');
    const [widthCm, setWidthCm] = useState('');
    const [material, setMaterial] = useState('');
    const [careInstructions, setCareInstructions] = useState('');
    const [specialNotes, setSpecialNotes] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setCategory(initialData.category || 'Matto');
            setLengthCm(initialData.length_cm ? String(initialData.length_cm) : '');
            setWidthCm(initialData.width_cm ? String(initialData.width_cm) : '');
            setMaterial(initialData.material || '');
            setCareInstructions(initialData.care_instructions || '');
            setSpecialNotes(initialData.special_notes || '');
            setPhotoUri(initialData.photo_url || null);
        } else {
            setName('');
            setCategory('Matto');
            setLengthCm('');
            setWidthCm('');
            setMaterial('');
            setCareInstructions('');
            setSpecialNotes('');
            setPhotoUri(null);
        }
    }, [initialData, visible]);

    // Reaaliaikainen neliölaskenta (m²)
    const calculatedSquareMeters = React.useMemo(() => {
        const l = parseFloat(lengthCm.replace(',', '.'));
        const w = parseFloat(widthCm.replace(',', '.'));
        if (!isNaN(l) && !isNaN(w) && l > 0 && w > 0) {
            return ((l * w) / 10000).toFixed(2);
        }
        return null;
    }, [lengthCm, widthCm]);

    const handlePickImage = async (useCamera: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        try {
            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Kamera vaaditaan', 'Salli kameran käyttö asetuksista ottaaksesi kuvan.');
                    return;
                }
                const res = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                    allowsEditing: true,
                    aspect: [4, 3],
                });
                if (!res.canceled && res.assets[0]?.uri) {
                    setPhotoUri(res.assets[0].uri);
                }
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Kuvagalleria vaaditaan', 'Salli kuvagallerian käyttö asetuksista.');
                    return;
                }
                const res = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                    allowsEditing: true,
                    aspect: [4, 3],
                });
                if (!res.canceled && res.assets[0]?.uri) {
                    setPhotoUri(res.assets[0].uri);
                }
            }
        } catch (e: any) {
            Alert.alert('Virhe', 'Kuvan valinta epäonnistui: ' + e?.message);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Nimi puuttuu', 'Anna tekstiilille kuvaava nimi (esim. "Olohuoneen villamatto").');
            return;
        }

        setIsSaving(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

        try {
            let uploadedPhotoUrl = photoUri;

            // Jos uusi paikallinen kuva, ladataan Supabase Storageen
            if (photoUri && !photoUri.startsWith('http://') && !photoUri.startsWith('https://')) {
                try {
                    const response = await fetch(photoUri);
                    const blob = await response.blob();
                    const arrayBuffer = await new Response(blob).arrayBuffer();
                    const ext = photoUri.split('.').pop()?.toLowerCase() || 'jpg';
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('customer-textile-photos')
                        .upload(fileName, arrayBuffer, {
                            contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
                            upsert: true,
                        });

                    if (!uploadError && uploadData) {
                        const { data: pubData } = supabase.storage
                            .from('customer-textile-photos')
                            .getPublicUrl(fileName);
                        uploadedPhotoUrl = pubData?.publicUrl || photoUri;
                    }
                } catch (imgErr) {
                    console.warn('[SAVED_TEXTILE] Image upload fallback:', imgErr);
                }
            }

            const lNum = lengthCm ? parseFloat(lengthCm.replace(',', '.')) : null;
            const wNum = widthCm ? parseFloat(widthCm.replace(',', '.')) : null;
            const sqM = calculatedSquareMeters ? parseFloat(calculatedSquareMeters) : null;

            const payload: SavedTextile = {
                ...(initialData?.id ? { id: initialData.id } : {}),
                name: name.trim(),
                category,
                length_cm: !isNaN(lNum as number) ? lNum : null,
                width_cm: !isNaN(wNum as number) ? wNum : null,
                square_meters: sqM,
                material: material.trim() || null,
                care_instructions: careInstructions.trim() || null,
                special_notes: specialNotes.trim() || null,
                photo_url: uploadedPhotoUrl,
            };

            await onSave(payload);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            onClose();
        } catch (err: any) {
            Alert.alert('Virhe', err?.message || 'Tallennus epäonnistui.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                {/* YLÄPALKKI */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Feather name="x" size={22} color="#475569" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {isEditing ? 'Muokkaa tekstiiliä' : 'Lisää oma tekstiili'}
                    </Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving}
                        style={[styles.saveBtnTop, isSaving && { opacity: 0.6 }]}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#00C2FF" />
                        ) : (
                            <Text style={styles.saveBtnTopText}>Tallenna</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {/* 1. KUVAN VALINTA */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Kuva tekstiilistä (valinnainen)</Text>
                        {photoUri ? (
                            <View style={styles.photoPreviewBox}>
                                <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
                                <TouchableOpacity
                                    style={styles.removePhotoBtn}
                                    onPress={() => setPhotoUri(null)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Feather name="trash-2" size={16} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.photoActionRow}>
                                <TouchableOpacity
                                    style={styles.photoBtn}
                                    onPress={() => handlePickImage(true)}
                                    activeOpacity={0.8}
                                >
                                    <Feather name="camera" size={20} color="#00C2FF" />
                                    <Text style={styles.photoBtnText}>Ota kuva</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.photoBtn}
                                    onPress={() => handlePickImage(false)}
                                    activeOpacity={0.8}
                                >
                                    <Feather name="image" size={20} color="#00C2FF" />
                                    <Text style={styles.photoBtnText}>Valitse galleriasta</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* 2. NIMI */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Nimi tai kuvaus *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Esim. Olohuoneen villamatto, Juhlapuku..."
                            placeholderTextColor="#94A3B8"
                            value={name}
                            onChangeText={setName}
                            maxLength={80}
                        />
                    </View>

                    {/* 3. KATEGORIA */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Kategoria</Text>
                        <View style={styles.categoryWrap}>
                            {CATEGORIES.map(cat => {
                                const active = category === cat.id;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.categoryChip, active && styles.categoryChipActive]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                            setCategory(cat.id);
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialCommunityIcons
                                            name={cat.icon as any}
                                            size={16}
                                            color={active ? '#FFFFFF' : '#64748B'}
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* 4. MITAT (ERITYISESTI MATOILLE JA VERHOILLE) */}
                    {(category === 'Matto' || category === 'Kodintekstiili / Verhot' || lengthCm || widthCm) && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionLabel}>Mitat (cm)</Text>
                                {calculatedSquareMeters && (
                                    <View style={styles.areaBadge}>
                                        <MaterialCommunityIcons name="calculator" size={14} color="#059669" style={{ marginRight: 4 }} />
                                        <Text style={styles.areaBadgeText}>Pinta-ala: {calculatedSquareMeters} m²</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.dimRow}>
                                <View style={styles.dimCol}>
                                    <Text style={styles.dimLabel}>Pituus (cm)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Esim. 200"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        value={lengthCm}
                                        onChangeText={setLengthCm}
                                        maxLength={6}
                                    />
                                </View>
                                <Text style={styles.dimMultiply}>×</Text>
                                <View style={styles.dimCol}>
                                    <Text style={styles.dimLabel}>Leveys (cm)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Esim. 300"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        value={widthCm}
                                        onChangeText={setWidthCm}
                                        maxLength={6}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* 5. MATERIAALI */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Materiaali</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Esim. 100% Villa, Puuvilla, Silkki..."
                            placeholderTextColor="#94A3B8"
                            value={material}
                            onChangeText={setMaterial}
                            maxLength={50}
                        />
                        <View style={styles.tagWrap}>
                            {MATERIAL_TAGS.map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.tagPill, material.includes(t) && styles.tagPillActive]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                        setMaterial(t);
                                    }}
                                >
                                    <Text style={[styles.tagPillText, material.includes(t) && styles.tagPillTextActive]}>
                                        {t}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 6. PESUOHJEET / HUOMIOT */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Pesuohje / Pesumerkinnät</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Esim. Vain laakapesu, Kemiallinen pesu..."
                            placeholderTextColor="#94A3B8"
                            value={careInstructions}
                            onChangeText={setCareInstructions}
                            maxLength={60}
                        />
                        <View style={styles.tagWrap}>
                            {CARE_TAGS.map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.tagPill, careInstructions.includes(t) && styles.tagPillActive]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                        setCareInstructions(t);
                                    }}
                                >
                                    <Text style={[styles.tagPillText, careInstructions.includes(t) && styles.tagPillTextActive]}>
                                        {t}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 7. ERITYISTOIVEET / TAHRAT */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Erityistoiveet tai tiedossa olevat tahrat</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Kerro pesulalle mahdollisista tahroista tai toiveista..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={3}
                            value={specialNotes}
                            onChangeText={setSpecialNotes}
                            maxLength={250}
                        />
                    </View>

                    {/* TALLENNA PÄÄNAPPI */}
                    <TouchableOpacity
                        style={[styles.mainSaveBtn, isSaving && { opacity: 0.6 }]}
                        activeOpacity={0.88}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.mainSaveBtnText}>
                                    {isEditing ? 'Tallenna muutokset' : 'Tallenna tekstiili'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 16 : 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    saveBtnTop: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    saveBtnTopText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#00C2FF',
    },
    body: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#0F172A',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    photoActionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    photoBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E0F7FF',
        borderWidth: 1,
        borderColor: '#BAE6FD',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 14,
        gap: 8,
    },
    photoBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0284C7',
    },
    photoPreviewBox: {
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        height: 140,
        backgroundColor: '#000',
    },
    photoPreview: {
        width: '100%',
        height: '100%',
    },
    removePhotoBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    categoryChipActive: {
        backgroundColor: '#00C2FF',
        borderColor: '#00C2FF',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#475569',
    },
    categoryChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    dimRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dimCol: {
        flex: 1,
    },
    dimLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 4,
    },
    dimMultiply: {
        fontSize: 18,
        fontWeight: '700',
        color: '#94A3B8',
        marginTop: 18,
    },
    areaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    areaBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#059669',
    },
    tagWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    tagPill: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    tagPillActive: {
        backgroundColor: '#E0F2FE',
        borderWidth: 1,
        borderColor: '#0284C7',
    },
    tagPillText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
    },
    tagPillTextActive: {
        color: '#0284C7',
        fontWeight: '700',
    },
    mainSaveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00C2FF',
        borderRadius: 14,
        paddingVertical: 15,
        marginTop: 10,
        shadowColor: '#00C2FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    mainSaveBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
