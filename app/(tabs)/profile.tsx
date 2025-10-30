import React from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import LocationDisplay from "../../components/profile/LocationDisplay";
import ProfileHeader from '../../components/profile/ProfileHeader';
import SettingsList from "../../components/profile/SettingsList";
import StatsBar from "../../components/profile/StatsBar";
import { supabase } from '../../lib/supabase';

const ProfileScreen = () => {
    const handleEditPress = () => {
        Alert.alert("Muokkaa painettu", "Tässä voisi avata profiilin muokkausnäkymän.");
    };

    const handleLogoutPress = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert("Virhe", error.message);
        }
        // Sinun ei tarvitse tehdä muuta. App.tsx hoitaa 
        // automaattisesti paluun login-sivulle.
    };

    const handleLocationPress = () => {
        Alert.alert("Osoite painettu", "Tässä voisi avata osoitteen valinnan.");
    };

    const generalSettings = [
        {
            id: '1',
            label: 'Henkilötiedot',
            icon: 'user-alt',
            onPress: () => Alert.alert('Henkilötiedot painettu'),
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

                {/* 👇 ADD THIS WRAPPER VIEW 👇 */}
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
    // 👇 ADD THIS NEW STYLE 👇
    locationWrapper: {
        width: '100%',         // The wrapper takes full width
        alignItems: 'center',  // It centers its child (LocationDisplay)
        marginTop: -25,         // Optional: Adds some space above it
    },
    stats: {
        alignItems: "center",
    }
});

export default ProfileScreen;