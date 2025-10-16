import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';

// Tuodaan EmptyCart-komponentti. Varmista, että polku on oikea.
import EmptyCart from "../components/washes/EmptyCart";

// Tämä on WashesScreen-sivu, joka näyttää tilauskorin tilan.
export default function WashesScreen() {

    // Käsittelijäfunktiot, jotka välitetään EmptyCart-komponentille
    const handleSelectWash = () => {
        console.log("Navigoidaan pesun valintaan...");
        // Tähän tulisi navigointilogiikka, esim. router.push('/select-wash');
    };

    const handleOrderHistory = () => {
        console.log("Navigoidaan tilaushistoriaan...");
        // Tähän tulisi navigointilogiikka, esim. router.push('/order-history');
    };

    return (
        // 1. Poistettu <ScrollView>. LinearGradient on nyt juurikomponentti.
        // Se täyttää automaattisesti sille annetun tilan (koko näytön alapalkkiin asti).
        <LinearGradient
            colors={['#00c2ff', '#ffffff']} // Värit ylhäältä alas
            style={styles.container}
            locations={[0, 0.44]}
        >
            {/* 2. EmptyCart-komponentti asettuu nyt siististi keskelle liukuväriä. */}
            <EmptyCart
                onSelectWash={handleSelectWash}
                onOrderHistory={handleOrderHistory}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Varmistaa, että liukuväri täyttää koko sille varatun tilan
        justifyContent: 'center',
        alignItems: 'center',
    },
});

