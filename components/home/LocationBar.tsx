import { Feather, FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectTotalCartItems } from '../../redux/cartSlice';
const COLORS = {
    dark: '#333333',
    primary: '#5abaff',
    secondary: '#5abaff',
    white: 'white',
    lightGray: '#f0f0f0',
};

const DEFAULT_ADDRESS = "Koti, Arvelantie 5a";

interface LocationBarProps {
    onAddNewAddress: () => void;
    onCartPress: () => void;
}

const LocationBar: React.FC<LocationBarProps> = ({ onAddNewAddress, onCartPress }) => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const cartCount = useSelector(selectTotalCartItems);

    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    const handleAddNewAddress = () => {
        onAddNewAddress();
        setIsDropdownVisible(false);
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.barContainer}>
                <TouchableOpacity
                    onPress={toggleDropdown}
                    style={styles.locationButton}
                >
                    <View style={styles.locationIconContainer}>
                        <FontAwesome5 name="home" size={16} color={COLORS.dark} />
                    </View>
                    <Text style={styles.locationText}>{DEFAULT_ADDRESS}</Text>
                    <Feather
                        name={isDropdownVisible ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={COLORS.dark}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
                    <Feather name="shopping-bag" size={24} color={COLORS.dark} />
                    {cartCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

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
    wrapper: {
        marginTop: -40,
        zIndex: 1,
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
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        flex: 1,
        marginRight: 10,
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
        flexShrink: 1,
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