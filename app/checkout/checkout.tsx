import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 🔥 LISÄTTY
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../../lib/supabase';

// --- REDUX IMPORTS ---
import { clearCart, selectCartItems } from '../../redux/cartSlice';
import { selectUserProfile, UserProfile } from '../../redux/profileSlice';

// --- KOMPONENTTI IMPORTS ---
import CouponInput from '../../components/checkout/CouponInput';
import CustomerInfoBlock from '../../components/checkout/CustomerInfoBlock';
import ExtraInstructions from '../../components/checkout/ExtraInstructions';
import OrderSummaryCard from '../../components/checkout/OrderSummaryCard';
import PaymentSelection from '../../components/checkout/PaymentSelection';
import PointsUsage from '../../components/checkout/PointsUsage';
import SwipeButton from '../../components/checkout/SwipeButton'; // 🔥 LISÄTTY
import TermsCheckbox from '../../components/checkout/TermsCheckbox';
import TimeSlotPicker from '../../components/checkout/TimeSlotPicker';

// --- TYYPIT ---
interface Coupon { id: string; discount_type: 'percentage' | 'fixed'; discount_value: number; }

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    primary: '#00c2ff',
    lightGrayBackground: '#F8F9FD',
    borderColor: '#EFEFEF',
    successBackground: '#F0FAFF',
};

