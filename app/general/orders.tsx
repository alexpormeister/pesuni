import { Feather } from '@expo/vector-icons'; // LISÄTTY: Ikoni takaisin-nappia varten
import { useRouter } from 'expo-router'; // LISÄTTY: Reititys takaisin-nappia varten
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HistoryItem from '../../components/orders/HistoryItems';
import { supabase } from '../../lib/supabase';

const COLORS = {
    background: '#F8F9FD',
    darkText: '#0A1B32',
    lightGray: '#EFF2F7',
    white: '#FFFFFF',
    textGray: '#6B7280',
    primaryBlue: '#0E1B38',
    borderColor: '#EFEFEF',
};

// ... (Interface-määrittelyt pysyvät samoina) ...
interface OrderItem {
    product_name: string;
    service_name: string;
    quantity: number;
}

interface Order {
    id: string;
    created_at: string;
    payment_amount: number;
    status: string;
    order_items: OrderItem[];
}

interface GroupedOrders {
    title: string;
    data: Order[];
}

export default function MyOrdersScreen() {
    const router = useRouter(); // LISÄTTY
    const [historyOrders, setHistoryOrders] = useState<GroupedOrders[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const groupOrdersByMonth = useCallback((orders: Order[]) => {
        const groups: { [key: string]: Order[] } = {};

        orders.forEach(order => {
            const date = new Date(order.created_at);
            const now = new Date();
            let groupTitle = '';

            if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                groupTitle = 'Tässä kuussa';
            } else {
                const monthNames = ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"];
                groupTitle = monthNames[date.getMonth()];
            }

            if (!groups[groupTitle]) {
                groups[groupTitle] = [];
            }
            groups[groupTitle].push(order);
        });

        const groupedArray = Object.keys(groups).map(key => ({
            title: key,
            data: groups[key]
        }));

        setHistoryOrders(groupedArray);
    }, []);

    const formatExactTime = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month}.${year} klo ${hours}:${minutes}`;
    };

    const fetchOrders = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    created_at,
                    payment_amount, 
                    status,
                    order_items (
                        product_name,
                        service_name,
                        quantity
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                groupOrdersByMonth(data as any);
            }

        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [groupOrdersByMonth]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()}. ${["Tammikuuta", "Helmikuuta", "Maaliskuuta", "Huhtikuuta", "Toukokuuta", "Kesäkuuta", "Heinäkuuta", "Elokuuta", "Syyskuuta", "Lokakuuta", "Marraskuuta", "Joulukuuta"][date.getMonth()]}`;
    };

    const getItemsSummary = (items: OrderItem[]) => {
        if (!items || items.length === 0) return "Ei tuotteita";
        if (items.length === 1) {
            return items[0].product_name || items[0].service_name || "1 tuote";
        }
        return `${items.length} tuotetta`;
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* PÄIVITETTY HEADER TAKAISIN-NAPILLA */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="chevron-left" size={28} color={COLORS.darkText} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tilaushistoria</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primaryBlue} style={{ marginTop: 50 }} />
                ) : (
                    historyOrders.length > 0 ? (
                        historyOrders.map((group, index) => (
                            <View key={index} style={styles.section}>
                                <Text style={styles.sectionHeader}>{group.title}</Text>
                                {group.data.map((order) => (
                                    <HistoryItem
                                        key={order.id}
                                        store={getItemsSummary(order.order_items)}
                                        date={formatDate(order.created_at)}
                                        price={`${order.payment_amount?.toFixed(2) || '0.00'} €`}
                                        items={formatExactTime(order.created_at)}
                                        isBurger={false}
                                    />
                                ))}
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>Ei aiempia tilauksia.</Text>
                        </View>
                    )
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === 'ios' ? 15 : 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    backButton: {
        padding: 5,
        marginLeft: -5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 50,
        paddingTop: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textGray,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 15,
        marginBottom: 10,
    },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: COLORS.textGray,
    },
});