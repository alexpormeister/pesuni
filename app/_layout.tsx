import { StripeProvider } from '@stripe/stripe-react-native';
import { Session } from '@supabase/supabase-js';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import { supabase } from '../lib/supabase';
import { store } from '../redux/store';

const STRIPE_PUBLISHABLE_KEY = "pk_test_51Ru0JGRwjWBeEBIGYcLA5aY63XU9Lt2GeB9y2lG4Bq3g2LVAbmp0To6JGkVTzi0V7OwuNsStpYkqUyIIFp33zGll00rU8YWjX0";

// Sisäinen komponentti, joka hoitaa navigoinnin ja suojauksen
function RootLayoutNav() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        // Haetaan istunto käynnistyksessä
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Kuunnellaan kirjautumistilan muutoksia
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription?.unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return;

        const inAuthRoute = segments[0] === 'auth';

        if (!session && !inAuthRoute) {
            // Jos ei istuntoa ja ei olla auth-sivulla -> ohjaa kirjautumiseen
            router.replace('/auth/login');
        } else if (session && inAuthRoute) {
            // Jos istunto löytyy ja ollaan auth-sivulla -> ohjaa etusivulle
            router.replace('/');
        }
    }, [session, loading, segments, router]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FD' }}>
                <ActivityIndicator size="large" color="#00c2ff" />
            </View>
        );
    }

    return (
        <StripeProvider
            publishableKey={STRIPE_PUBLISHABLE_KEY}
            merchantIdentifier="merchant.com.pesuni"
            urlScheme="pesuni" // Päivitetty vastaamaan schemeäsi
        >
            <Stack
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                    animation: 'slide_from_right',
                }}
            >
                {/* KORJAUS: Määritellään päätason kansiot. 
                  Expo Router etsii näiden sisältä niiden omat _layout.tsx tiedostot.
                */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="auth"
                    options={{
                        headerShown: false,
                        gestureEnabled: false
                    }}
                />
                <Stack.Screen name="general" options={{ headerShown: false }} />
            </Stack>
        </StripeProvider>
    );
}

// Pääkomponentti, joka tarjoaa Redux-storen koko sovellukselle
export default function RootLayout() {
    return (
        <Provider store={store}>
            <RootLayoutNav />
        </Provider>
    );
}