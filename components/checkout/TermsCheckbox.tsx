import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 🔥 LISÄTTY 🔥
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    primary: '#00c2ff',
    lightGray: '#F8F9FD',
    borderColor: '#EFEFEF',
    error: '#FF4500',
};

interface TermsCheckboxProps {
    onToggle: (accepted: boolean) => void;
    isAccepted: boolean; // 🔥 Käytetään tätä propina sisäisen tilan sijaan
    style?: ViewStyle;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ onToggle, isAccepted, style }) => {
    const router = useRouter(); // 🔥 ALUSTETTU 🔥
    // 🛑 Poistettu: const [isChecked, setIsChecked] = useState(false);

    const handleToggle = () => {
        // Lähetetään uusi tila, joka on isAcceptedin vastakohta
        onToggle(!isAccepted);
    };

    const handleViewTerms = () => {
        // Navigoidaan suoraan käyttöehtosivulle
        router.push("/checkout/terms/terms");
    };

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>Hyväksy ehdot</Text>

            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={handleToggle}
                activeOpacity={0.8}
            >
                {/* 1. VALINTARUUTU (Käyttää isAccepted-proppia) */}
                <View style={[styles.checkbox, isAccepted && styles.checkboxChecked]}>
                    {isAccepted && <Feather name="check" size={18} color={COLORS.white} />}
                </View>

                {/* 2. TEKSTI JA LINKKI */}
                <View style={styles.textContainer}>
                    <Text style={styles.termsText}>
                        Ymmärrän, että kaikkia tahroja ei välttämättä saada poistettua ja että vaatteiden luonnollinen kuluminen tai värimuutokset eivät ole palvelun vastuulla. Olen tarkistanut, että kaikki pyykit on pussissa tilauksen yhteydessä.
                    </Text>

                    {/* Linkki koko selosteeseen */}
                    <TouchableOpacity onPress={handleViewTerms}>
                        <Text style={styles.linkText}>
                            Lue tarkemmat käyttöehdot.
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {/* Muistutus (Jos halutaan korostaa pakollisuutta) */}
            {!isAccepted && (
                <Text style={styles.warningText}>* Sinun on hyväksyttävä ehdot jatkaaksesi.</Text>
            )}
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
        borderColor: COLORS.borderColor,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 15,
    },

    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingBottom: 5,
    },
    textContainer: {
        flex: 1,
    },
    termsText: {
        fontSize: 14,
        color: COLORS.darkText,
        lineHeight: 22,
        marginBottom: 5,
    },
    linkText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },

    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.textGray,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginTop: 3,
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    warningText: {
        fontSize: 12,
        color: COLORS.error,
        marginTop: 5,
        fontWeight: 'bold',
    }
});

export default TermsCheckbox;