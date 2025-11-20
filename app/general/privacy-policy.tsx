import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    lightGrayBackground: '#F8F9FD',
    cardBackground: '#FFFFFF',
    borderColor: '#EFEFEF',
    arrowColor: '#9CA3AF',
    primary: '#00c2ff',
    buttonBackground: '#E0E0E0',
    sectionHeaderBg: '#F3F4F6',
};

// --- Staattinen GDPR-sisältö ---
const PRIVACY_CONTENT = [
    {
        title: "1. Perustiedot ja Yhteyshenkilö",
        content: `**Yrityksen nimi (Rekisterinpitäjä):** [LISÄÄ TÄHÄN YRITYKSEN NIMI]\n**Y-tunnus:** [LISÄÄ Y-TUNNUS]\n**Osoite:** [LISÄÄ OSOITE]\n**Sähköposti (Tietosuoja-asiat):** [LISÄÄ YHTEYSHENKILÖN SÄHKÖPOSTI]\n\nTämä seloste on laadittu Pesuni-mobiilisovelluksen palveluiden kuvaamiseksi.`,
    },
    {
        title: "2. Kerättävät Henkilötiedot",
        content: `**Käyttäjän antamat tiedot:** Nimi, Puhelinnumero, Sähköposti, Osoite, Profiiliasetukset. Salasana tallennetaan hashattuna. Maksutiedot: emme tallenna niitä itse (käytämme maksupalvelua).\n\n**Automaattisesti kerättävät tiedot:** Sovelluksen käyttödata, IP-osoite, laitetiedot, Push-notification token ja lokitiedot.\n\n**Tilauksiin liittyvät tiedot:** Palvelun sisältö, nouto- ja toimitusaika, maksustatus, toimituksen seuranta.`,
    },
    {
        title: "3. Käsittelyn Tarkoitus ja Oikeusperusteet",
        content: `**Tarkoitukset:** Sovelluksen käyttäjätilin luominen, tilausten käsittely ja suorittaminen, toimitusten logistiikka, asiakaspalvelu, sovelluksen kehittäminen ja virheiden korjaus sekä markkinointiviestit (suostumuksella).\n\n**Oikeusperusteet (GDPR):**\n- Sopimuksen täytäntöönpano (tilaukset).\n- Suostumus (markkinointi, push-ilmoitukset).\n- Oikeutettu etu (sovelluksen turvallisuus ja kehitys).`,
    },
    {
        title: "4. Tietojen Säilytysaika ja Jakaminen",
        content: `**Säilytysaika:** Tili on aktiivinen niin kauan kuin käyttäjä on aktiivinen. Tilaustiedot säilytetään 6 vuotta (Kirjanpitolaki).\n\n**Jakaminen:** Tietoja jaetaan tarpeen mukaan: Maksupalveluntarjoaja (Stripe/Paytrail), Supabase (tietokanta), Analytiikkapalvelut, Toimituskumppanit ja Kirjanpito. Emme myy tietoja kolmansille osapuolille.`,
    },
    {
        title: "5. Käyttäjän Oikeudet",
        content: `Sinulla on oikeus nähdä omat tietosi, korjata ne, pyytää tietojen poistoa (oikeus tulla unohdetuksi), kieltää markkinointi, pyytää tietojen siirtoa sekä tehdä valitus Tietosuojavaltuutetulle.`,
    },
    {
        title: "6. Tietoturva ja Siirrot EU:n Ulkopuolelle",
        content: `Käytämme **TLS-salausta**, salasanojen **hashausta** ja Supabasen **RLS-politiikkoja** tietoturvan varmistamiseksi. \n\n**Siirrot EU:n ulkopuolelle:** Käytämme palveluntarjoajia (esim. Firebase, Supabase), jotka saattavat siirtää tietoja Yhdysvaltoihin. Tällöin siirrot on suojattu **EU:n vakiosopimuslausekkeilla (SCC)** GDPR-vaatimusten mukaisesti.`,
    },
];

export default function PrivacyPolicyScreen() {
    const router = useRouter();

    const handleGoBack = () => {
        router.push('/profile');
    };

    const renderContentWithBold = (text: string) => {
        // Yksinkertainen parseri, joka muuntaa **teksti** -> boldiksi
        const parts = text.split(/(\*\*.*?\*\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <Text key={index} style={styles.boldText}>{part.substring(2, part.length - 2)}</Text>;
            }
            return part;
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                    <Feather name="chevron-left" size={24} color={COLORS.darkText} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tietosuoja</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.mainTitle}>Pesuni Oy Tietosuojaseloste</Text>
                <Text style={styles.subtitle}>
                    Tämä seloste koskee Pesuni-mobiilisovelluksen käyttäjätietojen käsittelyä. (Päivitetty [PÄIVÄMÄÄRÄ]).
                </Text>

                {/* RENDERÖIDÄÄN KAIKKI OSIOT SUORAAN */}
                {PRIVACY_CONTENT.map((item, index) => (
                    <View key={index} style={styles.sectionDisplay}>
                        <Text style={styles.sectionDisplayTitle}>{item.title}</Text>
                        <Text style={styles.sectionDisplayContent}>
                            {renderContentWithBold(item.content)}
                        </Text>
                    </View>
                ))}

                <Text style={styles.contactInfo}>
                    {renderContentWithBold('**Yhteyshenkilö tietosuoja-asioissa:** [LISÄÄ YHTEYSHENKILÖN NIMI/TEHTÄVÄ]\nSähköposti: [LISÄÄ SÄHKÖPOSTIOSOITE]')}
                </Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// --- TYYLIT ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGrayBackground,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === 'ios' ? 15 : 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerButton: {
        padding: 0,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginTop: 20,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.arrowColor,
        marginBottom: 20,
        marginTop: 5,
    },
    contactInfo: {
        fontSize: 14,
        color: COLORS.darkText,
        marginTop: 20,
        lineHeight: 20,
    },
    // --- UUSI KAIKKEN NÄKYVÄ OSIO TYYLIT ---
    sectionDisplay: {
        marginBottom: 20,
        backgroundColor: COLORS.cardBackground,
        padding: 15,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionDisplayTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        paddingBottom: 8,
    },
    sectionDisplayContent: {
        fontSize: 14,
        color: COLORS.arrowColor,
        lineHeight: 22,
    },
    boldText: {
        fontWeight: 'bold',
        color: COLORS.darkText,
    }
});