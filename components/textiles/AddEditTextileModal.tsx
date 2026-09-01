import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FALLBACK_IMAGE = require('../../assets/images/3dglossy-logo.png');

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
    color?: string | null;
    care_instructions?: string | null;
    special_notes?: string | null;
    photo_url?: string | null;
    last_washed_at?: string | null;
    last_order_id?: string | null;
    created_at?: string;
}

export interface SavableProduct {
    id: string;
    product_id: string;
    name: string;
    category_id?: string;
    description?: string;
    image_url?: string;
    base_price: number;
    discount_price?: number | null;
    allow_customer_save?: boolean;
    saved_textile_config?: {
        requires_dimensions?: boolean;
        allows_material?: boolean;
        allows_color?: boolean;
        allows_photo?: boolean;
        allows_care_instructions?: boolean;
        allows_notes?: boolean;
    };
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (textile: SavedTextile) => Promise<void>;
    initialData?: SavedTextile | null;
    products?: SavableProduct[];
}

const MATERIAL_TAGS = ['100% Villa', 'Puuvilla', 'Silkki', 'Untuva', 'Pellava', 'Nahka / Mokka', 'Synteettinen'];
const COLOR_TAGS = ['Musta', 'Valkoinen', 'Harmaa', 'Sininen', 'Beige', 'Ruskea', 'Punainen', 'Vihreä'];
const CARE_TAGS = ['Vain laakapesu', 'Kemiallinen pesu', 'Hellävarainen vesipesu', 'Ei rumpukuivausta', 'Emulsiopesu'];

