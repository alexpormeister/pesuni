import { Ionicons } from '@expo/vector-icons'; // Assuming you use Expo icons
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { useMemo, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// --- Types ---
// (You should move these to a shared 'types.ts' file)
interface Product {
    product_id: string;
    name: string;
    description: string;
    image_url: string;
    base_price: number;
}

interface Props {
    product: Product | null;
    bottomSheetRef: React.RefObject<BottomSheetModal | null>;
    onClose: () => void;
}

// --- Placeholder Options (to replace weight) ---
const SERVICE_LEVELS = [
    { id: 'standard', name: 'Standard (2-3 pv)', price: 0 },
    { id: 'express', name: 'Express (1 pv)', price: 5.0 },
];

// --- Component ---
const ProductDetailSheet: React.FC<Props> = ({
    product,
    bottomSheetRef,
    onClose,
}) => {
    // 1. Define snap points (height)
    const snapPoints = useMemo(() => ['80%'], []);
    const [selectedLevel, setSelectedLevel] = useState(SERVICE_LEVELS[0].id);

    // Don't render anything if no product is selected
    if (!product) return null;

    const finalPrice = product.base_price + (SERVICE_LEVELS.find(l => l.id === selectedLevel)?.price || 0);

    return (
        <BottomSheetModal
            ref={bottomSheetRef}
            index={0} // Start at the first snap point
            snapPoints={snapPoints}
            onDismiss={onClose} // Call onClose when swiped down
            handleComponent={() => (
                // --- Custom Handle (the gray bar) ---
                <View style={styles.handleContainer}>
                    <View style={styles.handleBar} />
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close-circle" size={28} color="#aaa" />
                    </TouchableOpacity>
                </View>
            )}
            backdropComponent={(props) => (
                <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
            )}
        >
            <BottomSheetView style={styles.contentContainer}>
                {/* --- Dynamic Content --- */}
                <Image source={{ uri: product.image_url }} style={styles.productImage} />
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.base_price.toFixed(2)} €</Text>
                <Text style={styles.productDescription}>{product.description}</Text>

                <View style={styles.divider} />

                {/* --- "Something Else" Section --- */}
                <Text style={styles.sectionTitle}>Valitse palvelutaso</Text>
                {SERVICE_LEVELS.map((level) => (
                    <TouchableOpacity
                        key={level.id}
                        style={styles.optionRow}
                        onPress={() => setSelectedLevel(level.id)}
                    >
                        <Ionicons
                            name={
                                selectedLevel === level.id
                                    ? 'radio-button-on'
                                    : 'radio-button-off'
                            }
                            size={24}
                            color={selectedLevel === level.id ? '#00cce0' : '#ccc'}
                        />
                        <Text style={styles.optionName}>{level.name}</Text>
                        {level.price > 0 && (
                            <Text style={styles.optionPrice}>+ {level.price.toFixed(2)} €</Text>
                        )}
                    </TouchableOpacity>
                ))}

                {/* --- Add to Cart Button --- */}
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>
                        Lisää koriin ({finalPrice.toFixed(2)} €)
                    </Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    handleContainer: {
        paddingTop: 12,
        paddingBottom: 4,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    handleBar: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#ccc',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 8,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    productImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        resizeMode: 'cover',
        marginBottom: 16,
    },
    productName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: '500',
        color: '#555',
        marginBottom: 12,
    },
    productDescription: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    optionName: {
        fontSize: 16,
        marginLeft: 12,
        flex: 1,
    },
    optionPrice: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    addButton: {
        marginTop: 24,
        marginBottom: 40,
        backgroundColor: '#00cce0',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProductDetailSheet;