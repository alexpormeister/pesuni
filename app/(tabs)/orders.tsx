import { useLocalSearchParams } from 'expo-router';
// 1. LISÄÄ useCallback importteihin
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ActiveOrders from '../../components/orders/ActiveOrders';
import HistoryItem from '../../components/orders/HistoryItems';
import { supabase } from '../../lib/supabase';

// ... (Samat värit ja interfacet kuin aiemmin) ...

const COLORS = {
    background: '#F8F9FD',
    darkText: '#0A1B32',
    lightGray: '#EFF2F7',
    white: '#FFFFFF',
    textGray: '#6B7280',
    primaryBlue: '#0E1B38',
};

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
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');

    const [historyOrders, setHistoryOrders] = useState<GroupedOrders[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (params.initialTab === 'History') setActiveTab('History');
        else if (params.initialTab === 'Active') setActiveTab('Active');
    }, [params.initialTab]);

    // 2. KÄÄRI TÄMÄ useCallbackiin
    // Koska fetchOrders käyttää tätä, myös tämän pitää olla vakaa (useCallback).
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
    }, []); // Ei riippuvuuksia

    // Muotoilee ajan: "18.11.2025 klo 14:30"
    const formatExactTime = (dateString: string) => {
        const date = new Date(dateString);

        const day = date.getDate();
        const month = date.getMonth() + 1; // Kuukaudet ovat 0-indeksöityjä
        const year = date.getFullYear();

        // Lisätään nolla alkuun jos tunti/minuutti on yksinumeroinen (esim. 9 -> 09)
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year} klo ${hours}:${minutes}`;
    };

    // 3. KÄÄRI MYÖS fetchOrders useCallbackiin
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
                // Nyt voimme kutsua tätä turvallisesti
                groupOrdersByMonth(data as any);
            }

        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [groupOrdersByMonth]); // Riippuvuutena groupOrdersByMonth

    // 4. LISÄÄ fetchOrders RIIPPUVUUSTAULUKKOON
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]); // Nyt tämä on turvallista eikä aiheuta looppia

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

    // ... return (renderöinti pysyy samana) ...
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Omat tilaukset</Text>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Active' && styles.activeTabButton]}
                        onPress={() => setActiveTab('Active')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}>
                            Aktiiviset {activeTab === 'Active' && <View style={styles.notificationDot}><Text style={styles.dotText}>1</Text></View>}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'History' && styles.activeTabButton]}
                        onPress={() => setActiveTab('History')}
                    >
                        <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>Historia</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'Active' ? (
                    <View>
                        <ActiveOrders />
                        <Text style={styles.emptyStateText}>Ei muita aktiivisia tilauksia</Text>
                    </View>
                ) : (
                    <View>
                        {loading ? (
                            <ActivityIndicator size="large" color={COLORS.primaryBlue} style={{ marginTop: 20 }} />
                        ) : (
                            historyOrders.length > 0 ? (
                                historyOrders.map((group, index) => (
                                    <View key={index}>
                                        <Text style={styles.sectionHeader}>{group.title}</Text>
                                        {group.data.map((order) => (
                                            <HistoryItem
                                                key={order.id}
                                                store={getItemsSummary(order.order_items)}
                                                date={formatDate(order.created_at)}
                                                price={`${order.payment_amount?.toFixed(2) || '0.00'} €`}
                                                items={formatExactTime(order.created_at)} isBurger={false}
                                            />
                                        ))}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyStateText}>Ei tilaushistoriaa.</Text>
                            )
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ... (Samat tyylit kuin aiemmin) ...
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        padding: 4,
        marginBottom: 25,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTabButton: {
        backgroundColor: COLORS.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textGray,
    },
    activeTabText: {
        color: COLORS.darkText,
    },
    notificationDot: {
        backgroundColor: '#DCE4F9',
        borderRadius: 10,
        paddingHorizontal: 6,
        marginLeft: 5,
    },
    dotText: {
        color: '#5abaff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyStateText: {
        textAlign: 'center',
        color: '#9CA3AF',
        marginTop: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginTop: 10,
        marginBottom: 15,
    },
});