export const AddEditTextileModal: React.FC<Props> = ({
    visible,
    onClose,
    onSave,
    initialData,
    products = [],
}) => {
    const isEditing = !!initialData?.id;

    // Vaihe: 1 = Valitse tuote, 2 = Määritä tiedot
    const [step, setStep] = useState<1 | 2>(1);
    const [productSearch, setProductSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<SavableProduct | null>(null);

    // Lomakekentät
    const [name, setName] = useState('');
    const [lengthCm, setLengthCm] = useState('');
    const [widthCm, setWidthCm] = useState('');
    const [material, setMaterial] = useState('');
    const [color, setColor] = useState('');
    const [careInstructions, setCareInstructions] = useState('');
    const [specialNotes, setSpecialNotes] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Suodatetaan vain tuotteet, jotka ylläpitäjä on sallinut tallennettaviksi
    const savableProductsList = useMemo(() => {
        return products.filter(p => p.allow_customer_save !== false);
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return savableProductsList;
        const q = productSearch.toLowerCase();
        return savableProductsList.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
    }, [savableProductsList, productSearch]);

    useEffect(() => {
        if (visible) {
            if (initialData) {
                // Muokkaustila: suoraan vaiheeseen 2
                setStep(2);
                setName(initialData.name || '');
                setLengthCm(initialData.length_cm ? String(initialData.length_cm) : '');
                setWidthCm(initialData.width_cm ? String(initialData.width_cm) : '');
                setMaterial(initialData.material || '');
                setColor(initialData.color || '');
                setCareInstructions(initialData.care_instructions || '');
                setSpecialNotes(initialData.special_notes || '');
                setPhotoUri(initialData.photo_url || null);

                // Etsitään linkitetty tuote
                const matched = products.find(p => p.product_id === initialData.product_id);
                setSelectedProduct(matched || null);
            } else {
                // Uusi tekstiili: aloitetaan tuotteen valinnasta
                setStep(1);
                setProductSearch('');
                setSelectedProduct(null);
                setName('');
                setLengthCm('');
                setWidthCm('');
                setMaterial('');
                setColor('');
                setCareInstructions('');
                setSpecialNotes('');
                setPhotoUri(null);
            }
        }
    }, [visible, initialData, products]);

    // Tuotteen valinta vaiheessa 1
    const handleSelectProduct = (prod: SavableProduct) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        setSelectedProduct(prod);
        setName(prod.name); // Esitäytetään tuotteen nimi
        setStep(2);
    };

    // Aktiivisen tuotteen konfiguraatio ylläpidon asetuksista
    const config = useMemo(() => {
        const defaultCfg = {
            requires_dimensions: selectedProduct?.product_id === 'mattopesu' || selectedProduct?.name.toLowerCase().includes('matto'),
            allows_material: true,
            allows_color: true,
            allows_photo: true,
            allows_care_instructions: true,
            allows_notes: true,
        };

        if (!selectedProduct?.saved_textile_config) return defaultCfg;
        return {
            ...defaultCfg,
            ...selectedProduct.saved_textile_config,
        };
    }, [selectedProduct]);

    // Reaaliaikainen neliölaskenta (m²)
    const calculatedSquareMeters = useMemo(() => {
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

            // Päätellään kategoria valitusta tuotteesta
            let category = 'Muu';
            const prodName = (selectedProduct?.name || name).toLowerCase();
            if (prodName.includes('matto')) category = 'Matto';
            else if (prodName.includes('puku') || prodName.includes('juhla')) category = 'Puku / Juhlavaate';
            else if (prodName.includes('takki') || prodName.includes('untuva')) category = 'Takki / Untuvatuote';
            else if (prodName.includes('verho') || prodName.includes('peitto') || prodName.includes('lakana') || prodName.includes('tyyny')) category = 'Kodintekstiili / Verhot';

            const payload: SavedTextile = {
                ...(initialData?.id ? { id: initialData.id } : {}),
                name: name.trim(),
                category,
                product_id: selectedProduct?.product_id || initialData?.product_id || null,
                length_cm: !isNaN(lNum as number) ? lNum : null,
                width_cm: !isNaN(wNum as number) ? wNum : null,
                square_meters: sqM,
                material: material.trim() || null,
                color: color.trim() || null,
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
                    {step === 2 && !isEditing ? (
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                setStep(1);
                            }}
                            style={styles.backStepBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Feather name="chevron-left" size={20} color="#00C2FF" />
                            <Text style={styles.backStepText}>Tuotteet</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Feather name="x" size={22} color="#475569" />
                        </TouchableOpacity>
                    )}

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>
                            {isEditing ? 'Muokkaa tekstiiliä' : (step === 1 ? 'Valitse tuote' : 'Tekstiilin tiedot')}
                        </Text>
                        {!isEditing && (
                            <Text style={styles.stepSubtitle}>
                                {step === 1 ? 'Vaihe 1/2: Valitse pestävä kohde' : 'Vaihe 2/2: Määritä tarkemmat tiedot'}
                            </Text>
                        )}
                    </View>

                    {step === 2 ? (
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
                    ) : (
                        <View style={{ width: 44 }} />
                    )}
                </View>

                {/* VAIHE 1: VALITSE TUOTE (KORTIT JA HAKU) */}
                {step === 1 && (
                    <View style={styles.step1Container}>
                        {/* HAKUKENTTÄ */}
                        <View style={styles.searchBar}>
                            <Feather name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Etsi tuotteista (esim. matto, puku, takki)..."
                                placeholderTextColor="#94A3B8"
                                value={productSearch}
                                onChangeText={setProductSearch}
                                autoFocus={false}
                            />
                            {productSearch.length > 0 && (
                                <TouchableOpacity onPress={() => setProductSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    <Feather name="x" size={16} color="#94A3B8" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text style={styles.chooseTitle}>Minkä tuotteen haluat tallentaa?</Text>

                        <FlatList
                            data={filteredProducts}
                            keyExtractor={item => item.product_id || item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.prodRow}
                            contentContainerStyle={styles.prodList}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const price = item.discount_price || item.base_price;
                                return (
                                    <TouchableOpacity
                                        style={styles.productCard}
                                        activeOpacity={0.82}
                                        onPress={() => handleSelectProduct(item)}
                                    >
                                        <View style={styles.prodImageContainer}>
                                            <Image
                                                source={item.image_url ? { uri: item.image_url } : FALLBACK_IMAGE}
                                                style={styles.prodImage}
                                                contentFit="cover"
                                            />
                                        </View>
                                        <View style={styles.prodCardBody}>
                                            <Text style={styles.prodName} numberOfLines={2}>{item.name}</Text>
                                            <Text style={styles.prodPrice}>
                                                alk. {Number(price).toFixed(2).replace('.', ',')} €
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <View style={styles.emptySearchBox}>
                                    <MaterialCommunityIcons name="tag-off-outline" size={40} color="#CBD5E1" />
                                    <Text style={styles.emptySearchText}>Ei hakua vastaavia tuotteita.</Text>
                                </View>
                            }
                        />
                    </View>
                )}

                {/* VAIHE 2: MÄÄRITÄ TIEDOT (VAIN YLLÄPIDON SALLIMAT KENTÄT) */}
                {step === 2 && (
                    <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                        {/* VALITUN TUOTTEEN YHTEENVETOPALKKI */}
                        {selectedProduct && (
                            <View style={styles.selectedProductBanner}>
                                <Image
                                    source={selectedProduct.image_url ? { uri: selectedProduct.image_url } : FALLBACK_IMAGE}
                                    style={styles.selectedProdThumb}
                                    contentFit="cover"
                                />
                                <View style={styles.selectedProdInfo}>
                                    <Text style={styles.selectedProdName}>{selectedProduct.name}</Text>
                                    <Text style={styles.selectedProdPrice}>
                                        Pesuhinta alk. {Number(selectedProduct.discount_price || selectedProduct.base_price).toFixed(2).replace('.', ',')} €
                                    </Text>
                                </View>
                                {!isEditing && (
                                    <TouchableOpacity
                                        style={styles.changeProdBtn}
                                        onPress={() => setStep(1)}
                                    >
                                        <Text style={styles.changeProdBtnText}>Vaihda</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* 1. KUVAN VALINTA (JOS SALLITTU) */}
                        {config.allows_photo && (
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
                                            <Feather name="camera" size={18} color="#00C2FF" />
                                            <Text style={styles.photoBtnText}>Ota kuva</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.photoBtn}
                                            onPress={() => handlePickImage(false)}
                                            activeOpacity={0.8}
                                        >
                                            <Feather name="image" size={18} color="#00C2FF" />
                                            <Text style={styles.photoBtnText}>Valitse galleriasta</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* 2. TEKSTIILIN NIMI */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Tekstiilin oma lempinimi / tunniste *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Esim. Olohuoneen villamatto, Musta juhlapuku..."
                                placeholderTextColor="#94A3B8"
                                value={name}
                                onChangeText={setName}
                                maxLength={80}
                            />
                            <Text style={styles.helperText}>
                                Tämä oma nimesi näkyy Omat tekstiilit -listallasi. Tilaukseen ja pesulalle kirjataan aina virallinen tuotenimi ({selectedProduct?.name || 'Tuote'}).
                            </Text>
                        </View>

                        {/* 3. MITAT (NÄYTETÄÄN VAIN JOS YLLÄPITÄJÄ ON AKTIVOINUT MITAT TÄLLE TUOTTEELLE) */}
                        {config.requires_dimensions && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeaderRow}>
                                    <Text style={styles.sectionLabel}>Mitat (cm) *</Text>
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

                        {/* 4. VÄRI (JOS SALLITTU) */}
                        {config.allows_color && (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Väri</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Esim. Tummansininen, Luonnonvalkoinen..."
                                    placeholderTextColor="#94A3B8"
                                    value={color}
                                    onChangeText={setColor}
                                    maxLength={40}
                                />
                                <View style={styles.tagWrap}>
                                    {COLOR_TAGS.map(t => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[styles.tagPill, color === t && styles.tagPillActive]}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                                setColor(t);
                                            }}
                                        >
                                            <Text style={[styles.tagPillText, color === t && styles.tagPillTextActive]}>
                                                {t}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* 5. MATERIAALI (JOS SALLITTU) */}
                        {config.allows_material && (
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
                        )}

                        {/* 6. PESUOHJEET / HUOMIOT (JOS SALLITTU) */}
                        {config.allows_care_instructions && (
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
                        )}

                        {/* 7. ERITYISTOIVEET / TAHRAT (JOS SALLITTU) */}
                        {config.allows_notes && (
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
                        )}

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
                )}
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
    backStepBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingRight: 8,
    },
    backStepText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#00C2FF',
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    stepSubtitle: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
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
    // VAIHE 1 TYYLIT
    step1Container: {
        flex: 1,
        padding: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
        padding: 0,
    },
    chooseTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
    },
    prodList: {
        paddingBottom: 24,
    },
    prodRow: {
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12,
    },
    productCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    prodImageContainer: {
        width: '100%',
        height: 110,
        backgroundColor: '#F1F5F9',
    },
    prodImage: {
        width: '100%',
        height: '100%',
    },
    prodCardBody: {
        padding: 10,
    },
    prodName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
        minHeight: 34,
    },
    prodPrice: {
        fontSize: 12,
        fontWeight: '600',
        color: '#00C2FF',
        marginTop: 4,
    },
    emptySearchBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 10,
    },
    emptySearchText: {
        fontSize: 14,
        color: '#94A3B8',
    },
    // VAIHE 2 TYYLIT
    body: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    selectedProductBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: '#BAE6FD',
        borderRadius: 14,
        padding: 10,
        marginBottom: 18,
    },
    selectedProdThumb: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#E0F2FE',
    },
    selectedProdInfo: {
        flex: 1,
        marginLeft: 10,
    },
    selectedProdName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    selectedProdPrice: {
        fontSize: 12,
        color: '#0284C7',
        fontWeight: '600',
    },
    changeProdBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    changeProdBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0284C7',
    },
    section: {
        marginBottom: 18,
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
    helperText: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 4,
        lineHeight: 15,
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
        paddingVertical: 13,
        gap: 6,
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
