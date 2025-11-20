import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'; // <-- LISÄTTY ScrollView
import ProfileHeader from '../../components/profile/ProfileHeader';
import SettingsList from "../../components/profile/SettingsList";
import StatsBar from "../../components/profile/StatsBar";
import { supabase } from '../../lib/supabase';

const ProfileScreen = () => {
    const router = useRouter();

    const handleEditPress = () => {
        router.push('/general/personal-data');
    };

    // HUOM: Tämä on vanha uloskirjautumislogiikka, jota käytetään Alertissa.
    // Oletan, että uusi uloskirjautumislogiikka on ProfileHeader-komponentissa, mutta pidetään tämä täällä varalta.
    const handleLogoutPress = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert("Virhe", error.message);
        }
    };
    const handleOrderHistory = () => {
        router.push({
            pathname: '/orders',
            params: { initialTab: 'History' }
        });
    };

    const generalSettings = [
        { id: '1', label: 'Henkilötiedot', icon: 'user-alt', onPress: () => router.push('/general/personal-data') },
        { id: '2', label: 'Yleiset', icon: 'cog', onPress: () => router.push('/general/general') },
        { id: '3', label: 'Ostohistoria', icon: 'shopping-cart', onPress: handleOrderHistory },
        { id: '4', label: 'Ilmoitukset', icon: 'bell', onPress: () => router.push('/general/notifications') },
        { id: '5', label: 'Tietosuoja', icon: 'shield-alt', onPress: () => router.push('/general/privacy-policy') },
        { id: '6', label: 'Ota Yhteyttä', icon: 'comment', onPress: () => router.push('/general/chat') },
    ];


    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Kääri koko sisältö ScrollView'hun */}
            <ScrollView style={styles.scrollView}>
                <ProfileHeader
                    onEditPress={handleEditPress}
                    // HUOM: Käytä uloskirjautumista varten joko yllä määriteltyä handleLogoutPressiä tai ProfileHeaderin sisäistä logiikkaa.
                    onLogoutPress={() => { handleLogoutPress(); }}
                />

                <View style={styles.contentContainer}>

                    <View style={styles.stats}>
                        <StatsBar points={24} orders={3} />
                    </View>

                    <SettingsList title={'Yleiset'} items={generalSettings} />
                </View>
            </ScrollView>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    // Uusi tyyli ScrollView'lle, joka saa kaiken tilan
    scrollView: {
        flex: 1,
    },
    // Tämä View korvaa vanhan "container"-View'n ja toimii sisällön sijoittelijana ScrollView'n sisällä.
    contentContainer: {
        // Tämän View'n sisällä on kaikki sisältö, jonka pitää scrollata.
        // TÄRKEÄÄ: ÄLÄ käytä tässä flex: 1, jotta sisältö ei veny, vaan mukautuu.
    },
    locationWrapper: {
        width: '100%',
        alignItems: 'center',
        marginTop: -25, // Säilytetään alkuperäinen asettelu
    },
    stats: {
        alignItems: "center",
        marginBottom: 20, // Lisätty marginaali listan ja StatsBarin väliin
    }
});

export default ProfileScreen;