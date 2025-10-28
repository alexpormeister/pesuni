import { Feather } from '@expo/vector-icons'; // Tuotu ikonikirjasto
import React, { useState } from 'react';
import {
    Alert,
    AppState,
    AppStateStatus,
    Image, // Tuotu Image
    KeyboardAvoidingView, // Estää näppäimistöä peittämästä kenttiä
    Platform,
    SafeAreaView, // Tuotu SafeAreaView
    StatusBar, // Tuotu StatusBar
    StyleSheet,
    Text, // Tuotu Text
    TextInput, // Tuotu TextInput
    TouchableOpacity, // Tuotu TouchableOpacity
    View,
} from 'react-native';
// POISTETTU: react-native-elements, koska teemme täysin kustomoidun ulkoasun
import { supabase } from '../../lib/supabase';

// Supabasen AppState-kuuntelija pysyy ennallaan
AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})

export default function Auth() {
    // Nämä pysyvät täysin ennallaan
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    // Tämä logiikka pysyy täysin ennallaan
    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    // Tämä logiikka pysyy täysin ennallaan
    async function signUpWithEmail() {
        setLoading(true)
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        if (!session) Alert.alert('Please check your inbox for email verification!')
        setLoading(false)
    }

    return (
        // SafeAreaView varmistaa, ettei sisältö mene yläreunan loven alle
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />

            {/* KeyboardAvoidingView siirtää sisältöä ylös, kun näppäimistö avautuu */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                {/* --- YLÄOSA (SININEN) --- */}
                <View style={styles.blueContainer}>
                    <Image
                        // VAIHDA TÄHÄN OIKEA POLKU LOGOOSI
                        source={require('../../assets/images/pesuni-basket.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>PESUNI</Text>
                    <Text style={styles.subtitle}>PUHDASTA ARKEA</Text>

                    {/* Input-kentät */}
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
                                secureTextEntry // Piilottaa salasanan
                            />
                        </View>
                    </View>
                </View>

                {/* --- ALAOSA (VALKOINEN KORTTI) --- */}
                <View style={styles.whiteCard}>
                    <TouchableOpacity>
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Kirjaudu-nappi */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => signInWithEmail()}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>{loading ? 'Loading...' : 'Login'}</Text>
                    </TouchableOpacity>

                    <Text style={styles.orText}>or</Text>

                    {/* Luo tili -nappi */}
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => signUpWithEmail()}
                        disabled={loading}
                    >
                        <Text style={styles.createButtonText}>Create an account</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

// Tässä on kaikki uudet tyylit, jotka vastaavat kuvaa
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#87CEFA', // Koko taustan oletusväri (vaalea sininen)
    },
    container: {
        flex: 1,
    },
    // --- SININEN YLÄOSA ---
    blueContainer: {
        flex: 0.6, // Ottaa 60% näytön korkeudesta
        backgroundColor: '#87CEFA', // Voit vaihtaa tämän tarkkaan siniseen
        alignItems: 'center',
        justifyContent: 'flex-end', // Painaa sisällön alaosaan
        paddingBottom: 20,
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
        fontFamily: 'Montserrat', // Voit vaihtaa fontin
        textShadowColor: 'black, 0, 0, 0.3)', // Lisää tumma tekstivarjo
        textShadowRadius: 1,
        textShadowOffset: { width: 0, height: 3 },
    },
    subtitle: {
        fontSize: 16,
        color: 'white',
        letterSpacing: 1.5, // Lisää hieman väliä kirjaimiin
        marginBottom: 25,
    },
    inputArea: {
        width: '85%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Hieman läpinäkyvä valkoinen
        borderRadius: 30, // Täysin pyöristetyt kulmat
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === 'ios' ? 15 : 12, // iOS tarvitsee enemmän tilaa
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
    // --- VALKOINEN ALAOSA ---
    whiteCard: {
        marginBottom: -50,
        flex: 0.4, // Ottaa 40% näytön korkeudesta
        backgroundColor: 'white',
        borderTopLeftRadius: 30, // Pyöristys vain yläkulmiin
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    forgotPassword: {
        color: '#6b7280', // Harmaa teksti
        fontSize: 14,
        marginBottom: 20,
        marginTop: -50,
    },
    loginButton: {
        backgroundColor: '#fbd679', // Keltainen väri
        paddingVertical: 15,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: "#000", // Lisätty pieni varjo
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loginButtonText: {
        color: '#333', // Tumma teksti
        fontSize: 16,
        fontWeight: 'bold',
    },
    orText: {
        color: '#9ca3af', // Vaaleanharmaa
        fontSize: 14,
        marginBottom: 15,
    },
    createButton: {
        backgroundColor: 'white',
        paddingVertical: 15,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db', // Vaalea harmaa reunus
    },
    createButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
})