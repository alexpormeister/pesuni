import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Profiilikuva on edelleen paikallinen tiedosto
const PROFILE_IMAGE = require('../../assets/images/pesuni-basket.png'); // Varmista, että polku on oikein

interface ProfileHeaderProps {
    name: string;
    profileImageUrl?: string;
    onEditPress?: () => void;
    onLogoutPress?: () => void; // Uusi prop uloskirjautumisikonille
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, profileImageUrl, onEditPress, onLogoutPress }) => {
    const imageSource = profileImageUrl ? { uri: profileImageUrl } : PROFILE_IMAGE;

    return (
        <View style={styles.outerContainer}>
            {/* Yläosa: Profiili-teksti ja uloskirjautumisikoni */}
            <View style={styles.topBar}>
                <Text style={styles.profileText}>Profiili</Text>
                <TouchableOpacity style={styles.logoutIconContainer} onPress={onLogoutPress}>
                    {/* ----- Uloskirjautumisikoni ----- */}
                    <FontAwesome5 name="sign-out-alt" size={24} color="#E85D5D" />
                </TouchableOpacity>
            </View>

            {/* Valkoinen kortti profiilikuvalle */}
            <View style={styles.card}>
                {/* Profiilikuva ja muokkausikoni */}
                <View style={styles.profileImageWrapper}>
                    <Image
                        source={imageSource}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity style={styles.editIconContainer} onPress={onEditPress}>
                        <FontAwesome5 name="pencil-alt" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.nameText}>{name}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        alignItems: 'center',
        backgroundColor: '#F7F7F7', // Tausta profiilikuvan yläpuolella (voi olla myös jokin muu väri)
        paddingBottom: 20, // Antaa tilaa nimelle alapuolella
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%', // Sama leveys kuin kortilla
        paddingTop: 20, // Tilaa ylhäällä
        marginBottom: 0, // Poistaa välin card-komponenttiin
    },
    profileText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    logoutIconContainer: {
        padding: 5, // Antaa hieman osumapinta-alaa ikonille
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15, // Hieman pyöreämmät kulmat kuin edellisessä
        width: '90%',
        minHeight: 120, // Minimi korkeus kortille
        marginTop: 20, // Nostaa korttia ylöspäin
        paddingHorizontal: 20,
        alignItems: 'center', // Keskittää sisällön vaakasuunnassa
        justifyContent: 'flex-end', // Painaa profiilikuvan alareunaan
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    profileImageWrapper: {
        position: 'absolute', // Profiilikuva ulkonee kortista
        top: -60, // Nostaa profiilikuvaa puoliksi kortin yläpuolelle (puolet kuvan korkeudesta)
        alignItems: 'center',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 60,
        borderWidth: 4, // Hieman paksumpi reuna
        borderColor: '#F7F7F7', // Ympäröivän taustan väri, jotta "erottuu"
        backgroundColor: '#DDD', // Taustaväri, jos kuvaa ei ladata
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0, // Nyt on profiilikuvan alareunassa
        right: 0, // Ja oikeassa reunassa
        backgroundColor: '#4A4A4A',
        borderRadius: 20,
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2, // Lisää reunuksen
        borderColor: '#F7F7F7', // Sama kuin tausta
    },
    nameText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15, // Antaa tilaa profiilikuvan ja kortin yli
    },
});

export default ProfileHeader;