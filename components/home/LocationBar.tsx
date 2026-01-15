import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectTotalCartItems } from '../../redux/cartSlice';
import { selectUserProfile } from '../../redux/profileSlice';

const COLORS = {
    dark: '#1A1B32',
    primary: '#00c2ff',
    white: '#FFFFFF',
    lightGray: '#F8F9FD',
    textGray: '#6B7280',
    border: '#F1F5F9',
};

interface LocationBarProps {
    onCartPress: () => void;
}

const LocationBar: React.FC<LocationBarProps> = ({ onCartPress }) => {
    const router = useRouter();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const userProfile = useSelector(selectUserProfile);
    const cartCount = useSelector(selectTotalCartItems);

    const displayAddress = userProfile?.address || "Määritä toimitusosoite";

    const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

    const handleEditAddress = () => {
        router.push('/general/personal-data');
        setIsDropdownVisible(false);
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.barContainer}>
                {/* OSOITE-OSIO */}
                <TouchableOpacity
                    onPress={toggleDropdown}
                    activeOpacity={0.7}
                    style={styles.locationButton}
                >
                    <View style={styles.iconCircle}>
                        <FontAwesome5 name="map-marker-alt" size={14} color={COLORS.primary} />
                    </View>

                    <View style={styles.textStack}>
                        <Text style={styles.label}>Toimitusosoite</Text>
                        <View style={styles.addressRow}>
                            <Text style={styles.locationText} numberOfLines={1}>
                                {displayAddress}
                            </Text>
                            <Feather
                                name={isDropdownVisible ? "chevron-up" : "chevron-down"}
                                size={14}
                                color={COLORS.textGray}
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* OSTOSKORI */}
                <TouchableOpacity onPress={onCartPress} style={styles.cartButton} activeOpacity={0.8}>
                    <View style={styles.cartIconWrapper}>
                        <Feather name="shopping-bag" size={22} color={COLORS.dark} />
                        {cartCount > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cartCount}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            {/* DROPDOWN - MUUTA OSOITE */}
            {isDropdownVisible && (
                <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={handleEditAddress}
                    >
                        <View style={styles.dropdownLeft}>
                            <Feather name="edit-2" size={16} color={COLORS.primary} />
                            <Text style={styles.dropdownText}>Muuta osoitetta</Text>
                        </View>
                        <Feather name="arrow-right" size={16} color={COLORS.textGray} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default LocationBar;

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: COLORS.white,
        zIndex: 100,
        // 🔥 TÄMÄ VETÄÄ BOKSIA YLÖSPÄIN (Säädä tarvittaessa enemmän)
        marginTop: -25,
        borderBottomEndRadius: 20,
        // Hienovarainen mutta syvä varjo
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    barContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0FBFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    textStack: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        color: COLORS.textGray,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 1,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.dark,
        marginRight: 6,
    },
    cartButton: {
        marginLeft: 30,
    },
    cartIconWrapper: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    cartBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    dropdownContainer: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
    },
    dropdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.dark,
        marginLeft: 10,
    },
});