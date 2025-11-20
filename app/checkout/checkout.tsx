import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { supabase } from '../../lib/supabase';

// --- REDUX IMPORTS ---
import { selectCartItems } from '../../redux/cartSlice';
import { selectUserProfile, UserProfile } from '../../redux/profileSlice'; // Tuo UserProfile täältä

// --- KOMPONENTTI IMPORTS ---
import CouponInput from '../../components/checkout/CouponInput';
import CustomerInfoBlock from '../../components/checkout/CustomerInfoBlock';
import ExtraInstructions from '../../components/checkout/ExtraInstructions';
import OrderSummaryCard from '../../components/checkout/OrderSummaryCard';
import PaymentSelection from '../../components/checkout/PaymentSelection';
import TermsCheckbox from '../../components/checkout/TermsCheckbox';
import TimeSlotPicker from '../../components/checkout/TimeSlotPicker';

// --- MOCK TYPIT ---
interface TimeSlot { id: string; time: string; isAvailable: boolean; }
interface Coupon { id: string; discount_type: 'percentage' | 'fixed'; discount_value: number; }

const COLORS = {
    white: '#FFFFFF', darkText: '#0A1B32', textGray: '#6B7280', primary: '#00c2ff', lightGrayBackground: '#F8F9FD', borderColor: '#EFEFEF',
};

