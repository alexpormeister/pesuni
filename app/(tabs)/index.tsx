import { useRouter } from 'expo-router'; // 1. Tuotu useRouter navigointia varten
import React from 'react'; // Siirretty ylimmäksi
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Tuodaan tarvittavat komponentit
// POISTETTU BottomNavBar-tuonti, koska layout-tiedosto hoitaa sen
import HomeHeader from "../../components/home/HomeHeader";
import LocationBar from "../../components/home/LocationBar";
import ServiceGrid from "../../components/home/ServiceGrid";

// Data palveluille, varmista että polut ovat oikein ja käytä require()-funktiota
const SERVICES_DATA = [
    {
        id: 1,
        name: 'Pyykkipesu',
        imagePath: require('../../assets/images/pyykki.png'), // KORJATTU
        backgroundColor: '#f0f8ff',
    },
    {
        id: 2,
        name: 'Lakanapyykki',
        imagePath: require('../../assets/images/lakana.png'), // KORJATTU
        backgroundColor: '#f0f8ff',
    },
    {
        id: 3,
        name: 'Kenkäpesu',
        imagePath: require('../../assets/images/kenka.png'), // KORJATTU
        backgroundColor: '#f0f8ff',
    },
    {
        id: 4,
        name: 'Mattopesu',
        imagePath: require('../../assets/images/matto.png'), // KORJATTU
        backgroundColor: '#f0f8ff',
    },
];

export default function HomeScreen() {
    // 2. Alustetaan router
    const router = useRouter();

    const handleStartWash = () => {
        console.log("Aloita Pesu painettu! Navigoi pesutilauksen luontiin.");
    };

    // 3. Uusi funktio, joka navigoi profiilisivulle
    const handleGoToProfile = () => {
        console.log("Navigoidaan profiiliin...");
        router.push('/profile'); // Olettaen, että profiilisivusi on '/profile'
    };

    const handleCartPress = () => {
        console.log("Ostoskoria painettu! Navigoidaan koriin.");
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* 1. Ylätunniste (Sininen alue) */}
                <HomeHeader onStartPress={handleStartWash} />

                {/* 2. Osoite- ja ostoskoripalkki */}
                <LocationBar
                    // 4. Annettu uusi propi vanhan 'onLocationPress'-propin sijaan
                    onAddNewAddress={handleGoToProfile}
                    onCartPress={handleCartPress}
                />

                {/* 3. Muu sisältö (valkoinen alue) alkaa tästä */}
                <Text style={styles.mainTitle}>Valitse Pesusi</Text>

                {/* 4. Palveluruudukko */}
                <ServiceGrid services={SERVICES_DATA} />

                {/* Lisätty tyhjää tilaa scrollin alaosaan, 
                    jotta sisältö ei jää BottomNavBarrin alle piiloon */}
                <View style={{ height: 100 }} />

            </ScrollView>


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        paddingHorizontal: 25,
        marginTop: 35,
        marginBottom: 25,
        textAlign: "center",
    },
});