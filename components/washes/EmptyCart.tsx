import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Haetaan näytön leveys, jotta voidaan rajoittaa elementtien maksimileveyttä
const { width } = Dimensions.get('window');

// Määritellään propsit, jotka komponentti ottaa vastaan
interface EmptyCartProps {
    onSelectWash: () => void;
    onOrderHistory: () => void;
}

const EmptyCart: React.FC<EmptyCartProps> = ({ onSelectWash, onOrderHistory }) => {
    return (
        <View style={styles.container}>
            {/* Kuva - Ladataan nyt paikallisesta assets-kansiosta */}
            <Image
                source={require("../../assets/images/empty-basket-removebg-preview.png")} // Korjattu lataamaan paikallinen kuva. Varmista, että polku on oikea.
                style={styles.image}
            />

            {/* Tekstit */}
            <Text style={styles.title}>Korisi on tyhjä</Text>
            <Text style={styles.subtitle}>
                Näyttäisi siltä, että et ole lisännyt vielä pesuja koriisi
            </Text>

            {/* Painikkeet */}
            <TouchableOpacity style={styles.primaryButton} onPress={onSelectWash}>
                <Text style={styles.primaryButtonText}>Valitse Pesu</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onOrderHistory}>
                <Text style={styles.secondaryButtonText}>Tilaushistoria</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Täyttää saatavilla olevan tilan
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    image: {
        width: 128,
        height: 128,
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937', // Tumma harmaa
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280', // Keskiharmaa
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: width * 0.7, // Rajoitetaan leveyttä, jotta teksti rivittyy nätisti
    },
    primaryButton: {
        backgroundColor: '#00c2ff', // Sininen
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 9999, // Tekee napista pyöreän
        width: '100%',
        maxWidth: 320,
        marginBottom: 16,
        // Varjo iOS:lle
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        // Varjo Androidille
        elevation: 5,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    secondaryButtonText: {
        color: 'black',
        fontWeight: '600',
        fontSize: 16,
        textDecorationLine: "underline",
    },
});

export default EmptyCart;

