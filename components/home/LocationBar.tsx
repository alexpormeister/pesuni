import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Huom: Käytän Expo/React Native Vector Icons -kirjastoa (esim. Font Awesome)
import { Feather, FontAwesome5 } from '@expo/vector-icons';

const COLORS = {
    dark: '#333333',
    primary: '#005D97',
    secondary: '#5abaff',
    // KORJAUS: Lisätty 'white'
    white: 'white',
};

// Kovakoodattu demo-data
const DEFAULT_ADDRESS = "Koti, Arvelantie 5a";
const CART_COUNT = 1;

interface LocationBarProps {
    /** Funktio, joka kutsutaan, kun käyttäjä painaa osoitetta. */
    onLocationPress: () => void;
    /** Funktio, joka kutsutaan, kun käyttäjä painaa ostoskoria. */
    onCartPress: () => void;
}

const LocationBar: React.FC<LocationBarProps> = ({ onLocationPress, onCartPress }) => {
    return (
        <View style={styles.barContainer}>
            {/* Vasen puoli: Sijainti/osoite */}
            <TouchableOpacity
                onPress={onLocationPress}
                style={styles.locationButton}
            >
                <View style={styles.locationIconContainer}>
                    <FontAwesome5 name="home" size={16} color={COLORS.dark} />
                </View>
                <Text style={styles.locationText}>{DEFAULT_ADDRESS}</Text>
                <Feather name="chevron-down" size={16} color={COLORS.dark} />
            </TouchableOpacity>

            {/* Oikea puoli: Ostoskori */}
            <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
                <Feather name="shopping-bag" size={24} color={COLORS.dark} />
                {/* Tuotteiden määrä (Badge) */}
                {CART_COUNT > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{CART_COUNT}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default LocationBar;

const styles = StyleSheet.create({
    barContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 15,
        // Korjataan yläreunan ulkoreuna, jotta se pinoutuu Headerin päälle
        marginTop: -40, // Palautettu toimiva arvo
        backgroundColor: COLORS.white,
        zIndex: 1, // Palautettu toimiva arvo
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
    },
    locationIconContainer: {
        // Ympyröidään ikoni tyylin mukaisesti
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#EFEFEF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    locationText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginRight: 4,
    },
    cartButton: {
        padding: 5,
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
        zIndex: 10,
    },
    cartBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});
