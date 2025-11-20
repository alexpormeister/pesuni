import { Feather } from '@expo/vector-icons';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

// --- VÄRIT ---
interface ColorPalette {
    white: string; darkText: string; lightGrayBackground: string; borderColor: string; primary: string;
    userMessageBg: string; adminMessageBg: string; arrowColor: string; closedChat: string;
}

const COLORS: ColorPalette = {
    white: '#FFFFFF', darkText: '#0A1B32', lightGrayBackground: '#F8F9FD', borderColor: '#EFEFEF',
    primary: '#00c2ff', userMessageBg: '#E0F7FA', adminMessageBg: '#FFFFFF', arrowColor: '#9CA3AF',
    closedChat: '#666666',
};
// ---------------------------------------------

interface Message {
    id: number; chat_id: string; sender_id: string; content: string; created_at: string; is_admin_message: boolean;
}

interface ChatStatus {
    status: 'open' | 'closed';
    is_read: boolean;
}


const ChatScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatId, setChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [chatStatus, setChatStatus] = useState<ChatStatus | null>(null);
    const realtimeChannel = useRef<RealtimeChannel | null>(null);
    const flatListRef = useRef<FlatList<Message>>(null);


    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('support_chats')
            .update({ is_read: true })
            .eq('id', id);

        if (error) {
            console.error('Virhe is_read-päivityksessä:', error);
        }
    };


    // --- 1. Keskusteluketjun haku (EI LUONNISTA ENÄÄ TÄSSÄ!) ---
    useEffect(() => {
        const externalChatId = params.chatId as string | undefined;

        const fetchOrCreateChat = async () => {
            setIsLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id || null;

            if (!currentUserId) {
                setIsAuthenticated(false);
                setIsLoading(false);
                router.replace('/auth/login');
                return;
            }
            setIsAuthenticated(true);

            // Jos ID:tä ei ole annettu (uusi chat), lopetetaan haku ja asetetaan chatId = null.
            if (!externalChatId) {
                setChatId(null);
                setChatStatus({ status: 'open', is_read: true }); // Oletusarvo, kun käyttäjä aloittaa
                setIsLoading(false);
                return;
            }

            // HAETAAN VAIN ANNETTU ID
            const { data, error } = await supabase
                .from('support_chats')
                .select('id, status, is_read')
                .eq('id', externalChatId)
                .limit(1)
                .single();

            if (data && !error) {
                setChatId(data.id);
                setChatStatus({ status: data.status, is_read: data.is_read });

                // Merkitään luetuksi heti
                if (!data.is_read) {
                    await markAsRead(data.id);
                }
            } else {
                // Jos ID oli annettu mutta sitä ei löytynyt (virheellinen linkki)
                setChatId(null);
                setChatStatus(null);
            }

            setIsLoading(false);
        };

        fetchOrCreateChat();
    }, [router, params.chatId]);


    // --- 2. Viestien haku ja Realtime-kuuntelu ---
    useEffect(() => {
        // TÄRKEÄÄ: Jos chatId on null (uusi chat), ei yritetä hakea vanhoja viestejä tai kuunnella
        if (!chatId) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            if (data) {
                setMessages(data as Message[]);
            } else if (error) {
                console.error('Virhe viestien haussa:', error);
            }

            flatListRef.current?.scrollToEnd({ animated: true });
        };

        const setupRealtime = () => {
            if (realtimeChannel.current) {
                supabase.removeChannel(realtimeChannel.current);
            }

            realtimeChannel.current = supabase
                .channel(`chat:${chatId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'chat_messages',
                        filter: `chat_id=eq.${chatId}`,
                    },
                    (payload) => {
                        const newMsg = payload.new as Message;
                        setMessages((prevMessages) => [...prevMessages, newMsg]);

                        if (flatListRef.current) {
                            flatListRef.current.scrollToEnd({ animated: true });
                        }

                        if (newMsg.is_admin_message) {
                            markAsRead(newMsg.chat_id);
                        }
                    }
                )
                .subscribe();
        };

        fetchMessages();
        setupRealtime();

        return () => {
            if (realtimeChannel.current) {
                supabase.removeChannel(realtimeChannel.current);
            }
        };
    }, [chatId]);


    // --- 3. Viestin lähettäminen (HOITAA NYT KETJUN LUONNIN) ---
    const handleSendMessage = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        let currentUserId = user?.id;
        let currentChatId = chatId;

        if (!newMessage.trim() || !currentUserId) return;

        // ESTO: Estää suljettuun chattiin vastaamisen
        if (chatStatus?.status === 'closed') {
            Alert.alert(
                "Keskustelu on suljettu",
                "Et voi lähettää viestiä tähän vanhaan ketjuun. Aloita uusi keskustelu profiilisivultasi uuden asian tiimoilta."
            );
            return;
        }

        const content = newMessage.trim();
        setNewMessage('');

        // UUSI LOGIIKKA: LUO KETJU VASTA NYT, JOS CHATID ON NULL
        if (!currentChatId) {
            const { data: newChat, error: newChatError } = await supabase
                .from('support_chats')
                .insert({ user_id: currentUserId, status: 'open', is_read: false }) // Merkitään heti lukemattomaksi adminille
                .select('id')
                .single();

            if (newChatError || !newChat) {
                console.error('Virhe chat-ketjun luonnissa lähettäessä:', newChatError);
                Alert.alert('Virhe', 'Keskustelua ei voitu aloittaa. Yritä uudelleen.');
                setNewMessage(content);
                return;
            }

            currentChatId = newChat.id;
            setChatId(currentChatId); // Päivitä tila
            setChatStatus({ status: 'open', is_read: false }); // Päivitä tila
        }


        // LÄHETÄ VIESTI UUTEEN TAI OLEMASSA OLEVAAN KETJUUN
        const { error } = await supabase
            .from('chat_messages')
            .insert({
                chat_id: currentChatId,
                sender_id: currentUserId,
                content: content,
                is_admin_message: false,
            });

        if (error) {
            console.error('Virhe viestin lähetyksessä:', error);
            setNewMessage(content);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = !item.is_admin_message;

        const messageStyle = isUser ? styles.userMessage : styles.adminMessage;
        const containerStyle = isUser ? styles.userContainer : styles.adminContainer;

        return (
            <View style={containerStyle}>
                <View style={messageStyle}>
                    <Text style={styles.messageText}>{item.content}</Text>
                    <Text style={styles.timestamp}>
                        {new Date(item.created_at).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    // Varmistetaan, että lähetys on estetty, jos chat on suljettu TAI odotetaan ID:tä
    const isChatClosed = chatStatus?.status === 'closed';
    const isWaitingForId = !chatId && !isLoading; // Odotetaan ID:tä (uusi chat)
    const isSendDisabled = isChatClosed || !isAuthenticated || isWaitingForId || !newMessage.trim();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Feather name="chevron-left" size={24} color={COLORS.darkText} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isChatClosed && { color: COLORS.closedChat }]}>
                    Asiakastuki {isChatClosed ? '(Suljettu)' : (chatId ? '(Avoin)' : '(Uusi)')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading || !isAuthenticated ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Ladataan keskustelua...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}

            {isChatClosed && (
                <View style={styles.closedWarning}>
                    <Text style={styles.closedWarningText}>
                        HUOM: Tämä keskustelu on **suljettu**, et voi enää lähettää tähän uusia viestejä. Aloita uusi keskustelu profiilisivultasi.
                    </Text>
                </View>
            )}

            {/* Varoitus, jos odotetaan ID:tä, mutta ei ole enää latauksessa (eli käyttäjä on uudessa chatissa) */}
            {(!chatId && !isLoading) && (
                <View style={styles.closedWarning}>
                    <Text style={styles.closedWarningText}>
                        Aloita uusi keskustelu kirjoittamalla ja lähettämällä ensimmäinen viesti.
                    </Text>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder={isChatClosed ? "Keskustelu on suljettu." : "Kirjoita viesti..."}
                        placeholderTextColor={COLORS.arrowColor}
                        editable={!isSendDisabled}
                        onSubmitEditing={handleSendMessage}
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, isSendDisabled && styles.sendButtonDisabled]}
                        onPress={handleSendMessage}
                        disabled={isSendDisabled}
                    >
                        <Feather name="send" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatScreen;

// --- TYYLIT ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGrayBackground,
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
    headerButton: {
        padding: 0,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.darkText,
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 10,
    },
    messagesContent: {
        paddingTop: 10,
        paddingBottom: 20,
    },

    userContainer: {
        alignItems: 'flex-end',
        marginVertical: 4,
    },
    adminContainer: {
        alignItems: 'flex-start',
        marginVertical: 4,
    },
    userMessage: {
        backgroundColor: COLORS.userMessageBg,
        padding: 10,
        borderRadius: 15,
        borderBottomRightRadius: 2,
        maxWidth: '80%',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    adminMessage: {
        backgroundColor: COLORS.adminMessageBg,
        padding: 10,
        borderRadius: 15,
        borderBottomLeftRadius: 2,
        maxWidth: '80%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    messageText: {
        fontSize: 15,
        color: COLORS.darkText,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 10,
        color: COLORS.arrowColor,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    },
    textInput: {
        flex: 1,
        backgroundColor: COLORS.lightGrayBackground,
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
        color: COLORS.darkText,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.borderColor,
    },
    closedWarning: {
        backgroundColor: '#FFFBEB',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#FEEFC3',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    closedWarningText: {
        fontSize: 14,
        color: '#9C6500',
        fontWeight: '500',
        textAlign: 'center',
    }
});