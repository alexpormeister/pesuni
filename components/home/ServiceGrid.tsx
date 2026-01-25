import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { supabase } from '../../lib/supabase';
import { addToCart } from '../../redux/cartSlice';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FILTER_DATA = [
    { name: 'Kaikki Pesut', icon: 'apps' },
    { name: 'Arjen pyykit', icon: 'tshirt-crew' },
    { name: 'Kodintekstiilit', icon: 'home-variant' },
    { name: 'Mattopesu', icon: 'rug' },
    { name: 'Kengät & Erikoispesut', icon: 'shoe-sneaker' },
];

const COLORS = {
    primary: '#00c2ff',
    success: '#00B5F0',
    background: '#F8F9FD',
    white: '#FFFFFF',
    textDark: '#1A1B32',
    textGray: '#6B7280',
    border: '#F1F5F9',
};

// --- YKSITTÄINEN TUOTEKORTTI ---
const ProductCard: React.FC<{ product: any; onOpenDetail: (p: any) => void }> = ({ product, onOpenDetail }) => {
    const dispatch = useDispatch();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = (e: any) => {
        e.stopPropagation();
        dispatch(addToCart({
            id: product.product_id,
            name: product.name,
            price: product.base_price
        }));

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <TouchableOpacity
            style={styles.productCard}
            activeOpacity={0.9}
            onPress={() => onOpenDetail(product)}
        >
            <Image source={{ uri: product.image_url }} style={styles.productImage} resizeMode="cover" />

            <View style={styles.productInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.productPrice}>{product.base_price}€</Text>
                </View>

                <Text style={styles.productDescription} numberOfLines={2}>
                    {product.description}
                </Text>

                <TouchableOpacity
                    style={[styles.modernAddButton, isAdded && styles.addedButton]}
                    onPress={handleAddToCart}
                    disabled={isAdded}
                >
                    <View style={styles.buttonContent}>
                        <Feather name={isAdded ? "check" : "plus"} size={18} color={COLORS.white} />
                        <Text style={styles.modernAddButtonText}>{isAdded ? "Lisätty Koriin" : "Lisää Koriin"}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

// --- PÄÄKOMPONENTTI ---
const ServiceGrid = forwardRef<FlatList, { ListHeaderComponent?: React.ReactNode }>(({ ListHeaderComponent }, ref) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<boolean>(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string>('Kaikki Pesut');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [modalAdded, setModalAdded] = useState(false);

    const internalRef = useRef<FlatList>(null);
    const translateY = useSharedValue(SCREEN_HEIGHT);

    useImperativeHandle(ref, () => ({
        scrollToOffset: (params: { offset: number; animated?: boolean }) => {
            internalRef.current?.scrollToOffset(params);
        },
    }) as any);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('categories')
                .select(`id, name, category_id, products!inner (product_id, name, description, image_url, base_price)`)
                .eq('products.is_active', true)
                .order('sort_order');

            if (fetchError) {
                setErrorMsg(fetchError.message);
            } else if (data) {
                setCategories(data);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            translateY.value = SCREEN_HEIGHT;
            translateY.value = withSpring(0, { damping: 18, stiffness: 80, mass: 1 });
        }
    }, [selectedProduct, translateY]);

    const closeSheet = () => {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
            runOnJS(setSelectedProduct)(null);
        });
    };

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > 150 || event.velocityY > 500) {
                runOnJS(closeSheet)();
            } else {
                translateY.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateY.value, [0, SCREEN_HEIGHT], [1, 0]),
        display: translateY.value >= SCREEN_HEIGHT - 1 ? 'none' : 'flex',
    }));

    const handleModalAdd = () => {
        if (!selectedProduct || modalAdded) return;

        dispatch(addToCart({
            id: selectedProduct.product_id,
            name: selectedProduct.name,
            price: selectedProduct.base_price
        }));

        setModalAdded(true);
        setTimeout(() => {
            setModalAdded(false);
            closeSheet();
        }, 1200);
    };

    const displayedCategories = useMemo(() => {
        if (selectedFilter === 'Kaikki Pesut') return categories;
        return categories.filter((category) => category.name === selectedFilter);
    }, [categories, selectedFilter]);

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <FlatList
                    ref={internalRef}
                    style={styles.container}
                    data={displayedCategories}
                    renderItem={({ item }) => (
                        <View style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>{item.name}</Text>
                            <FlatList
                                data={item.products}
                                renderItem={({ item: p }) => <ProductCard product={p} onOpenDetail={setSelectedProduct} />}
                                keyExtractor={(p) => p.product_id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.productList}
                                snapToInterval={292}
                                decelerationRate="fast"
                            />
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={
                        <>
                            {ListHeaderComponent}
                            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

                            <View style={styles.filterWrapper}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                    {FILTER_DATA.map((item) => {
                                        const isActive = item.name === selectedFilter;
                                        return (
                                            <TouchableOpacity
                                                key={item.name}
                                                activeOpacity={0.8}
                                                style={[styles.filterItem, isActive && styles.activeFilterItem]}
                                                onPress={() => setSelectedFilter(item.name)}
                                            >
                                                <View style={[styles.iconBox, isActive && styles.activeIconBox]}>
                                                    <MaterialCommunityIcons
                                                        name={item.icon as any}
                                                        size={24}
                                                        color={isActive ? COLORS.white : COLORS.primary}
                                                    />
                                                </View>
                                                <Text style={[styles.filterLabel, isActive && styles.activeFilterLabel]}>
                                                    {item.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </>
                    }
                    ListFooterComponent={<View style={{ height: 100 }} />}
                />

                {/* --- DETAIL BOTTOM SHEET --- */}
                {selectedProduct && (
                    <View style={StyleSheet.absoluteFill}>
                        <Animated.View style={[styles.modalOverlay, backdropStyle]}>
                            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeSheet} />
                        </Animated.View>

                        <GestureDetector gesture={gesture}>
                            <Animated.View style={[styles.modalContent, animatedStyle]}>
                                <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                                    <View style={styles.modalImageContainer}>
                                        <Image source={{ uri: selectedProduct.image_url }} style={styles.modalImage} />
                                        <TouchableOpacity style={styles.closeButtonOverlay} onPress={closeSheet}>
                                            <Feather name="x" size={20} color={COLORS.textDark} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.modalTextContainer}>
                                        <View style={styles.modalHeaderRow}>
                                            <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                                            <Text style={styles.modalPrice}>{selectedProduct.base_price}€</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <Text style={styles.modalDescriptionTitle}>Tuotekuvaus</Text>
                                        <Text style={styles.modalDescriptionText}>{selectedProduct.description}</Text>
                                    </View>
                                    <View style={{ height: 120 }} />
                                </ScrollView>

                                {/* --- RAISED FOOTER --- */}
                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={[styles.modalAddButton, modalAdded && styles.addedButton]}
                                        onPress={handleModalAdd}
                                        disabled={modalAdded}
                                    >
                                        <View style={styles.buttonContent}>
                                            <Feather name={modalAdded ? "check" : "shopping-cart"} size={20} color={COLORS.white} />
                                            <Text style={styles.modalAddButtonText}>
                                                {modalAdded ? "Lisätty koriin!" : "Lisää ostoskoriin"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </GestureDetector>
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
});

ServiceGrid.displayName = 'ServiceGrid';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 },
    filterWrapper: { paddingVertical: 15 },
    filterScroll: { paddingHorizontal: 20, gap: 15 },
    filterItem: { alignItems: 'center', minWidth: 80 },
    activeFilterItem: { transform: [{ scale: 1.02 }] },
    iconBox: {
        width: 60, height: 60, borderRadius: 20,
        backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
        marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    activeIconBox: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.3 },
    filterLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textGray, textAlign: 'center' },
    activeFilterLabel: { color: COLORS.primary, fontWeight: '700' },
    categorySection: { paddingVertical: 10 },
    categoryTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, paddingHorizontal: 20, marginBottom: 12 },
    productList: { paddingLeft: 20, paddingRight: 8 },
    productCard: { width: 280, backgroundColor: COLORS.white, borderRadius: 24, marginRight: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, elevation: 2, overflow: 'hidden' },
    productImage: { width: '100%', height: 145 },
    productInfo: { padding: 16 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    productName: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginRight: 8 },
    productPrice: { fontSize: 17, fontWeight: '800', color: COLORS.textDark },
    productDescription: { fontSize: 13, color: COLORS.textGray, lineHeight: 18, marginBottom: 16, minHeight: 36 },
    modernAddButton: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    addedButton: { backgroundColor: COLORS.success },
    buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    modernAddButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 14, marginLeft: 6 },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        height: SCREEN_HEIGHT * 0.85, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 20,
        overflow: 'hidden',
    },
    modalImageContainer: { width: '100%', height: 320, position: 'relative' },
    modalImage: { width: '100%', height: '100%' },
    closeButtonOverlay: {
        position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(255,255,255,0.9)',
        width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', zIndex: 99,
    },
    modalTextContainer: { padding: 24 },
    modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textDark, flex: 1 },
    modalPrice: { fontSize: 24, fontWeight: '800', color: COLORS.textDark },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
    modalDescriptionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 10 },
    modalDescriptionText: { fontSize: 16, lineHeight: 24, color: COLORS.textGray },
    modalFooter: {
        padding: 20,
        paddingBottom: 20,
        marginBottom: 80, // This lifts it above your navbar
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.white
    },
    modalAddButton: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    modalAddButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginLeft: 10 },
    errorText: { color: '#E85D5D', textAlign: 'center', margin: 10 }
});

export default ServiceGrid;