import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
interface ColorPalette {
    white: string;
    darkText: string;
    lightGrayBackground: string;
    borderColor: string;
    primary: string;
    userMessageBg: string;
    adminMessageBg: string;
    arrowColor: string;
}

const COLORS: ColorPalette = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    lightGrayBackground: '#F8F9FD',
    borderColor: '#EFEFEF',
    primary: '#00c2ff',
    userMessageBg: '#E0F7FA',
    adminMessageBg: '#FFFFFF',
    arrowColor: '#9CA3AF',
};
// -------------

// --- TIETOTYYPIT ---
interface ChatThread {
    id: string;
    user_id: string;
    created_at: string;
    last_message_at: string;
    status: 'open' | 'closed';
    is_read: boolean;
}

const UserMessagesScreen = () => {
    const router = useRouter();
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // 1. Hae käyttäjän ID ja keskusteluketjut
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id || null;
            setUserId(currentUserId);

            if (!currentUserId) {
                router.replace('/auth/login');
                return;
            }

            const { data: threadData, error: threadError } = await supabase
                .from('support_chats')
                .select('*')
                .eq('user_id', currentUserId)
                .order('last_message_at', { ascending: false });

            if (threadError) {
                console.error('Virhe chat-ketjujen haussa:', threadError);
            }

            if (threadData) {
                setThreads(threadData as ChatThread[]);
            }
            setIsLoading(false);
        };

        fetchData();

        const channel = supabase
            .channel('user-chat-updates')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'support_chats', filter: `user_id=eq.${userId}` },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router, userId]);


    // Käsittelee siirtymisen yksittäiseen chat-näkymään
    const handleThreadPress = (threadId: string) => {
        router.push({
            pathname: '/general/chatscreen',
            params: { chatId: threadId },
        });
    };

    // Luo uusi chat -näkymä (jos käyttäjällä ei ole avointa)
    const handleNewChat = () => {
        router.push('/general/chatscreen');
    }

    // UUSI FUNKTIO: Käsittelee takaisin siirtymisen
    const handleGoBack = () => {
        router.push('/profile');
    };


    // Renderöi yksittäisen keskusteluketjun listalla
    const renderThreadItem = ({ item }: { item: ChatThread }) => {
        const isClosed = item.status === 'closed';
        const isUnread = !item.is_read;

        const title = isClosed ? 'Keskustelu (Suljettu)' : 'Keskustelu (Avoin)';

        return (
            <TouchableOpacity
                style={[
                    styles.threadItem,
                    isClosed && styles.threadItemClosed,
                    isUnread && styles.threadItemUnread,
                ]}
                onPress={() => handleThreadPress(item.id)}
                disabled={!userId}
            >
                <View style={styles.threadDetails}>
                    <Text style={[styles.threadTitle, isClosed && styles.textClosed]}>{title}</Text>

                    <Text style={[styles.threadDate, isClosed && styles.textClosed]}>
                        Viimeisin: {new Date(item.last_message_at).toLocaleString('fi-FI', { dateStyle: 'short', timeStyle: 'short' })}
                    </Text>
                </View>
                {isUnread && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>UUSI</Text>
                    </View>
                )}
                <Feather name="chevron-right" size={20} color={isClosed ? COLORS.arrowColor : COLORS.darkText} />
            </TouchableOpacity>
        );
    };

    // Jos käyttäjällä ei ole yhtään chat-ketjua
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Feather name="message-square" size={50} color={COLORS.arrowColor} />
            <Text style={styles.emptyText}>Ei aktiivisia tai menneitä keskusteluja.</Text>
            <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
                <Text style={styles.newChatButtonText}>Aloita uusi keskustelu</Text>
            </TouchableOpacity>
        </View>
    );

    // Jos lataa tietoja
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Ladataan viestejä...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {/* LISÄTTY: Takaisin-nappi */}
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Feather name="chevron-left" size={24} color={COLORS.darkText} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Omat Keskustelut</Text>

                {/* Uusi chat -nappi oikealla */}
                <TouchableOpacity onPress={handleNewChat} style={styles.newChatButtonHeader}>
                    <Feather name="plus" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={threads}
                renderItem={renderThreadItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
            />
        </SafeAreaView>
    );
};

export default UserMessagesScreen;

// --- TYYLIT ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGrayBackground,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.darkText,
    },
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
    // LISÄTTY TYYLI: Headerin vasemman puolen nappi (takaisin)
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
        // KESKITTÄMINEN: Pakotetaan otsikko keskelle antamalla vasemmalle ja oikealle elementille tilaa
        flexGrow: 1,
        textAlign: 'center',
    },
    newChatButtonHeader: {
        padding: 5,
    },
    listContent: {
        padding: 10,
    },

    // --- Keskustelulista ---
    threadItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    threadItemClosed: {
        opacity: 0.6, // Harmaampi suljetuille chateille
    },
    threadItemUnread: {
        backgroundColor: COLORS.userMessageBg, // Korostetaan, jos uusi lukematon viesti
        borderColor: COLORS.primary,
        borderLeftWidth: 5,
        paddingLeft: 10,
    },
    threadDetails: {
        flex: 1,
        marginRight: 10,
    },
    threadTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkText,
    },
    threadDate: {
        fontSize: 12,
        color: COLORS.arrowColor,
        marginTop: 4,
    },
    textClosed: {
        color: COLORS.arrowColor, // Harmaampi teksti suljetuissa
    },
    unreadBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 10,
    },
    unreadText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.white,
    },

    // --- Tyhjä tila ---
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.arrowColor,
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    newChatButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    newChatButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});