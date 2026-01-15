import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    primary: '#00c2ff',
    borderColor: '#EFEFEF',
    success: '#4CAF50',
};

interface PaymentSelectionProps {
    originalTotal: number;
    finalTotal: number;
    style?: ViewStyle;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
    originalTotal,
    finalTotal,
    style
}) => {
    const hasDiscount = finalTotal < originalTotal;
    const discountAmount = originalTotal - finalTotal;

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>Maksun yhteenveto</Text>

            <View style={styles.priceSection}>
                <Text style={styles.totalLabel}>Yhteensä maksettavaa:</Text>
                <View style={styles.priceContainer}>
                    {hasDiscount && (
                        <View style={styles.discountRow}>
                            <Text style={styles.originalPrice}>{originalTotal.toFixed(2)} €</Text>
                            <View style={styles.savingsBadge}>
                                <Text style={styles.savingsText}>Säästät {discountAmount.toFixed(2)} €</Text>
                            </View>
                        </View>
                    )}
                    <Text style={styles.totalValue}>{finalTotal.toFixed(2)} €</Text>
                </View>
            </View>

            <View style={styles.secureBadge}>
                <Feather name="shield" size={14} color={COLORS.textGray} />
                <Text style={styles.secureText}>Maksu vahvistetaan pyyhkäisemällä</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginVertical: 10, marginHorizontal: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1, borderColor: COLORS.borderColor },
    title: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText, marginBottom: 15 },
    priceSection: { alignItems: 'center', marginBottom: 10 },
    totalLabel: { fontSize: 15, color: COLORS.textGray, marginBottom: 5 },
    priceContainer: { alignItems: 'center' },
    discountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    originalPrice: { fontSize: 16, color: COLORS.textGray, textDecorationLine: 'line-through', marginRight: 10 },
    savingsBadge: { backgroundColor: '#E8F8F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    savingsText: { fontSize: 12, color: COLORS.success, fontWeight: 'bold' },
    totalValue: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
    secureBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    secureText: { fontSize: 12, color: COLORS.textGray, marginLeft: 5 },
});

export default PaymentSelection;