import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { selectUserProfile, UserProfile } from "../../redux/profileSlice";

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    primary: '#00c2ff',
    lightGray: '#F8F9FD',
    borderColor: '#EFEFEF',
};

interface CustomerInfoBlockProps {
    onEditPress: () => void;
    style?: ViewStyle;
}

// --- 1. Apukomponentti yksittäiselle tietoriville ---
interface InfoRowProps {
    label: string;
    value: string | null | undefined;
    isSubtle?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isSubtle }) => (
    <View style={styles.infoRowContainer}>
        <Text style={[styles.infoLabel, isSubtle && styles.infoLabelSubtle]}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
            {value || 'Ei määritelty'}
        </Text>
    </View>
);
// --------------------------------------------------


const CustomerInfoBlock: React.FC<CustomerInfoBlockProps> = ({ onEditPress, style }) => {
    // HUOM: selectUserProfile palauttaa tyypin UserProfile | null.
    const profile: UserProfile | null = useSelector(selectUserProfile) || {};

    // Console.log poistettu lopullisesta tuotantokoodista
    // console.log("Profile Data:", profile); 

    // Tarkistetaan nimen kentät turvallisesti
    const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();

    // 🛑 POISTETTU: Koordinaattien laskenta
    // const coords = profile?.address_coords ? ... : 'Ei koordinaatteja'; 

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>Asiakastiedot ja nouto</Text>
            <Text style={styles.subtitle}>Täytä tiedot palvelun tilaamiseksi</Text>

            {/* --- Yhteystiedot --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yhteystiedot</Text>
                <InfoRow
                    label="Nimi"
                    value={fullName}
                />
                <InfoRow
                    label="Puhelinnumero"
                    value={profile?.phone}
                />

            </View>

            {/* --- Osoite ja Muokkausnappi --- */}
            <View style={[styles.section, styles.addressSection]}>
                <Text style={styles.sectionTitle}>Noutoosoite</Text>

                <View style={styles.addressDisplayContainer}>
                    <View style={styles.addressTextWrapper}>
                        <Text style={styles.addressValue} numberOfLines={2}>
                            {profile?.address || 'Osoitetta ei ole asetettu!'}
                        </Text>
                        <Text style={styles.editNote}>
                            Henkilötiedot haettu profiilista. Klikkaa Muokkaa muuttaaksesi.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
                        <Text style={styles.editButtonText}>Muokkaa</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 🛑 POISTETTU: Kartta/Koordinaatit osio kokonaan */}

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textGray,
        marginBottom: 20,
    },

    section: {
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        paddingTop: 15,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 10,
    },
    infoRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    infoLabel: {
        fontSize: 15,
        color: COLORS.darkText,
        fontWeight: '500',
    },
    infoLabelSubtle: {
        fontWeight: 'normal',
    },
    infoValue: {
        fontSize: 15,
        color: COLORS.textGray,
        maxWidth: '50%',
        textAlign: 'right',
    },
    editNote: {
        fontSize: 12,
        color: COLORS.textGray,
        marginTop: 5,
        marginBottom: 5,
        lineHeight: 18,
    },

    addressSection: {
        paddingBottom: 0,
        marginBottom: 10,
        // Poistettu borderTop, koska se on jo 'section' -tyylissä
        borderTopWidth: 0,
        paddingTop: 0,
    },
    addressDisplayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    addressTextWrapper: {
        flex: 1,
        marginRight: 10,
    },
    addressValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.darkText,
        marginBottom: 5,
    },
    editButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'center',
    },
    editButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    // 🛑 POISTETTU: MapSection, mapDetail, mapButton, mapButtonText, mapIcon tyylit.
});

export default CustomerInfoBlock;