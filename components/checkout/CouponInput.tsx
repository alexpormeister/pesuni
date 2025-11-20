import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { supabase } from '../../lib/supabase'; // Oletetaan, että Supabase-client on saatavilla täältä

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    primary: '#00c2ff', // Nappi ja success-väri
    lightGray: '#F8F9FD',
    borderColor: '#EFEFEF',
    success: '#4CAF50', // Onnistunut tarkistus
    error: '#FF4500', // Virhe
};

// Tietokantataulun rakenne (pelkkä olennainen osa)
interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    usage_limit: number;
    usage_count: number;
    valid_from: string;
    valid_until: string;
}

interface CouponInputProps {
    onCouponApplied: (coupon: Coupon | null) => void; // Välittää kelvollisen kupongin takaisin
    currentTotal: number; // Tilauksen nykyinen kokonaissumma
    style?: ViewStyle;
}

const CouponInput: React.FC<CouponInputProps> = ({ onCouponApplied, currentTotal, style }) => {
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [validationMessage, setValidationMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Päivämäärämuunnin (helpottaa vertailua)
    const isCouponCurrentlyValid = (coupon: Coupon): boolean => {
        const now = new Date();
        const validFrom = new Date(coupon.valid_from);
        const validUntil = new Date(coupon.valid_until);

        return (
            validFrom <= now &&
            validUntil >= now &&
            coupon.usage_count < coupon.usage_limit
        );
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) {
            setValidationMessage({ message: "Syötä kuponkikoodi.", type: 'info' });
            return;
        }

        setIsLoading(true);
        setValidationMessage(null);
        setAppliedCoupon(null);
        onCouponApplied(null); // Nollaa kuponki ensin

        try {
            // 1. Hae kuponki tietokannasta
            const { data: couponData, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .limit(1)
                .single();

            if (error || !couponData) {
                setValidationMessage({ message: "Kuponkikoodi on virheellinen.", type: 'error' });
                return;
            }

            const coupon = couponData as Coupon;

            // 2. Tarkista kelpoisuus (päivämäärät ja käyttörajat)
            if (!isCouponCurrentlyValid(coupon)) {
                setValidationMessage({ message: "Kuponki ei ole enää voimassa tai sen käyttömäärä on ylittynyt.", type: 'error' });
                return;
            }

            // 3. Laske alennus (vain näyttöä varten)
            let discountDisplay;
            if (coupon.discount_type === 'percentage') {
                discountDisplay = `${coupon.discount_value}% alennus`;
            } else {
                discountDisplay = `${coupon.discount_value.toFixed(2)} € alennus`;
            }

            // 4. Onnistunut: Päivitä tila ja ilmoita vanhemmalle komponentille
            setAppliedCoupon(coupon);
            onCouponApplied(coupon);
            setValidationMessage({
                message: `Kuponki "${couponCode}" aktivoitu! Saat ${discountDisplay}.`,
                type: 'success'
            });

        } catch {
            setValidationMessage({ message: "Tarkistuksessa tapahtui virhe.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setValidationMessage(null);
        onCouponApplied(null);
    };

    // Näytettävä tila
    const statusColor = validationMessage?.type === 'success' ? COLORS.success : COLORS.error;
    const isApplied = !!appliedCoupon;

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>Kuponki</Text>

            <View style={styles.inputRow}>
                <TextInput
                    style={[styles.input, isApplied && styles.inputDisabled]}
                    placeholder="Syötä alennuskoodi"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    editable={!isApplied && !isLoading}
                    autoCapitalize="characters"
                />

                <TouchableOpacity
                    style={[styles.button, isApplied ? styles.clearButton : styles.applyButton]}
                    onPress={isApplied ? handleClearCoupon : handleApplyCoupon}
                    disabled={isLoading || (!couponCode && !isApplied)}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isApplied ? 'Poista' : 'Käytä'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {validationMessage && (
                <View style={styles.messageContainer}>
                    <Feather name={validationMessage.type === 'success' ? "check-circle" : "alert-circle"}
                        size={14} color={statusColor} />
                    <Text style={[styles.messageText, { color: statusColor }]}>
                        {validationMessage.message}
                    </Text>
                </View>
            )}

            {/* TÄRKEÄÄ: Ilmoita vanhemmalle komponentille (CheckoutScreen)
                 kuponkin arvo, jotta se voi päivittää lopullisen hinnan. */}
            {isApplied && (
                <Text style={styles.appliedText}>
                    ✅ Kuponki aktiivinen
                </Text>
            )}

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
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        color: COLORS.darkText,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        marginRight: 10,
    },
    inputDisabled: {
        opacity: 0.7,
        backgroundColor: COLORS.lightGray,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    applyButton: {
        backgroundColor: COLORS.primary,
    },
    clearButton: {
        backgroundColor: COLORS.error,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        padding: 5,
        borderRadius: 5,
    },
    messageText: {
        fontSize: 14,
        marginLeft: 8,
    },
    appliedText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.success,
        marginTop: 10,
    },
});

export default CouponInput;