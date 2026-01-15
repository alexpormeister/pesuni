import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSelector } from 'react-redux';
import { supabase } from '../../lib/supabase';
import { selectCartItems } from '../../redux/cartSlice';

import CartList from "../../components/washes/CartList";
import EmptyCart from "../../components/washes/EmptyWashes";
import OrderStatusCard from "../../components/washes/OrderStatusCard";

const COLORS = {
    white: '#ffffff',
    dark: '#333333',
    gray: '#f8f9fa',
    primary: '#00c2ff',
};

export default function WashesScreen() {
    const cartItems = useSelector(selectCartItems);
    // MUUTETTU: activeOrder -> activeOrders (taulukko)
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let subscription: any;

        const fetchUserActiveOrders = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Haetaan KAIKKI tilaukset, jotka eivät ole vielä perillä
                    const { data, error } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('user_id', user.id)
                        .neq('status', 'delivered')
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    setActiveOrders(data || []);

                    // REAALIAIKAINEN PÄIVITYS
                    subscription = supabase
                        .channel(`user-orders-${user.id}`)
                        .on(
                            'postgres_changes',
                            {
                                event: '*', // Kuunnellaan lisäyksiä, poistoja ja päivityksiä
                                schema: 'public',
                                table: 'orders',
                                filter: `user_id=eq.${user.id}`,
                            },
                            (payload) => {
                                // Jos tilaus päivittyy 'delivered'-tilaan, poistetaan se listalta
                                if (payload.eventType === 'UPDATE') {
                                    if (payload.new.status === 'delivered') {
                                        setActiveOrders(prev => prev.filter(o => o.id !== payload.new.id));
                                    } else {
                                        setActiveOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
                                    }
                                }
                                // Jos uusi tilaus lisätään, lisätään se listan alkuun
                                else if (payload.eventType === 'INSERT') {
                                    setActiveOrders(prev => [payload.new, ...prev]);
                                }
                            }
                        )
                        .subscribe();
                }
            } catch (error) {
                console.error("Virhe tilauksien haussa:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserActiveOrders();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // --- PRIORITEETTI 1: AKTIIVISET TILAUKSET ---
    if (activeOrders.length > 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Aktiiviset tilaukset</Text>
                </View>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {activeOrders.map((order) => (
                        <OrderStatusCard key={order.id} order={order} />
                    ))}
                </ScrollView>
            </SafeAreaView>
        );
    }

    // --- PRIORITEETTI 2: TYHJÄ OSTOSKORI ---
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

    // --- PRIORITEETTI 3: TUOTTEITA OSTOSKORISSA ---
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
    container: { flex: 1, backgroundColor: COLORS.gray },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 20 },
    header: {
        padding: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        elevation: 3,
        zIndex: 1,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.dark },
});