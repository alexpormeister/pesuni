import { Feather } from '@expo/vector-icons';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'; // 🔥 LISÄTTY useEffect

import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    primary: '#00c2ff',
    lightGray: '#F8F9FD',
    borderColor: '#EFEFEF',
    error: '#FF4500',
};

// Mock maksutavat (Simuloi tilitettyjä maksupalveluita)
const PAYMENT_OPTIONS = [
    { id: 'mobilepay', name: 'MobilePay', icon: 'smartphone' },
    { id: 'card', name: 'Luottokortti (Visa/MC)', icon: 'credit-card' },
    { id: 'bank', name: 'Pankkimaksu (Verkkopankit)', icon: 'globe' },
];

interface PaymentSelectionProps {
    finalTotal: number;
    termsAccepted: boolean;
    // 🔥 KORJATTU: onSelectMethod on nyt pakollinen (vaadittiin virheessä)
    onSelectMethod: Dispatch<SetStateAction<string | null>>;
    // 🛑 POISTETTU/KOMMENTOITU: onPlaceOrder propin vaatimus 🛑
    style?: ViewStyle;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
    finalTotal,
    onSelectMethod, // Otetaan vastaan Dispatch-funktio 
    style
}) => {
    // 🛑 Poistettu 'termsAccepted' ja 'onPlaceOrder' propeista, koska ne eivät ole enää tarpeen tässä komponentissa.

    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    // 🔥 EFFECT: Päivitä vanhempaa komponenttia (CheckoutScreen) heti, kun valinta muuttuu 🔥
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

            {/* Maksutapalista */}
            <View style={styles.optionsList}>
                {PAYMENT_OPTIONS.map(renderPaymentOption)}
            </View>

            {/* Lopullinen Yhteenveto (ILMAN NAPPULA VAIHEEN 3 MUKAISESTI) */}
            <View style={styles.footer}>
                <Text style={styles.totalLabel}>
                    Kokonaishinta:
                </Text>
                <Text style={styles.totalValue}>
                    {finalTotal.toFixed(2)} €
                </Text>

                {/* 🛑 POISTETTU: handlePlaceOrder-kutsu ja Maksa-nappi 🛑 
                   Maksu hoidetaan nyt CheckoutScreenin alareunan navigaation kautta.
                */}
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
        borderColor: COLORS.borderColor,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 15,
    },

    // --- Maksutapa Valinta ---
    optionsList: {
        marginBottom: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        backgroundColor: COLORS.lightGray,
    },
    optionButtonSelected: {
        borderColor: COLORS.primary,
        borderWidth: 2,
        backgroundColor: COLORS.white,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.darkText,
        marginLeft: 15,
        fontWeight: '500',
    },
    checkIcon: {
        marginLeft: 10,
    },

    // --- Footer & Nappi ---
    footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        paddingTop: 15,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        color: COLORS.darkText,
        marginBottom: 5,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 15,
    },
    // Poistettu tyylit placeOrderButtonille
});

export default PaymentSelection;