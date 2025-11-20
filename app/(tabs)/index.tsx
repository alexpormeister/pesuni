import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux'; // 🔥 LISÄTTY: useDispatch
import { selectCartItems } from '../../redux/cartSlice';

// 🔥 LISÄTTY: Tuo profiilin hakutoiminto (Thunk) 🔥
// HUOM: Muuta alla oleva polku, jos fetchUserProfile ei ole täällä!
// Oletan, että olet tehnyt tästä Redux Thunk -funktion,
// joka dispatchataan Reduxiin.
import { fetchUserProfile } from "../../redux/profileThunks";


import CartModal from "../../components/CartModal";
import FloatingCartBubble from "../../components/FloatingCartBubble";
import HomeHeader from "../../components/home/HomeHeader";
import LocationBar from "../../components/home/LocationBar";
import ServiceGrid from "../../components/home/ServiceGrid";

// VAKIO: Kuinka paljon tilaa jätetään otsikon yläpuolelle
const SCROLL_OFFSET_ADJUSTMENT = 55;

// Funktio scrollauksen suorittamiseksi
const performScroll = (ref: any, offset: number) => {
    if (ref.current && offset > 0) {
        const targetOffset = offset - SCROLL_OFFSET_ADJUSTMENT;

        // Timeout varmistaa, että asettelu on valmis
        setTimeout(() => {
            ref.current.scrollToOffset({
                offset: Math.max(0, targetOffset),
                animated: true,
            });
        }, 100);
    }
};

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch(); // 🔥 DISPATCH ALUSTETTU 🔥

    // UUSI: LUE NAVIGOINTIPARAMETRIT
    const params = useLocalSearchParams();

    // REDUX: Tarkista, onko ostoskorissa tuotteita
    const cartItems = useSelector(selectCartItems);
    const hasItemsInCart = cartItems.length > 0;

    const [isCartVisible, setIsCartVisible] = useState(false);

    const serviceGridRef = useRef<any>(null);
    const [headerOffset, setHeaderOffset] = useState(0);


    // --- 1. EFFECT PROFIILIN ESILATAUKSELLE ---
    useEffect(() => {
        // Lataa profiilidata heti, kun sovellus avataan Tabs-näkymään.
        // Tämä varmistaa, että Checkout-sivu saa datan.
        dispatch(fetchUserProfile() as any);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // ------------------------------------------


    // --- 2. EFFECT SCROLLAUKSELLE NAVIGOINNIN JÄLKEEN (EmptyCartista) ---
    useEffect(() => {
        // Jos 'action' parametri on asetettu ja korkeus tiedetään
        if (params.action === 'scrollToMenu' && headerOffset > 0) {
            performScroll(serviceGridRef, headerOffset);

            // TÄRKEÄÄ: Poista parametri URL:stä, jotta scrollaus ei tapahdu uudelleen
            router.setParams({ action: undefined });
        }
    }, [params.action, headerOffset, router]);


    // --- 3. handleStartWash FUNKTIO (NÄYTTÖKOMPONENTIN OMA NAPPI) ---
    const handleStartWash = () => {
        // Suorita scrollaus välittömästi, kun headerin painiketta painetaan
        performScroll(serviceGridRef, headerOffset);
    };

    const handleGoToProfile = () => {
        router.push('/profile');
    };

    const handleCartPress = () => {
        setIsCartVisible(true);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            <ServiceGrid
                ref={serviceGridRef}
                ListHeaderComponent={
                    <>
                        <View
                            onLayout={(event) => {
                                // Tallenna HomeHeaderin + LocationBarin kokonaiskorkeus
                                setHeaderOffset(event.nativeEvent.layout.height);
                            }}
                        >
                            <HomeHeader
                                onStartPress={handleStartWash}
                                style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top }}
                            />

                            <LocationBar
                                onAddNewAddress={handleGoToProfile}
                                onCartPress={handleCartPress}
                            />
                        </View>

                        <Text style={styles.mainTitle}>Valitse Pesusi</Text>
                    </>
                }
            />

            {/* LEIJUVA OSTOSKORI PALLO */}
            {hasItemsInCart && (
                <FloatingCartBubble onPress={handleCartPress} />
            )}

            <CartModal
                isVisible={isCartVisible}
                onClose={() => setIsCartVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        paddingHorizontal: 25,
        marginTop: 35,
        marginBottom: 25,
        textAlign: "center",
        backgroundColor: 'white',
    },
});