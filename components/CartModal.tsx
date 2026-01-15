import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
    CartItem,
    decrementQuantity,
    incrementQuantity,
    removeFromCart,
    selectCartItems,
    selectCartTotalPrice
} from '../redux/cartSlice';

const COLORS = {
    primary: '#00AEEF', // Logon kirkas sininen
    secondary: '#E6F7FF', // Erittäin vaalean sininen taustoille
    white: '#ffffff',
    dark: '#1A1A1A', // Pehmeämpi musta
    lightGray: '#F2F2F7',
    textGray: '#8E8E93',
    red: '#FF3B30',
};

interface CartModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isVisible, onClose }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const totalPrice = useSelector(selectCartTotalPrice);

    const handleCheckout = () => {
        onClose();
        router.push("/checkout/checkout");
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemDetails}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} €</Text>
                <Text style={styles.itemSinglePrice}>{item.price.toFixed(2)} € / kpl</Text>
            </View>

            <View style={styles.quantityWrapper}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => {
                            if (item.quantity === 1) {
                                dispatch(removeFromCart(item.id));
                            } else {
                                dispatch(decrementQuantity(item.id));
                            }
                        }}
                    >
                        <Feather
                            name={item.quantity === 1 ? "trash-2" : "minus"}
                            size={18}
                            color={item.quantity === 1 ? COLORS.red : COLORS.dark}
                        />
                    </TouchableOpacity>

                    <Text style={styles.qtyText}>{item.quantity}</Text>

                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => dispatch(incrementQuantity(item.id))}
                    >
                        <Feather name="plus" size={18} color={COLORS.dark} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Vetokahva modaalin yläreunassa (visual cue) */}
                        <View style={styles.pullBar} />

                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Ostoskori</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Feather name="x" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={cartItems}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <View style={styles.emptyIconCircle}>
                                        <Feather name="shopping-bag" size={40} color={COLORS.textGray} />
                                    </View>
                                    <Text style={styles.emptyText}>Ostoskorisi on tyhjä</Text>
                                    <TouchableOpacity style={styles.continueShoppingButton} onPress={onClose}>
                                        <Text style={styles.continueShoppingText}>Löydä pestävää</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        />

                        {cartItems.length > 0 && (
                            <View style={styles.footer}>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Yhteensä</Text>
                                    <Text style={styles.totalPriceText}>{totalPrice.toFixed(2)} €</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.checkoutButton}
                                    onPress={handleCheckout}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.checkoutButtonText}>Siirry kassalle</Text>
                                    <Feather name="arrow-right" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '85%',
        backgroundColor: '#F8F9FA',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    pullBar: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.dark,
        letterSpacing: -0.5,
    },
    closeButton: {
        backgroundColor: COLORS.lightGray,
        padding: 8,
        borderRadius: 20,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    itemDetails: {
        flex: 1,
        paddingRight: 10,
    },
    itemTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    itemSinglePrice: {
        fontSize: 13,
        color: COLORS.textGray,
        marginTop: 2,
    },
    quantityWrapper: {
        alignItems: 'flex-end',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 14,
        padding: 4,
    },
    qtyButton: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '700',
        marginHorizontal: 12,
        color: COLORS.dark,
        minWidth: 15,
        textAlign: 'center',
    },
    footer: {
        padding: 24,
        paddingTop: 16,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 16,
        color: COLORS.textGray,
        fontWeight: '500',
    },
    totalPriceText: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.dark,
    },
    checkoutButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    checkoutButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    continueShoppingButton: {
        marginTop: 10,
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 14,
        backgroundColor: COLORS.secondary,
    },
    continueShoppingText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default CartModal;