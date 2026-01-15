import { Feather } from '@expo/vector-icons';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    primary: '#00c2ff',
    lightGray: '#F8F9FD',
    borderColor: '#EFEFEF',
    error: '#FF4500',
    success: '#4CAF50',
};

const PAYMENT_OPTIONS = [
    { id: 'mobilepay', name: 'MobilePay', icon: 'smartphone' },
    { id: 'card', name: 'Luottokortti (Visa/MC)', icon: 'credit-card' },
    { id: 'bank', name: 'Pankkimaksu (Verkkopankit)', icon: 'globe' },
];

interface PaymentSelectionProps {
    originalTotal: number;
    finalTotal: number;
    onSelectMethod: Dispatch<SetStateAction<string | null>>;
    style?: ViewStyle;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
    originalTotal,
    finalTotal,
    onSelectMethod,
    style
}) => {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const hasDiscount = finalTotal < originalTotal;
    const discountAmount = originalTotal - finalTotal;

    useEffect(() => {
        onSelectMethod(selectedMethod);
    }, [selectedMethod, onSelectMethod]);

    const renderPaymentOption = (option: typeof PAYMENT_OPTIONS[0]) => {
        const isSelected = option.id === selectedMethod;
        return (
            <TouchableOpacity
                key={option.id}
                style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                onPress={() => setSelectedMethod(option.id)}
            >
                <Feather name={option.icon as 'credit-card'} size={20} color={isSelected ? COLORS.primary : COLORS.darkText} />
                <Text style={styles.optionText}>{option.name}</Text>
                {isSelected && (
                    <Feather name="check-circle" size={20} color={COLORS.primary} style={styles.checkIcon} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>Valitse maksutapa</Text>
            <View style={styles.optionsList}>
                {PAYMENT_OPTIONS.map(renderPaymentOption)}
            </View>
            <View style={styles.footer}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 20, marginVertical: 10, marginHorizontal: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderWidth: 1, borderColor: COLORS.borderColor },
    title: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText, marginBottom: 15 },
    optionsList: { marginBottom: 20 },
    optionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, marginBottom: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.borderColor, backgroundColor: COLORS.lightGray },
    optionButtonSelected: { borderColor: COLORS.primary, borderWidth: 2, backgroundColor: COLORS.white },
    optionText: { flex: 1, fontSize: 16, color: COLORS.darkText, marginLeft: 15, fontWeight: '500' },
    checkIcon: { marginLeft: 10 },
    footer: { borderTopWidth: 1, borderTopColor: COLORS.borderColor, paddingTop: 15, alignItems: 'center' },
    totalLabel: { fontSize: 15, color: COLORS.textGray, marginBottom: 5 },
    priceContainer: { alignItems: 'center' },
    discountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    originalPrice: { fontSize: 16, color: COLORS.textGray, textDecorationLine: 'line-through', marginRight: 10 },
    savingsBadge: { backgroundColor: '#E8F8F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    savingsText: { fontSize: 12, color: COLORS.success, fontWeight: 'bold' },
    totalValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
});

export default PaymentSelection;