// --- PÄÄKOMPONENTTI ---
export default function CheckoutScreen() {
    const router = useRouter();

    const cartItems = useSelector(selectCartItems);
    const userProfile: UserProfile | null = useSelector(selectUserProfile) as (UserProfile | null); // Käytä | null

    // --- VAIHEIDEN HALLINTA ---
    const [currentStep, setCurrentStep] = useState(1);
    const MAX_STEPS = 3;

    // --- TILA KAIKILLE LOMAKETIETOJEN VALINNOILLE ---
    const [pickupSlot, setPickupSlot] = useState<TimeSlot | null>(null);
    const [deliverySlot, setDeliverySlot] = useState<TimeSlot | null>(null);
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null); // Uusi tila maksutavalle

    // --- FINAL TOTAL LASKENTA ---
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

        return { subtotal: initialSubtotal, finalTotal: Math.max(0, currentTotal) };
    }, [cartItems, appliedCoupon]);


    // --- 1. VAIHEEN VALIDIOINTI (Yhteenveto & Tiedot) ---
    const isStepOneValid = useMemo(() => {
        // Tarkista, että nimi, puhelin ja osoite ovat olemassa
        const profileReady = userProfile &&
            userProfile.first_name &&
            userProfile.phone &&
            userProfile.address;

        // Varmista, että ostoskorissa on tuotteita
        const cartReady = cartItems.length > 0;

        return !!(profileReady && cartReady);
    }, [userProfile, cartItems]);


    // --- 2. VAIHEEN VALIDIOINTI (Nouto & Aika) ---
    const isStepTwoValid = useMemo(() => {
        return !!(pickupSlot && deliverySlot);
    }, [pickupSlot, deliverySlot]);


    // --- 3. VAIHEEN VALIDIOINTI (Ehdot & Maksu) ---
    const isStepThreeValid = useMemo(() => {
        return termsAccepted && !!selectedPaymentMethodId;
    }, [termsAccepted, selectedPaymentMethodId]);


    // --- NAVIGOINTIFUNKTIOT ---

    const handleNext = () => {
        let isValid = false;

        if (currentStep === 1) {
            isValid = isStepOneValid;
            if (!isValid) {
                Alert.alert("Puuttuvat tiedot", "Täytä yhteystiedot ja osoite ennen jatkamista.");
            }
        } else if (currentStep === 2) {
            isValid = isStepTwoValid;
            if (!isValid) {
                Alert.alert("Puuttuvat tiedot", "Valitse nouto- ja palautusajat ennen jatkamista.");
            }
        } else if (currentStep === 3) {
            isValid = isStepThreeValid;
            if (!isValid) {
                Alert.alert("Puuttuvat tiedot", "Hyväksy ehdot ja valitse maksutapa.");
            }
        }

        if (isValid && currentStep < MAX_STEPS) {
            setCurrentStep(currentStep + 1);
        } else if (isValid && currentStep === MAX_STEPS) {
            // Viimeinen vaihe -> Aloita tilaus
            if (selectedPaymentMethodId) {
                handlePlaceOrder(selectedPaymentMethodId);
            }
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            handleGoBack(); // Palaa edelliseen näyttöön (ostoskori)
        }
    };

    const handleGoBack = () => {
        router.push('/washes');
    };

    const handlePlaceOrder = async (methodId: string) => {
        // Validointi tapahtuu jo handleNext-funktiossa (isStepThreeValid)

        setIsProcessing(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !userProfile) {
            Alert.alert("Virhe", "Kirjaudu sisään jatkaaksesi tilausta.");
            setIsProcessing(false);
            return;
        }

        const orderPayload = {
            userId: user.id,
            cartDetails: cartItems,
            totalAmount: finalTotal,
            paymentMethod: methodId,

            pickupSlot: pickupSlot?.time,
            deliverySlot: deliverySlot?.time,
            address: userProfile.address,

            specialInstructions,
            couponId: appliedCoupon?.id || null,

            termsAccepted: termsAccepted,
        };

        console.log("Valmis tilauslähetys (Payload):", orderPayload);

        // Simulaatio:
        setTimeout(() => {
            setIsProcessing(false);
            Alert.alert("Tilaus vastaanotettu", "Siirrytään maksamaan!");
            // TÄSTÄ ETTEENPÄIN: Käyttäjä siirrettäisiin maksupalveluun (esim. Stripe/Paytrail)
            // router.replace('/orders/success'); 
        }, 1500);
    };

    if (isProcessing) {
        return (
            <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.processingText}>Käsitellään tilausta...</Text>
            </View>
        );
    }

    if (cartItems.length === 0) {
        return (
            <View style={styles.processingContainer}>
                <Text style={styles.processingText}>Ostoskori on tyhjä.</Text>
                <TouchableOpacity onPress={() => router.replace('/')}>
                    <Text style={{ color: COLORS.primary, marginTop: 10 }}>Palaa etusivulle</Text>
                </TouchableOpacity>
            </View>
        )
    }

    // Apumuuttuja Linterin varalta
    const ensureLinterSatisfaction = [subtotal];

    // --- VAIHEIDEN RENDERÖINTI ---

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Yhteenveto ja asiakastiedot ja nouto
                return (
                    <>
                        <Text style={styles.stepTitle}>Vaihe 1: Yhteenveto & Asiakastiedot</Text>
                        <OrderSummaryCard style={{ marginHorizontal: 0 }} />

                        {subtotal !== finalTotal && (
                            <View style={styles.subtotalWarning}>
                                <Text style={styles.subtotalText}>
                                    Alkuperäinen välisumma: {ensureLinterSatisfaction[0].toFixed(2)} €
                                </Text>
                            </View>
                        )}

                        <CustomerInfoBlock onEditPress={() => router.push('/general/personal-data')} />
                    </>
                );

            case 2: // Noutotapa ja aikaikkunat
                return (
                    <>
                        <Text style={styles.stepTitle}>Vaihe 2: Nouto & Palautusajat</Text>
                        <TimeSlotPicker
                            onSelectionChange={(pickup, delivery) => {
                                setPickupSlot(pickup);
                                setDeliverySlot(delivery);
                            }}
                        />
                        <ExtraInstructions
                            onChangeText={setSpecialInstructions}
                        />
                    </>
                );

            case 3: // Ehdot, kuponki ja maksutapa
                return (
                    <>
                        <Text style={styles.stepTitle}>Vaihe 3: Ehdot & Maksu</Text>
                        <TermsCheckbox
                            onToggle={setTermsAccepted}
                            isAccepted={termsAccepted} // Näytetään valinta
                        />
                        <CouponInput
                            onCouponApplied={setAppliedCoupon}
                            currentTotal={finalTotal}
                        />
                        <PaymentSelection
                            finalTotal={finalTotal}
                            termsAccepted={termsAccepted}
                            onSelectMethod={setSelectedPaymentMethodId} // Tallennetaan valinta
                        />
                    </>
                );
            default:
                return null;
        }
    };

    // --- LOPULLINEN RENDERÖINTI ---
    return (
        <SafeAreaView style={styles.fullScreen}>
            <View style={styles.header}>
                {/* Takaisin-nappi vie edelliseen vaiheeseen tai edelliseen sivuun */}
                <TouchableOpacity onPress={handlePrev} style={styles.backButton}>
                    <Feather name="chevron-left" size={24} color={COLORS.darkText} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Tilaus ({currentStep}/{MAX_STEPS})</Text>

                <View style={styles.backButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderStepContent()}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* --- SEURAAVA / MAKSA NAPPI --- */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handleNext}
                    style={[
                        styles.nextButton,
                        // Määrittää, onko painike aktiivinen
                        (currentStep === 1 && !isStepOneValid) ||
                            (currentStep === 2 && !isStepTwoValid) ||
                            (currentStep === 3 && !isStepThreeValid)
                            ? styles.disabledButton
                            : {}
                    ]}
                    disabled={
                        (currentStep === 1 && !isStepOneValid) ||
                        (currentStep === 2 && !isStepTwoValid) ||
                        (currentStep === 3 && !isStepThreeValid)
                    }
                >
                    <Text style={styles.nextButtonText}>
                        {currentStep < MAX_STEPS ? 'Seuraava' : `Maksa ${finalTotal.toFixed(2)} €`}
                    </Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: COLORS.lightGrayBackground,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    scrollContent: {
        paddingVertical: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
        flexGrow: 1,
        textAlign: 'center',
    },
    processingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    processingText: {
        marginTop: 15,
        fontSize: 18,
        color: COLORS.darkText,
    },
    subtotalWarning: {
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#FFF8E1',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#FFC107',
    },
    subtotalText: {
        fontSize: 14,
        color: COLORS.darkText,
        fontWeight: '600',
    },
    // --- UUSI FOOTER JA NAPIT ---
    footer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
    },
    nextButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: COLORS.textGray,
        opacity: 0.7,
    },
    nextButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    }
});