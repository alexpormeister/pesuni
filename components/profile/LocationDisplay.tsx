import { Feather, FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Kovakoodattu demo-osoite
const DEFAULT_ADDRESS = "Koti, Arvelantie 5a";

interface LocationDisplayProps {
    /** Funktio, joka kutsutaan, kun käyttäjä painaa osoitetta. */
    onLocationPress: () => void;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ onLocationPress }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={onLocationPress}
                style={styles.locationButton}
            >
                <FontAwesome5 name="home" size={18} color="#333333" style={styles.icon} />
                <Text style={styles.locationText}>{DEFAULT_ADDRESS}</Text>
                <Feather name="chevron-down" size={20} color="#333333" />
            </TouchableOpacity>
        </View>
    );
};

export default LocationDisplay;

const styles = StyleSheet.create({
    container: {
        // Asettaa komponentin haluttuun paikkaan näytöllä
        paddingHorizontal: 25,
        paddingVertical: 15,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        // Varmistaa, että painike ei veny koko ruudun leveydelle
        alignSelf: 'flex-start',
    },
    icon: {
        marginRight: 10, // Lisää tilaa ikonin ja tekstin väliin
    },
    locationText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginRight: 4, // Pieni väli tekstin ja nuolen välissä
    },
});