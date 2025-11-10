import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

// Import your components
import HomeHeader from "../../components/home/HomeHeader";
import LocationBar from "../../components/home/LocationBar";
// This is the new Supabase-fetching component
import ServiceGrid from "../../components/home/ServiceGrid";

// We no longer need SERVICES_DATA, as ServiceGrid fetches its own data.

export default function HomeScreen() {
    const router = useRouter();

    const handleStartWash = () => {
        console.log("Aloita Pesu painettu! Navigoi pesutilauksen luontiin.");
    };

    const handleGoToProfile = () => {
        console.log("Navigoidaan profiiliin...");
        router.push('/profile');
    };

    const handleCartPress = () => {
        console.log("Ostoskoria painettu! Navigoidaan koriin.");
    };

    return (
        // Use SafeAreaView or a plain View with flex: 1
        // NO ScrollView here!
        <SafeAreaView style={styles.container}>
            <ServiceGrid
                ListHeaderComponent={
                    // Pass all your header content here
                    // It will be rendered at the top of the scrollable list
                    <>
                        {/* 1. Ylätunniste (Sininen alue) */}
                        <HomeHeader onStartPress={handleStartWash} />

                        {/* 2. Osoite- ja ostoskoripalkki */}
                        <LocationBar
                            onAddNewAddress={handleGoToProfile}
                            onCartPress={handleCartPress}
                        />

                        {/* 3. Muu sisältö (valkoinen alue) alkaa tästä */}
                        <Text style={styles.mainTitle}>Valitse Pesusi</Text>

                        {/* NOTE: The <ServiceGrid> component will now render
                          its filter bar right below this title, and then
                          the products fetched from Supabase.
                        */}
                    </>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white', // This white will be the default background
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        paddingHorizontal: 25,
        marginTop: 35,
        marginBottom: 25,
        textAlign: "center",
        backgroundColor: 'white',
    },
});