export default function CheckoutScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const cartItems = useSelector(selectCartItems);
    const userProfile: UserProfile | null = useSelector(selectUserProfile) as (UserProfile | null);

    const [currentStep, setCurrentStep] = useState(1);
    const MAX_STEPS = 3;

    const [pickupSlot, setPickupSlot] = useState<any | null>(null);
    const [deliverySlot, setDeliverySlot] = useState<any | null>(null);

    const [specialInstructions, setSpecialInstructions] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);

    const [pointsDiscount, setPointsDiscount] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);

    const handleTimeSlotChange = useCallback((pickup: any, delivery: any) => {
        setPickupSlot(pickup);
        setDeliverySlot(delivery);
    }, []);

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                router.replace('/washes');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, router]);

    const { subtotal, finalTotal } = useMemo(() => {
        const initialSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let currentTotal = initialSubtotal;

        if (appliedCoupon) {
            if (appliedCoupon.discount_type === 'percentage') {
                currentTotal *= (1 - appliedCoupon.discount_value / 100);
            } else if (appliedCoupon.discount_type === 'fixed') {
                currentTotal -= appliedCoupon.discount_value;
            }
        }

        currentTotal -= pointsDiscount;

        return { subtotal: initialSubtotal, finalTotal: Math.max(0, currentTotal) };
    }, [cartItems, appliedCoupon, pointsDiscount]);

    const isStepOneValid = useMemo(() => {
        const profileReady = userProfile && userProfile.first_name && userProfile.phone && userProfile.address;
        return !!(profileReady && cartItems.length > 0);
    }, [userProfile, cartItems]);

    const isStepTwoValid = useMemo(() => !!(pickupSlot?.slot || pickupSlot?.time), [pickupSlot]);
    const isStepThreeValid = useMemo(() => termsAccepted && !!selectedPaymentMethodId, [termsAccepted, selectedPaymentMethodId]);

    const handlePlaceOrder = async (methodId: string) => {
        const pickupText = pickupSlot?.slot?.time || "";
        const deliveryText = deliverySlot?.slot?.time || pickupText;

        if (!pickupText) {
            Alert.alert("Virhe", "Valitse noutoaika.");
            return;
        }

        const formatTimeOnly = (text: string) => {
            const m = text.match(/\d{2}:\d{2}/);
            return m ? `${m[0]}:00` : "08:00:00";
        };

        const createFullIso = (dateObj: Date, tStr: string) => {
            const m = tStr.match(/\d{2}:\d{2}/);
            const t = m ? m[0] : "12:00";
            const [h, min] = t.split(':');
            const d = new Date(dateObj || new Date());
            d.setHours(parseInt(h), parseInt(min), 0, 0);
            return d.toISOString();
        };

        const formatDateOnly = (date: Date) => {
            return new Date(date).toISOString().split('T')[0];
        };

        const pickupTimeOnly = formatTimeOnly(pickupText);
        const returnTimeOnly = formatTimeOnly(deliveryText);
        const pickupDateStr = formatDateOnly(pickupSlot.date);
        const returnDateStr = formatDateOnly(deliverySlot?.date || pickupSlot.date);
        const pickupFull = createFullIso(pickupSlot.date, pickupText);
        const deliveryFull = createFullIso(deliverySlot?.date || pickupSlot.date, deliveryText);

        setIsProcessing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !userProfile) throw new Error("Käyttäjää ei löydy");

            const { error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    first_name: userProfile.first_name,
                    last_name: userProfile.last_name || '',
                    phone: userProfile.phone || '',
                    address: userProfile.address,
                    price: subtotal,
                    final_price: finalTotal,
                    service_type: 'multiple',
                    service_name: cartItems[0]?.name || 'Pesupalvelu',
                    pickup_date: pickupDateStr,
                    return_date: returnDateStr,
                    pickup_time: pickupTimeOnly,
                    return_time: returnTimeOnly,
                    pickup_slot: pickupFull,
                    delivery_slot: deliveryFull,
                    tracking_status: 'pending',
                    paid_at: new Date().toISOString(),
                    access_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    payment_method: methodId,
                    special_instructions: specialInstructions || '',
                }]);

            if (orderError) throw orderError;

            if (pointsToUse > 0) {
                const { error: pointsError } = await supabase.rpc('deduct_points', {
                    user_id_param: user.id,
                    amount_to_deduct: pointsToUse
                });
                if (pointsError) console.error("Pisteiden vähennys epäonnistui", pointsError);
            }

            setIsProcessing(false);
            setIsSuccess(true);
            (dispatch as any)(clearCart());

        } catch (error: any) {
            console.error("Tilausvirhe:", error);
            Alert.alert("Virhe", `Tilaus epäonnistui: ${error.message}`);
            setIsProcessing(false);
        }
    };

    const handleNext = () => {
        let isValid = false;
        if (currentStep === 1) isValid = isStepOneValid;
        else if (currentStep === 2) isValid = isStepTwoValid;
        else if (currentStep === 3) isValid = isStepThreeValid;

        if (isValid && currentStep < MAX_STEPS) {
            setCurrentStep(currentStep + 1);
        } else if (isValid && currentStep === MAX_STEPS) {
            if (selectedPaymentMethodId) handlePlaceOrder(selectedPaymentMethodId);
        } else {
            Alert.alert("Puuttuvat tiedot", "Täytä kaikki vaaditut kentät edetäksesi.");
        }
    };

    if (isProcessing) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.statusText}>Käsitellään tilausta...</Text>
            </View>
        );
    }

    if (isSuccess) {
        return (
            <View style={styles.centeredContainer}>
                <Feather name="check-circle" size={80} color={COLORS.primary} />
                <Text style={styles.successTitle}>Kiitos tilauksesta!</Text>
                <Text style={styles.successSubtitle}>Tilaus on vastaanotettu. Siirrytään seurantaan...</Text>
                <TouchableOpacity style={styles.manualButton} onPress={() => router.replace('/washes')}>
                    <Text style={styles.manualButtonText}>Siirry nyt</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.fullScreen}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}>
                        <Feather name="chevron-left" size={24} color={COLORS.darkText} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tilaus ({currentStep}/{MAX_STEPS})</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {currentStep === 1 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.stepTitle}>Vaihe 1: Yhteenveto & Tiedot</Text>
                            <OrderSummaryCard style={{ marginHorizontal: 0 }} />
                            <CustomerInfoBlock onEditPress={() => router.push('/general/personal-data')} />
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.stepTitle}>Vaihe 2: Nouto & Palautus</Text>
                            <TimeSlotPicker onSelectionChange={handleTimeSlotChange} />
                            <ExtraInstructions onChangeText={setSpecialInstructions} />
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.stepTitle}>Vaihe 3: Maksutapa & Alennukset</Text>
                            <TermsCheckbox onToggle={setTermsAccepted} isAccepted={termsAccepted} />

                            <PointsUsage
                                onPointsApplied={(discount, points) => {
                                    setPointsDiscount(discount);
                                    setPointsToUse(points);
                                }}
                            />

                            <CouponInput onCouponApplied={setAppliedCoupon} currentTotal={finalTotal} />

                            <PaymentSelection
                                originalTotal={subtotal}
                                finalTotal={finalTotal}
                                onSelectMethod={setSelectedPaymentMethodId}
                            />
                        </View>
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>

                <View style={styles.footer}>
                    {currentStep < MAX_STEPS ? (
                        <TouchableOpacity
                            onPress={handleNext}
                            style={[
                                styles.primaryButton,
                                ((currentStep === 1 && !isStepOneValid) ||
                                    (currentStep === 2 && !isStepTwoValid)) && styles.disabledButton
                            ]}
                            disabled={(currentStep === 1 && !isStepOneValid) || (currentStep === 2 && !isStepTwoValid)}
                        >
                            <Text style={styles.primaryButtonText}>Seuraava</Text>
                        </TouchableOpacity>
                    ) : (
                        <SwipeButton
                            title={`Pyyhkäise ja Maksa ${finalTotal.toFixed(2)} €`}
                            onSwipeSuccess={() => {
                                if (selectedPaymentMethodId) {
                                    handlePlaceOrder(selectedPaymentMethodId);
                                }
                            }}
                            disabled={!isStepThreeValid}
                        />
                    )}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    fullScreen: { flex: 1, backgroundColor: COLORS.lightGrayBackground },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText },
    scrollContent: { paddingVertical: 10 },
    stepContainer: { paddingTop: 5 },
    stepTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkText, marginHorizontal: 20, marginTop: 10, marginBottom: 10 },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white, padding: 40 },
    statusText: { marginTop: 15, fontSize: 18, color: COLORS.darkText },
    successTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.darkText, marginTop: 20 },
    successSubtitle: { fontSize: 16, color: COLORS.textGray, textAlign: 'center', marginTop: 10, lineHeight: 22 },
    manualButton: { marginTop: 30, paddingVertical: 10 },
    manualButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
    footer: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 20, borderTopWidth: 1, borderTopColor: COLORS.borderColor, alignItems: 'center' },
    primaryButton: { width: '100%', backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
    primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: COLORS.textGray, opacity: 0.5 },
});