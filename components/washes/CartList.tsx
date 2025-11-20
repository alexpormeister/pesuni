import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 🔥 LISÄTTY 🔥
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    CartItem,
    decrementQuantity,
    incrementQuantity,
    removeFromCart,
    selectCartItems,
    selectCartTotalPrice,
} from '../../redux/cartSlice';

const COLORS = {
    primary: '#00c2ff',
    white: '#ffffff',
    dark: '#333333',
    gray: '#f0f0f0',
    red: '#ff3b30',
};

// 🛑 onCheckoutPress on poistettu propeista, koska käytämme useRouteria sisäisesti
interface CartListProps {
    style?: ViewStyle;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const CartList: React.FC<CartListProps> = ({
    style,
    ListHeaderComponent,
    ListEmptyComponent
}) => {
    const router = useRouter(); // 🔥 KÄYTÄÄN REITTIOHJELMOIJAA SUORAAN
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const totalPrice = useSelector(selectCartTotalPrice);

    // Käsittelijä suoraan kassalle siirtymiseen
    const handleCheckoutAction = () => {
        router.push("/checkout/checkout");
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
        <View style={[styles.container, style]}>
            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={ListEmptyComponent}
            />
            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Yhteensä:</Text>
                        <Text style={styles.totalPrice}>{totalPrice.toFixed(2)} €</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.checkoutButton}
                        onPress={handleCheckoutAction} // Navigoi suoraan kassalle
                    >
                        <Text style={styles.checkoutButtonText}>Siirry kassalle</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // ... (tyylit)
    container: {
        flex: 1,
        backgroundColor: COLORS.gray,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 5,
        marginBottom: 50,
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
});

export default CartList;