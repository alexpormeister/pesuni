import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native'; // Varmista, että Text on tuotu

// Tuodaan tarvittavat komponentit
import BottomNavBar from "../components/BottomNavBar";
import HomeHeader from "../components/home/HomeHeader";
import LocationBar from "../components/home/LocationBar";
import ServiceGrid from "../components/home/ServiceGrid";

// --- 1. LUO TARVITTAVA DATA TÄNNE ---
// Tämä data-array sisältää kaikki tiedot, jotka ServiceGrid tarvitsee korttien luomiseen.
// Huom: Varmista, että kuvien polut (require(...)) ovat oikein sinun projektissasi!
const SERVICES_DATA = [
    {
        id: 1,
        name: 'Pyykkipesu',
        imagePath: ('../assets/images/pyykkipesu.png'), // Oletuspolku, muokkaa tarvittaessa
        backgroundColor: '#f0f8ff', // Esimerkkiväri, vaalea sininen
    },
    {
        id: 2,
        name: 'Lakanapyykki',
        imagePath: ('../../assets/images/lakanapyykki.png'),
        backgroundColor: '#f0f8ff',
    },
    {
        id: 3,
        name: 'Kenkäpesu',
        imagePath: ('../../assets/images/kenkapesu.png'),
        backgroundColor: '#f0f8ff',
    },
    {
        id: 4,
        name: 'Mattopesu',
        imagePath: ('../../assets/images/mattopesu.png'),
        backgroundColor: '#f0f8ff',
    },
];

export default function HomeScreen() {

    const handleStartWash = () => {
        console.log("Aloita Pesu painettu! Navigoi pesutilauksen luontiin.");
    };

    const handleLocationPress = () => {
        console.log("Osoitetta painettu! Avaa osoitteen valitsin.");
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
                    onLocationPress={handleLocationPress}
                    onCartPress={handleCartPress}
                />

                {/* 3. Muu sisältö (valkoinen alue) alkaa tästä */}
                <Text style={styles.mainTitle}>Valitse Pesusi</Text>

                {/* 4. Palveluruudukko, jolle annetaan nyt data 'services'-propsin kautta */}
                <ServiceGrid services={SERVICES_DATA} />
            </ScrollView>
            <BottomNavBar activeTab={''} onTabChange={function (tabId: string): void {
                throw new Error('Function not implemented.');
            }}></BottomNavBar>

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
        marginTop: 20,
        marginBottom: 15,
        textAlign: "center",
    },

});
