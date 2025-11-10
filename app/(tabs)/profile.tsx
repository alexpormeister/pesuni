import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import LocationDisplay from "../../components/profile/LocationDisplay";
import ProfileHeader from '../../components/profile/ProfileHeader';
import SettingsList from "../../components/profile/SettingsList";
import StatsBar from "../../components/profile/StatsBar";
import { supabase } from '../../lib/supabase';

const ProfileScreen = () => {
    const router = useRouter();

    const handleEditPress = () => {
        router.push('/profile/personal-data');
    };

    const handleLogoutPress = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert("Virhe", error.message);
        }
    };

    const handleLocationPress = () => {
        Alert.alert("Osoite painettu", "Tässä voisi avata osoitteen valinnan.");
    };

    const generalSettings = [
        {
            id: '1',
            label: 'Henkilötiedot',
            icon: 'user-alt',
            onPress: () => router.push('/profile/personal-data'),
        },
        {
            id: '2',
            label: 'Yleiset',
            icon: 'cog',
            onPress: () => Alert.alert('Yleiset painettu'),
        },
        {
            id: '3',
            label: 'Ostohistoria',
            icon: 'shopping-cart',
            onPress: () => Alert.alert('Ostohistoria painettu'),
        },
        {
            id: '4',
            label: 'Ilmoitukset',
            icon: 'bell',
            onPress: () => Alert.alert('Ilmoitukset painettu'),
        },
        {
            id: '5',
            label: 'Tietosuoja',
            icon: 'shield-alt',
            onPress: () => Alert.alert('Tietosuoja painettu'),
        },
        {
            id: '6',
            label: 'Ota Yhteyttä',
            icon: 'comment',
            onPress: () => Alert.alert('Ota Yhteyttä painettu'),
        },
    ];


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ProfileHeader
                    onEditPress={handleEditPress}
                    onLogoutPress={() => { handleLogoutPress(); }}
                />

                <View style={styles.locationWrapper}>
                    <LocationDisplay onLocationPress={handleLocationPress} />
                </View>

                <View style={styles.stats}>
                    <StatsBar points={24} orders={3} />
                </View>
                <SettingsList title={'Yleiset'} items={generalSettings}></SettingsList>
            </View>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    container: {
        flex: 1,
    },
    locationWrapper: {
        width: '100%',
        alignItems: 'center',
        marginTop: -25,
    },
    stats: {
        alignItems: "center",
    }
});

export default ProfileScreen;