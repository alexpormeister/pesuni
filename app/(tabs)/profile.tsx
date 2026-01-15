import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import ProfileHeader from '../../components/profile/ProfileHeader';
import SettingsList from "../../components/profile/SettingsList";
import StatsBar from "../../components/profile/StatsBar";
import { supabase } from '../../lib/supabase';

const ProfileScreen = () => {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);
    const [points, setPoints] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfileStats = useCallback(async () => {
        try {
            // Poistetaan setIsLoading(true), jotta sivu ei välky joka päivityksellä, 
            // mutta pidetään alkutila latauksessa.
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Hae pisteet profiilista
            const { data: profileData } = await supabase
                .from('profiles')
                .select('points_balance')
                .eq('user_id', user.id)
                .single();

            if (profileData) setPoints(profileData.points_balance || 0);

            // 2. Laske tilausten määrä
            const { count: countData } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            setOrderCount(countData || 0);

            // 3. Hae lukemattomat viestit
            const { count: chatCount } = await supabase
                .from('support_chats')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            setUnreadCount(chatCount || 0);

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfileStats();

        const profileSubscription = supabase
            .channel('profile-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchProfileStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_chats' }, () => fetchProfileStats())
            .subscribe();

        return () => {
            supabase.removeChannel(profileSubscription);
        };
    }, [fetchProfileStats]);

    const handleEditPress = () => router.push('/general/personal-data');

    const handleLogoutPress = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert("Virhe", error.message);
    };

    const generalSettings = [
        { id: '1', label: 'Henkilötiedot', icon: 'user-alt', onPress: () => router.push('/general/personal-data') },
        { id: '2', label: 'Yleiset', icon: 'cog', onPress: () => router.push('/general/general') },
        { id: '3', label: 'Ostohistoria', icon: 'shopping-cart', onPress: () => router.push('/general/orders') },
        { id: '4', label: 'Ilmoitukset', icon: 'bell', onPress: () => router.push('/general/notifications') },
        { id: '5', label: 'Tietosuoja', icon: 'shield-alt', onPress: () => router.push('/general/privacy-policy') },
        {
            id: '6',
            label: 'Ota Yhteyttä',
            icon: 'comment',
            onPress: () => router.push('/general/chat'),
            badge: unreadCount > 0 ? unreadCount : null
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <ProfileHeader
                    onEditPress={handleEditPress}
                    onLogoutPress={handleLogoutPress}
                />

                <View style={styles.contentContainer}>
                    <View style={styles.stats}>
                        {isLoading ? (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator size="small" color="#00c2ff" />
                            </View>
                        ) : (
                            <StatsBar points={points} orders={orderCount} />
                        )}
                    </View>

                    <SettingsList title={'Yleiset'} items={generalSettings} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F7F7F7' },
    scrollView: { flex: 1 },
    contentContainer: { paddingBottom: 30 },
    stats: { alignItems: "center", marginBottom: 20, marginTop: 10, minHeight: 80, justifyContent: 'center' },
    loaderContainer: {
        backgroundColor: "white",
        borderRadius: 15,
        paddingVertical: 20,
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
    }
});

export default ProfileScreen;