import { Fontisto } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handlePasswordReset() {
        if (!email) {
            Alert.alert('Syötä sähköpostiosoite');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'pesuni://reset-password',
        });

        if (error) {
            Alert.alert('Virhe', error.message);
        } else {
            Alert.alert(
                'Salasanan palautus lähetetty',
                'Tarkista sähköpostisi jatkaaksesi salasanan palauttamista.'
            );
            router.replace('/auth/login');
        }
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.topContainer}>
                    <Image
                        source={require('../../assets/images/blue-brush.png')}
                        style={styles.backgroundImage}
                    />
                    <View style={styles.iconContainer}>
                        <Fontisto name="locked" size={50} color="#27476e" />
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.boldTitle}>Unohtuiko</Text>
                        <Text style={styles.normalTitle}>Salasana?</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Ei hätää, lähetämme sinulle ohjeet{'\n'}salasanan palauttamiseen.
                    </Text>
                </View>

                <View style={styles.bottomContainer}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Fontisto name="email" size={20} color="#6b7280" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your Email"
                                placeholderTextColor="#6b7280"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handlePasswordReset}
                        disabled={loading}
                    >
                        <Text style={styles.resetButtonText}>
                            {loading ? 'Lähetetään...' : 'Palauta Salasana'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                        <Text style={styles.signInLink}>Kirjaudu Sisään</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
    },
    topContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: 'white',
    },
    iconContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.2,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    boldTitle: {
        fontWeight: 'bold',
        fontSize: 32,
        color: '#27476e',
        textAlign: 'center',
        marginBottom: -5,
    },
    normalTitle: {
        fontSize: 32,
        color: '#27476e',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#27476e',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    bottomContainer: {
        flex: 0.5,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 0,
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#87CEFA',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        marginBottom: -50,
    },
    inputWrapper: {
        width: '85%',
        alignSelf: 'center',
    },
    inputLabel: {
        color: 'white',
        fontSize: 16,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
        marginBottom: 25,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#333',
        fontSize: 16,
    },
    resetButton: {
        backgroundColor: '#3b79b8',
        paddingVertical: 15,
        borderRadius: 30,
        width: '85%',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    resetButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signInLink: {
        marginTop: 10,
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});