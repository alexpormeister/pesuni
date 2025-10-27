import React, { useState } from 'react'; // Tuotu useState
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Huom: Käytän Expo/React Native Vector Icons -kirjastoa (esim. Font Awesome)
import { Feather, FontAwesome5 } from '@expo/vector-icons';

const COLORS = {
    dark: '#333333',
    primary: '#005D97',
    secondary: '#5abaff',
    white: 'white',
    lightGray: '#f0f0f0', // Lisätty
};

// Kovakoodattu demo-data
const DEFAULT_ADDRESS = "Koti, Arvelantie 5a";
const CART_COUNT = 1;

interface LocationBarProps {
    /** Funktio, joka kutsutaan, kun käyttäjä painaa 'Lisää uusi osoite'. */
    onAddNewAddress: () => void; // MUUTETTU: Tämä korvaa onLocationPress-propin
    /** Funktio, joka kutsutaan, kun käyttäjä painaa ostoskoria. */
    onCartPress: () => void;
}

const LocationBar: React.FC<LocationBarProps> = ({ onAddNewAddress, onCartPress }) => {
    // Tila, joka hallitsee alasvetovalikon näkyvyyttä
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    // Funktio, joka näyttää/piilottaa valikon
    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    // Funktio, joka kutsutaan, kun "Lisää uusi osoite" painetaan
    const handleAddNewAddress = () => {
        onAddNewAddress(); // Kutsuu parentilta (HomeScreen) saatua funktiota
        setIsDropdownVisible(false); // Piilottaa valikon
    };

    return (
        // Tämä wrapper-view sisältää sekä palkin että alasvetovalikon
        // ja huolehtii päällekkäisyydestä (marginTop & zIndex)
        <View style={styles.wrapper}>
            <View style={styles.barContainer}>
                {/* Vasen puoli: Sijainti/osoite */}
                <TouchableOpacity
                    onPress={toggleDropdown} // MUUTETTU: Kutsuu nyt toggleDropdown-funktiota
                    style={styles.locationButton}
                >
                    <View style={styles.locationIconContainer}>
                        <FontAwesome5 name="home" size={16} color={COLORS.dark} />
                    </View>
                    <Text style={styles.locationText}>{DEFAULT_ADDRESS}</Text>
                    {/* Ikoni vaihtuu alasvetovalikon tilan mukaan */}
                    <Feather
                        name={isDropdownVisible ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={COLORS.dark}
                    />
                </TouchableOpacity>

                {/* Oikea puoli: Ostoskori */}
                <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
                    <Feather name="shopping-bag" size={24} color={COLORS.dark} />
                    {CART_COUNT > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{CART_COUNT}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* ALASVETOVALIKKO (Näytetään ehdollisesti) */}
            {isDropdownVisible && (
                <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={handleAddNewAddress}
                    >
                        <Text style={styles.dropdownText}>Lisää uusi osoite</Text>
                        <Feather name="plus-circle" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default LocationBar;

const styles = StyleSheet.create({
    // UUSI: Wrapper, joka pitää sisällään palkin ja alasvetovalikon
    wrapper: {
        marginTop: -40, // Nostaa koko komponentin headerin päälle
        zIndex: 1, // Varmistaa, että se on muun sisällön yläpuolella
        // Varjo (valinnainen, mutta näyttää hyvältä)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    barContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        // HUOM: marginTop ja zIndex siirretty wrapper-tyyliin
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        flex: 1, // Antaa napille tilaa kasvaa
        marginRight: 10, // Tilaa ostoskorinapille
    },
    locationIconContainer: {
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
        flexShrink: 1, // Estää tekstiä työntämästä nuolta ulos näytöltä
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
    // UUDET TYYLIT ALASVETOVALIKOLLE
    dropdownContainer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
});
