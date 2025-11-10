import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

const PROFILE_IMAGE = require('../../assets/images/pesuni-basket.png'); // Varmista, että polku on oikein

interface ProfileHeaderProps {
    profileImageUrl?: string;
    onEditPress?: () => void;
    onLogoutPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileImageUrl, onEditPress, onLogoutPress }) => {
    const imageSource = profileImageUrl ? { uri: profileImageUrl } : PROFILE_IMAGE;

    const [firstName, setFirstName] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Käyttäjää ei löytynyt");

                const { data, error, status } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('user_id', user.id)
                    .single();

                if (error && status !== 406) {
                    throw error;
                }

                if (data) {
                    setFirstName(data.first_name);
                    setLastName(data.last_name);
                } else {
                }
            } catch (error) {
                if (error instanceof Error) {
                    Alert.alert('Virhe profiilia haettaessa', error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogoutPress = () => {
        Alert.alert(
            "Vahvista uloskirjautuminen",
            "",
            [
                {
                    text: "Peruuta",
                    onPress: () => console.log("Uloskirjautuminen peruutettu"),
                    style: "cancel"
                },
                {
                    text: "Kirjaudu ulos",
                    onPress: onLogoutPress,
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <View style={styles.outerContainer}>
            <View style={styles.topBar}>
                <Text style={styles.profileText}>Profiili</Text>
                <TouchableOpacity style={styles.logoutIconContainer} onPress={handleLogoutPress}>
                    <FontAwesome5 name="sign-out-alt" size={24} color="#E85D5D" />
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <View style={styles.profileImageWrapper}>
                    <Image
                        source={imageSource}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity style={styles.editIconContainer} onPress={onEditPress}>
                        <FontAwesome5 name="pencil-alt" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.nameText}>
                    {loading ? 'Ladataan...' : (firstName && lastName ? `${firstName} ${lastName}` : 'Käyttäjä')}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        paddingBottom: 20,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        paddingTop: 20,
        marginBottom: 0,
    },
    profileText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    logoutIconContainer: {
        padding: 5,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        width: '90%',
        minHeight: 120,
        marginTop: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'flex-end',
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
        position: 'absolute',
        top: -60,
        alignItems: 'center',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#F7F7F7',
        backgroundColor: '#DDD',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4A4A4A',
        borderRadius: 20,
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F7F7F7',
    },
    nameText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
});

export default ProfileHeader;