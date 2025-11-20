import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // LISÄTTY: Reititystä varten
import React from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
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
    primary: '#00c2ff',
    white: '#ffffff',
    dark: '#333333',
    gray: '#f0f0f0',
    red: '#ff3b30',
};

interface CartModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isVisible, onClose }) => {
    const router = useRouter(); // LISÄTTY: useRouter-hook
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const totalPrice = useSelector(selectCartTotalPrice);

    const handleCheckout = () => {
        onClose(); // 1. SULJE MODAALI ENSIN
        router.push("/checkout/checkout"); // 2. NAVIGOI KASSALLE
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} €</Text>
                <Text style={styles.itemSinglePrice}>{item.price.toFixed(2)} € / kpl</Text>
            </View>

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
                    <Feather name={item.quantity === 1 ? "trash-2" : "minus"} size={20} color={item.quantity === 1 ? COLORS.red : COLORS.dark} />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => dispatch(incrementQuantity(item.id))}
                >
                    <Feather name="plus" size={20} color={COLORS.dark} />
                </TouchableOpacity>
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
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalContent}>
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
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Feather name="shopping-cart" size={64} color="#ccc" />
                                <Text style={styles.emptyText}>Ostoskorisi on tyhjä</Text>
                                <TouchableOpacity style={styles.continueShoppingButton} onPress={onClose}>
                                    <Text style={styles.continueShoppingText}>Jatka ostoksia</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />

                    {cartItems.length > 0 && (
                        <View style={styles.footer}>
                            <View style={styles.totalContainer}>
                                <Text style={styles.totalLabel}>Yhteensä:</Text>
                                <Text style={styles.totalPrice}>{totalPrice.toFixed(2)} €</Text>
                            </View>
                            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                                <Text style={styles.checkoutButtonText}>Siirry kassalle</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        flex: 1,
        marginTop: 50,
        backgroundColor: COLORS.gray,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    closeButton: {
        padding: 5,
    },
    listContent: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    itemSinglePrice: {
        fontSize: 12,
        color: '#888',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray,
        borderRadius: 8,
        padding: 4,
    },
    qtyButton: {
        padding: 8,
        backgroundColor: COLORS.white,
        borderRadius: 6,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.dark,
    },
    totalPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    checkoutButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        marginTop: 20,
        marginBottom: 30,
    },
    continueShoppingButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    continueShoppingText: {
        color: COLORS.white,
        fontWeight: '600',
    },
});

export default CartModal;