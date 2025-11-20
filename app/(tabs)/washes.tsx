import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useSelector } from 'react-redux';
import { selectCartItems } from '../../redux/cartSlice';

import CartList from "../../components/washes/CartList";
import EmptyCart from "../../components/washes/EmptyWashes"; // Oletetaan, että tämä on EmptyWashes.tsx

const COLORS = {
    white: '#ffffff',
    dark: '#333333',
    gray: '#f0f0f0',
};

export default function WashesScreen() {
    const cartItems = useSelector(selectCartItems);

    if (cartItems.length === 0) {
        return (
            <LinearGradient
                colors={['#00c2ff', '#ffffff']}
                style={styles.emptyContainer}
                locations={[0, 0.44]}
            >
                <EmptyCart />
            </LinearGradient>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ostoskori</Text>
            </View>

            <CartList />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.gray,
    },
    header: {
        padding: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
});