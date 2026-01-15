import { Feather } from '@expo/vector-icons';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    lightGrayBackground: '#F8F9FD',
    borderColor: '#EFEFEF',
    primary: '#00c2ff',
    userMessageBg: '#E0F7FA',
    adminMessageBg: '#FFFFFF',
    arrowColor: '#9CA3AF',
    closedChat: '#666666',
};

// --- TYYPIT ---
interface Message {
    id: number;
    chat_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_admin_message: boolean;
}

interface ChatStatus {
    id: string;
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
        await supabase.from('support_chats').update({ is_read: true }).eq('id', id);
    };

    // --- 1. Realtime-asennus ---
    const setupRealtime = useCallback((id: string) => {
        if (realtimeChannel.current) {
            supabase.removeChannel(realtimeChannel.current);
        }

        realtimeChannel.current = supabase
            .channel(`chat:${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `chat_id=eq.${id}`,
            }, (payload) => {
                const newMsg = payload.new as Message;

                setMessages((prev) => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });

                if (newMsg.is_admin_message) {
                    markAsRead(id);
                }
            })
            .subscribe();
    }, []);

    // --- 2. Alkuhaku ja datan valmistelu ---
    useEffect(() => {
        const fetchChat = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setIsAuthenticated(false);
                router.replace('/auth/login');
                return;
            }
            setIsAuthenticated(true);

            const externalChatId = params.chatId as string | undefined;

            if (!externalChatId) {
                setChatId(null);
                setChatStatus(null);
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('support_chats')
                .select('*')
                .eq('id', externalChatId)
                .single();

            if (data && !error) {
                setChatId(data.id);
                setChatStatus(data);

                const { data: msgs } = await supabase
                    .from('chat_messages')
                    .select('*')
                    .eq('chat_id', data.id)
                    .order('created_at', { ascending: true });

                if (msgs) setMessages(msgs as Message[]);
                setupRealtime(data.id);
            }
            setIsLoading(false);
        };

        fetchChat();

        return () => {
            if (realtimeChannel.current) {
                supabase.removeChannel(realtimeChannel.current);
            }
        };
    }, [params.chatId, router, setupRealtime]);

    // --- 3. Viestin lähetys (KORJATTU TS-VIRHE) ---
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (chatStatus?.status === 'closed') {
            Alert.alert("Suljettu", "Keskustelu on suljettu.");
            return;
        }

        const content = newMessage.trim();
        setNewMessage('');
        let currentChatId = chatId;

        // Jos uutta keskustelua ei ole vielä olemassa, luodaan se
        if (!currentChatId) {
            const { data: newChat, error } = await supabase
                .from('support_chats')
                .insert({ user_id: user.id, status: 'open', is_read: false })
                .select()
                .single();

            if (error || !newChat) {
                Alert.alert('Virhe', 'Keskustelun aloitus epäonnistui.');
                setNewMessage(content);
                return;
            }

            currentChatId = newChat.id;
            setChatId(currentChatId);
            setChatStatus(newChat);

            // Tässä kohtaa TS tietää, että currentChatId on olemassa
            if (currentChatId) setupRealtime(currentChatId);
        }

        // Pakotettu varmistus TypeScriptille
        if (!currentChatId) return;

        const { data: sentMsg, error } = await supabase
            .from('chat_messages')
            .insert({
                chat_id: currentChatId,
                sender_id: user.id,
                content: content,
                is_admin_message: false,
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            setNewMessage(content);
        } else if (sentMsg) {
            setMessages(prev => [...prev, sentMsg as Message]);
        }
    };

    const isChatClosed = chatStatus?.status === 'closed';
    const isSendDisabled = isChatClosed || !isAuthenticated || !newMessage.trim();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Feather name="chevron-left" size={28} color={COLORS.darkText} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Asiakastuki</Text>
                <View style={{ width: 28 }} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const isUser = !item.is_admin_message;
                        return (
                            <View style={isUser ? styles.userContainer : styles.adminContainer}>
                                <View style={isUser ? styles.userMessage : styles.adminMessage}>
                                    <Text style={styles.messageText}>{item.content}</Text>
                                    <Text style={styles.timestamp}>
                                        {new Date(item.created_at).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
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
                        editable={!isChatClosed}
                        multiline
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.lightGrayBackground },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
    headerButton: { padding: 5, marginLeft: -5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messagesList: { flex: 1 },
    messagesContent: { padding: 15, paddingBottom: 20 },
    userContainer: { alignItems: 'flex-end', marginVertical: 5 },
    adminContainer: { alignItems: 'flex-start', marginVertical: 5 },
    userMessage: { backgroundColor: COLORS.userMessageBg, padding: 12, borderRadius: 18, borderBottomRightRadius: 2, maxWidth: '85%' },
    adminMessage: { backgroundColor: COLORS.adminMessageBg, padding: 12, borderRadius: 18, borderBottomLeftRadius: 2, maxWidth: '85%', borderWidth: 1, borderColor: COLORS.borderColor },
    messageText: { fontSize: 15, color: COLORS.darkText, marginBottom: 4 },
    timestamp: { fontSize: 10, color: COLORS.arrowColor, alignSelf: 'flex-end' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.borderColor },
    textInput: { flex: 1, backgroundColor: COLORS.lightGrayBackground, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10, maxHeight: 100, fontSize: 16 },
    sendButton: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    sendButtonDisabled: { backgroundColor: COLORS.borderColor },
});

export default ChatScreen;