import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

// --- VÄRIT ---
const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    lightGrayBackground: '#F8F9FD',
    borderColor: '#EFEFEF',
    primary: '#00c2ff',
    unreadRed: '#FF3B30',
    arrowColor: '#9CA3AF',
};

// Laajennettu tyyppi tiedonhallintaan
interface ChatThreadExtended {
    id: string;
    user_id: string;
    created_at: string;
    last_message_at: string;
    status: 'open' | 'closed';
    is_read: boolean;
    last_sender_id: string | null;
}

const UserMessagesScreen = () => {
    const router = useRouter();
    const [threads, setThreads] = useState<ChatThreadExtended[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Datan haku ja lähettäjän tarkistus
    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id || null;
        setUserId(currentUserId);

        if (!currentUserId) {
            router.replace('/auth/login');
            return;
        }

        // 1. Haetaan keskustelut
        const { data: threadData, error: threadError } = await supabase
            .from('support_chats')
            .select('*')
            .eq('user_id', currentUserId)
            .order('last_message_at', { ascending: false });

        if (threadError) {
            console.error('Virhe chatien haussa:', threadError);
            setIsLoading(false);
            return;
        }

        if (threadData) {
            // 2. Haetaan jokaisen ketjun viimeisin lähettäjä chat_messages-taulukosta
            const enrichedThreads = await Promise.all(
                threadData.map(async (thread) => {
                    const { data: lastMsg } = await supabase
                        .from('chat_messages')
                        .select('sender_id')
                        .eq('chat_id', thread.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    return {
                        ...thread,
                        last_sender_id: lastMsg?.sender_id || null,
                    };
                })
            );
            setThreads(enrichedThreads);
        }
        setIsLoading(false);
    }, [router]);

    useEffect(() => {
        fetchData();

        if (!userId) return;

        // Kuunnellaan muutoksia support_chats-taulukossa (esim. is_read tilan muutos)
        const channel = supabase
            .channel('user-chat-list-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'support_chats', filter: `user_id=eq.${userId}` },
                () => fetchData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData, userId]);

    const renderThreadItem = ({ item }: { item: ChatThreadExtended }) => {
        const isClosed = item.status === 'closed';

        // LOGIIKKA: Näytä punainen merkki vain jos:
        // 1. Keskustelua EI ole luettu (is_read === false)
        // 2. Viimeisin lähettäjä EI ole käyttäjä itse
        const showBadge = !item.is_read && item.last_sender_id !== userId;

        return (
            <TouchableOpacity
                style={[styles.threadItem, isClosed && styles.threadItemClosed]}
                onPress={() => router.push({
                    pathname: '/general/chatscreen',
                    params: { chatId: item.id },
                })}
            >
                <View style={styles.iconContainer}>
                    <View style={styles.messageIconCircle}>
                        <Feather name="message-circle" size={24} color={COLORS.primary} />
                    </View>
                    {/* PUNAINEN 1 -MERKKI */}
                    {showBadge && (
                        <View style={styles.unreadDot}>
                            <Text style={styles.unreadDotText}>1</Text>
                        </View>
                    )}
                </View>

                <View style={styles.threadDetails}>
                    <View style={styles.threadHeaderRow}>
                        <Text style={[styles.threadTitle, isClosed && styles.textClosed]}>
                            {isClosed ? 'Suljettu keskustelu' : 'Asiakastuki'}
                        </Text>
                        <Text style={styles.threadDate}>
                            {new Date(item.last_message_at).toLocaleDateString('fi-FI')}
                        </Text>
                    </View>
                    <Text
                        style={[styles.lastMessagePreview, showBadge && styles.unreadPreviewText]}
                        numberOfLines={1}
                    >
                        {showBadge ? 'Uusi vastaus ylläpidolta!' : 'Klikkaa lukeaksesi viestit'}
                    </Text>
                </View>

                <Feather name="chevron-right" size={20} color={COLORS.arrowColor} />
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/profile')} style={styles.headerBtn}>
                    <Feather name="chevron-left" size={28} color={COLORS.darkText} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Viestit</Text>
                <TouchableOpacity onPress={() => router.push('/general/chatscreen')} style={styles.headerBtn}>
                    <Feather name="plus" size={26} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={threads}
                renderItem={renderThreadItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="mail" size={60} color={COLORS.arrowColor} />
                        <Text style={styles.emptyText}>Ei viestejä vielä.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.lightGrayBackground },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText },
    headerBtn: { padding: 5 },
    listContent: { padding: 16 },
    threadItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    threadItemClosed: { opacity: 0.7 },
    iconContainer: { position: 'relative', marginRight: 15 },
    messageIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: COLORS.unreadRed,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
        zIndex: 1,
    },
    unreadDotText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
    threadDetails: { flex: 1 },
    threadHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    threadTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkText },
    threadDate: { fontSize: 12, color: COLORS.arrowColor },
    lastMessagePreview: { fontSize: 14, color: COLORS.arrowColor },
    unreadPreviewText: { color: COLORS.primary, fontWeight: '600' },
    textClosed: { color: COLORS.arrowColor },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: COLORS.arrowColor, marginVertical: 20 },
});

export default UserMessagesScreen;