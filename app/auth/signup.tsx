import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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

export default function SignUpScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signUpWithEmail() {
        if (password !== retypePassword) {
            Alert.alert("Salasanat eivät täsmää");
            return;
        }
        if (!agreeToTerms) {
            Alert.alert("Hyväksy käyttöehdot jatkaaksesi");
            return;
        }
        if (!firstName || !lastName) {
            Alert.alert("Kirjoita etu- ja sukunimesi");
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            }
        });

        if (error) {
            Alert.alert(error.message);
        } else if (data.session) {
            Alert.alert('Rekisteröinti onnistui!', 'Tarkista sähköpostisi vahvistaaksesi tilisi.');
        } else if (data.user) {
            Alert.alert('Rekisteröinti onnistui!', 'Tarkista sähköpostisi vahvistaaksesi tilisi.');
        }
        setLoading(false);
    }


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.topContainer}>
                    <Text style={styles.title}>Rekisteröidy Käyttäjäksi</Text>
                    <Text style={styles.subtitle}>Kohti puhtaampaa arkea</Text>
                </View>

                <View style={styles.bottomContainer}>
                    <View style={styles.inputContainer}>
                        <Feather name="user" size={20} color="#6b7280" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            placeholderTextColor="#6b7280"
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCapitalize="words"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Feather name="user" size={20} color="#6b7280" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            placeholderTextColor="#6b7280"
                            value={lastName}
                            onChangeText={setLastName}
                            autoCapitalize="words"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="email-fast-outline" size={20} color="#6b7280" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Adress"
                            placeholderTextColor="#6b7280"
                            value={email}
                            onChangeText={setEmail}
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
                            onChangeText={setPassword}
                            autoCapitalize="none"
                            secureTextEntry
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Feather name="lock" size={20} color="#6b7280" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Retype Password"
                            placeholderTextColor="#6b7280"
                            value={retypePassword}
                            onChangeText={setRetypePassword}
                            autoCapitalize="none"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            style={styles.checkbox}
                            value={agreeToTerms}
                            onValueChange={setAgreeToTerms}
                            color={agreeToTerms ? '#60A5FA' : undefined}
                        />
                        <View style={styles.checkboxTextContainer}>
                            <Text style={styles.checkboxText}>I agree to the </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/terms')}>
                                <Text style={styles.linkText}>Terms & Privacy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={signUpWithEmail}
                        disabled={loading}
                    >
                        <Text style={styles.signupButtonText}>{loading ? 'Loading...' : 'Sign Up'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                        <Text style={styles.signInLink}>
                            Have an account? <Text style={styles.linkText}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#7BCFFF',
    },
    container: {
        flex: 1,
    },
    topContainer: {
        padding: 30,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 20 : 50,
        paddingBottom: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'white',
        marginTop: 10,
    },
    bottomContainer: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 50,
        alignItems: 'center',
        marginBottom: -50,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
        marginBottom: 15,
        width: '100%',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#333',
        fontSize: 16,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        marginBottom: 25,
    },
    checkbox: {
        marginRight: 10,
        borderRadius: 5,
    },
    checkboxTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxText: {
        color: '#6b7280',
    },
    linkText: {
        color: '#3B82F6',
        fontWeight: 'bold',
    },
    signupButton: {
        backgroundColor: '#60A5FA',
        paddingVertical: 15,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
        elevation: 5,
    },
    signupButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signInLink: {
        marginTop: 25,
        color: '#6b7280',
    },
});