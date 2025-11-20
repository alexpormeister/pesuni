import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCartItems } from '../../redux/cartSlice';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    primary: '#00c2ff',
    lightGray: '#F8F9FD',
};

// KORJATTU RAJAPINTA: Salli id:n olla string tai number
interface CartItem {
    id: string | number;
    name: string;
    price: number;
    quantity: number;
}

interface OrderSummaryCardProps {
    style?: ViewStyle;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ style }) => {
    // TypeScript ei enää valita, koska tyypit ovat nyt yhteensopivia.
    const cartItems: CartItem[] = useSelector(selectCartItems) as CartItem[];

    const { subtotal, totalAmount } = useMemo(() => {
        const calculatedSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = calculatedSubtotal;

        return { subtotal: calculatedSubtotal, totalAmount: total };
    }, [cartItems]);

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.itemPriceContainer}>
                <Text style={styles.itemQuantity}>{item.quantity} x {item.price.toFixed(2)} €</Text>
                <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} €</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>Tilausyhteenveto</Text>

            <View style={styles.itemListContainer}>
                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => String(item.id)} // Varmistetaan, että avain on aina string
                    renderItem={renderCartItem}
                    scrollEnabled={false}
                    ListHeaderComponent={
                        <Text style={styles.cartCountText}>Ostoskori ({cartItems.length})</Text>
                    }
                />
            </View>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Välisumma:</Text>
                    <Text style={styles.summaryValue}>{subtotal.toFixed(2)} €</Text>
                </View>

                <View style={styles.summaryRowTotal}>
                    <Text style={styles.summaryTotalLabel}>Yhteensä:</Text>
                    <Text style={styles.summaryTotalValue}>{totalAmount.toFixed(2)} €</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 15,
    },

    itemListContainer: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        paddingBottom: 15,
        marginBottom: 15,
    },
    cartCountText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkText,
        marginBottom: 10,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        color: COLORS.darkText,
        flex: 3,
        marginRight: 10,
    },
    itemPriceContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 2,
    },
    itemQuantity: {
        fontSize: 12,
        color: COLORS.textGray,
        marginRight: 8,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.darkText,
    },

    summaryContainer: {
        paddingTop: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryRowTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    summaryLabel: {
        fontSize: 16,
        color: COLORS.darkText,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkText,
    },
    summaryTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});

export default OrderSummaryCard;