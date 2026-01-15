import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems } from '../../redux/cartSlice';
import { fetchUserProfile } from "../../redux/profileThunks";

import CartModal from "../../components/CartModal";
import FloatingCartBubble from "../../components/FloatingCartBubble";
import HomeHeader from "../../components/home/HomeHeader";
import LocationBar from "../../components/home/LocationBar";
import ServiceGrid from "../../components/home/ServiceGrid";

const SCROLL_OFFSET_ADJUSTMENT = 55;

const performScroll = (ref: any, offset: number) => {
    if (ref.current && offset > 0) {
        const targetOffset = offset - SCROLL_OFFSET_ADJUSTMENT;
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
    const dispatch = useDispatch();
    const params = useLocalSearchParams();

    const cartItems = useSelector(selectCartItems);
    const hasItemsInCart = cartItems.length > 0;

    const [isCartVisible, setIsCartVisible] = useState(false);
    const serviceGridRef = useRef<any>(null);
    const [headerOffset, setHeaderOffset] = useState(0);

    useEffect(() => {
        dispatch(fetchUserProfile() as any);
    }, [dispatch]);

    useEffect(() => {
        if (params.action === 'scrollToMenu' && headerOffset > 0) {
            performScroll(serviceGridRef, headerOffset);
            router.setParams({ action: undefined });
        }
    }, [params.action, headerOffset, router]);

    const handleStartWash = () => {
        performScroll(serviceGridRef, headerOffset);
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
                                setHeaderOffset(event.nativeEvent.layout.height);
                            }}
                        >
                            <HomeHeader
                                onStartPress={handleStartWash}
                                style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top }}
                            />

                            {/* 🔥 KORJAUS: Poistettu onAddNewAddress proppi 🔥 */}
                            <LocationBar
                                onCartPress={handleCartPress}
                            />
                        </View>

                        <Text style={styles.mainTitle}>Valitse Pesusi</Text>
                    </>
                }
            />

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
        color: '#1A1B32',
        paddingHorizontal: 25,
        marginTop: 35,
        marginBottom: 25,
        textAlign: "center",
    },
});