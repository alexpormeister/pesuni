import { Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    AppState,
    AppStateStatus,
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

AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    async function signInWithProvider(provider: 'google' | 'apple' | 'facebook') {
        Alert.alert(`Toteutetaan ${provider} kirjautuminen myöhemmin!`);
        // Esimerkkikoodi (vaatii lisäasetuksia Supabasessa ja Expossa):
        // setLoading(true);
        // const { error } = await supabase.auth.signInWithOAuth({
        //   provider: provider,
        // });
        // if (error) Alert.alert(error.message);
        // setLoading(false);
    }


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <LinearGradient
                    colors={['#87CEFA', '#5EA8E0', '#4A90D3']}
                    style={styles.blueContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.topContent}>
                        <Image
                            source={require('../../assets/images/pesuni-basket.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>PESUNI</Text>
                        <Text style={styles.subtitle}>PUHDASTA ARKEA</Text>
                    </View>
                    <View style={styles.inputArea}>
                        <View style={styles.inputContainer}>
                            <Feather name="user" size={20} color="#6b7280" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email or Phone"
                                placeholderTextColor="#6b7280"
                                value={email}
                                onChangeText={(text: string) => setEmail(text)}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Feather name="lock" size={20} color="#6b7280" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#6b7280"
                                value={password}
                                onChangeText={(text: string) => setPassword(text)}
                                autoCapitalize="none"
                                secureTextEntry
                            />
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.whiteCard}>
                    <TouchableOpacity onPress={() => router.push('/auth/forgotPassword')}>
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => signInWithEmail()}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>{loading ? 'Loading...' : 'Login'}</Text>
                    </TouchableOpacity>

                    <Text style={styles.orText}>or continue with</Text>

                    <View style={styles.socialLoginContainer}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => signInWithProvider('google')}
                            disabled={loading}
                        >
                            <FontAwesome name="google" size={24} color="#DB4437" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => signInWithProvider('apple')}
                            disabled={loading}
                        >
                            <FontAwesome name="apple" size={24} color="#000000" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => signInWithProvider('facebook')}
                            disabled={loading}
                        >
                            <FontAwesome name="facebook" size={24} color="#4267B2" />
                        </TouchableOpacity>
                    </View>


                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push("../auth/signup")}
                        disabled={loading}
                    >
                        <Text style={styles.createButtonText}>Create an account</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#87CEFA',
    },
    container: {
        flex: 1,
        position: 'relative',
    },
    blueContainer: {
        flex: 1,
        backgroundColor: '#87CEFA',
        alignItems: 'center',
    },
    topContent: {
        alignItems: 'center',
        paddingTop: '5%',
        marginBottom: 30,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
    title: {
        fontSize: 50,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Montserrat',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowRadius: 1,
        textShadowOffset: { width: 0, height: 3 },
    },
    subtitle: {
        fontSize: 16,
        color: 'white',
        letterSpacing: 1.5,
        marginBottom: 25,
    },
    inputArea: {
        width: '85%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
        marginBottom: 15,
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
    whiteCard: {
        position: 'absolute',
        bottom: -50,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 30,
        paddingTop: 30,
        paddingBottom: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    forgotPassword: {
        color: '#6b7280',
        fontSize: 14,
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#fbd679',
        paddingVertical: 15,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loginButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    orText: {
        color: '#9ca3af',
        fontSize: 14,
        marginVertical: 15,
    },
    createButton: {
        backgroundColor: 'white',
        paddingVertical: 15,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginTop: 15,
    },
    createButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },

    socialLoginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    socialButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 25,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
});