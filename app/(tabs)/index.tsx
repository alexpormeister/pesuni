import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import HomeHeader from "../../components/home/HomeHeader";
import LocationBar from "../../components/home/LocationBar";
import ServiceGrid from "../../components/home/ServiceGrid";
import CartModal from "../../components/CartModal";
export default function HomeScreen() {
    const router = useRouter();

    const [isCartVisible, setIsCartVisible] = useState(false);

    const handleStartWash = () => {
        console.log("Aloita Pesu painettu! Navigoi pesutilauksen luontiin.");
    };

    const handleGoToProfile = () => {
        console.log("Navigoidaan profiiliin...");
        router.push('/profile');
    };

    const handleCartPress = () => {
        console.log("Ostoskoria painettu! Avataan modaali.");
        setIsCartVisible(true);
    };

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <ServiceGrid
                    ListHeaderComponent={
                        <>
                            <HomeHeader onStartPress={handleStartWash} />
                            <LocationBar
                                onAddNewAddress={handleGoToProfile}
                                onCartPress={handleCartPress}
                            />
                            <Text style={styles.mainTitle}>Valitse Pesusi</Text>
                        </>
                    }
                />
            </SafeAreaView>

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