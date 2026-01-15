import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

// Määritellään vaihtoehdot ja otetaan ensimmäinen oletukseksi
const AVATAR_OPTIONS = [
    { id: '1', url: 'https://mgdvyfvcdivwzjxgrggv.supabase.co/storage/v1/object/public/Avatar/default-basket.png' },
    { id: '2', url: 'https://mgdvyfvcdivwzjxgrggv.supabase.co/storage/v1/object/public/Avatar/girl-basket.png' },
    { id: '3', url: 'https://mgdvyfvcdivwzjxgrggv.supabase.co/storage/v1/object/public/Avatar/vacation-basket.png' },
    { id: '4', url: 'https://mgdvyfvcdivwzjxgrggv.supabase.co/storage/v1/object/public/Avatar/alien-basket.png' },
    { id: '5', url: 'https://mgdvyfvcdivwzjxgrggv.supabase.co/storage/v1/object/public/Avatar/superman-basket.png' },
];

const FALLBACK_AVATAR = AVATAR_OPTIONS[0].url;

interface ProfileHeaderProps {
    profileImageUrl?: string;
    onEditPress?: () => void;
    onLogoutPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onLogoutPress }) => {
    const [firstName, setFirstName] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.warn('Profiilin haku epäonnistui, haetaan perustiedot:', error.message);
                const { data: basicData } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('user_id', user.id)
                    .single();

                if (basicData) {
                    setFirstName(basicData.first_name);
                    setLastName(basicData.last_name);
                }
                return;
            }

            if (data) {
                setFirstName(data.first_name);
                setLastName(data.last_name);
                // Jos kanta on tyhjä, avatarUrl jää nulliksi ja renderöinti käyttää FALLBACKia
                setAvatarUrl(data.avatar_url);
            }
        } catch (err) {
            console.error('Odottamaton virhe profiilia haettaessa:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateAvatar = async (url: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: url })
                .eq('user_id', user.id);

            if (error) throw error;

            setAvatarUrl(url);
            setModalVisible(false);
        } catch (err) {
            Alert.alert("Virhe", "Kuvan tallennus epäonnistui.");
            console.error(err);
        }
    };

    const handleLogoutPress = () => {
        Alert.alert(
            "Vahvista uloskirjautuminen",
            "",
            [
                { text: "Peruuta", style: "cancel" },
                { text: "Kirjaudu ulos", onPress: onLogoutPress, style: "destructive" }
            ]
        );
    };

    // Jos avatarUrl on null/undefined, käytetään AVATAR_OPTIONS[0]
    const imageSource = { uri: avatarUrl || FALLBACK_AVATAR };

    return (
        <View style={styles.outerContainer}>
            <View style={styles.topBar}>
                <Text style={styles.profileText}>Profiili</Text>
                <TouchableOpacity style={styles.logoutIconContainer} onPress={handleLogoutPress}>
                    <FontAwesome5 name="sign-out-alt" size={22} color="#E85D5D" />
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <View style={styles.profileImageWrapper}>
                    <Image source={imageSource} style={styles.profileImage} />
                    <TouchableOpacity
                        style={styles.editIconContainer}
                        onPress={() => setModalVisible(true)}
                    >
                        <FontAwesome5 name="pencil-alt" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.nameText}>
                    {loading ? 'Ladataan...' : (firstName && lastName ? `${firstName} ${lastName}` : 'Käyttäjä')}
                </Text>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Valitse profiilikuva</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={32} color="#DDD" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={AVATAR_OPTIONS}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.avatarList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.avatarOptionWrapper,
                                        (avatarUrl || FALLBACK_AVATAR) === item.url && styles.selectedAvatar
                                    ]}
                                    onPress={() => updateAvatar(item.url)}
                                >
                                    <Image source={{ uri: item.url }} style={styles.avatarOptionImage} />
                                    {(avatarUrl || FALLBACK_AVATAR) === item.url && (
                                        <View style={styles.checkBadge}>
                                            <Ionicons name="checkmark" size={12} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        width: '100%',
        paddingBottom: 20,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        paddingTop: 20,
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
        marginTop: 70,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'flex-end',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
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
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#F7F7F7',
        backgroundColor: '#DDD',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#00c2ff',
        borderRadius: 20,
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    nameText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 25,
        padding: 20,
        width: width * 0.9,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    avatarList: {
        paddingVertical: 10,
    },
    avatarOptionWrapper: {
        marginRight: 15,
        borderRadius: 40,
        padding: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedAvatar: {
        borderColor: '#00c2ff',
    },
    avatarOptionImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#EEE',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#00c2ff',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    }
});

export default ProfileHeader;