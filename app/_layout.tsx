// Tiedosto: app/_layout.tsx
import { Session } from '@supabase/supabase-js';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { supabase } from '../lib/supabase';
import { store } from '../redux/store';

function useAuthGuard() {
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

    return { loading };
}

export default function RootLayout() {
    const { loading } = useAuthGuard();

    if (loading) {
        // Voit vaihtaa tämän myös <ActivityIndicator /> -komponenttiin
        return null;
    }

    return (
        <Provider store={store}>
            {/* Stack mahdollistaa sivujen väliset siirtymäanimaatiot 
              ja "swipe left to go back" -eleen iOS:llä.
            */}
            <Stack
                screenOptions={{
                    // headerShown: false piilottaa natiivin yläpalkin,
                    // mutta säilyttää silti pyyhkäisyominaisuuden.
                    headerShown: false,
                    gestureEnabled: true,
                    // Tämä sallii pyyhkäisyn mistä tahansa kohtaa ruutua, ei vain reunasta:
                    fullScreenGestureEnabled: true,
                    // Määritetään animaatio tyylikkääksi (valinnainen)
                    animation: 'slide_from_right',
                }}
            >
                {/* Määritellään tässä tarvittaessa yksittäiset näkymät.
                  Esimerkiksi login-sivulla pyyhkäisy takaisin kannattaa estää.
                */}
                <Stack.Screen
                    name="auth/login"
                    options={{
                        headerShown: false,
                        gestureEnabled: false // Ei voi pyyhkäistä takaisin kirjautumissivulta
                    }}
                />
            </Stack>
        </Provider>
    );
}