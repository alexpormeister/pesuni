import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const EmptyCart: React.FC = () => {
    const router = useRouter();

    // Funktio, joka hoitaa siirtymisen tilaushistoriaan
    const handleOrderHistory = () => {
        router.push({
            pathname: '/orders',
            params: { initialTab: 'History' }
        });
    };

    // Funktio, joka hoitaa siirtymisen ja scrollauksen HomeScreeenille (index-sivulle)
    const handleSelectWashScroll = () => {
        // Lähetetään parametri 'scrollToMenu' HomeScreeenille (index-sivulle)
        router.push({
            pathname: '/', // Oletettu polku HomeScreeenille
            params: { action: 'scrollToMenu' }
        });
    };


    return (
        <View style={styles.container}>
            <Image
                source={require("../../assets/images/empty-basket-removebg-preview.png")}
                style={styles.image}
                resizeMode="contain"
            />

            <Text style={styles.title}>Korisi on tyhjä</Text>
            <Text style={styles.subtitle}>
                Näyttäisi siltä, että et ole lisännyt vielä pesuja koriisi
            </Text>

            {/* KÄYTETÄÄN UUTTA SCROLLAAVAA FUNKTIOTA */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleSelectWashScroll}>
                <Text style={styles.primaryButtonText}>Valitse Pesu</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleOrderHistory}>
                <Text style={styles.secondaryButtonText}>Tilaushistoria</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    image: {
        width: 128,
        height: 128,
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: width * 0.7,
    },
    primaryButton: {
        backgroundColor: '#00c2ff',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 9999,
        width: '100%',
        maxWidth: 320,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    secondaryButtonText: {
        color: 'black',
        fontWeight: '600',
        fontSize: 16,
        textDecorationLine: "underline",
    },
});

export default EmptyCart;