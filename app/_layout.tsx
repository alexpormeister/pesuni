// Tiedosto: app/_layout.tsx
import { Session } from '@supabase/supabase-js';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Varmista oikea polku

function useAuthGuard() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        // Hae sessio käynnistyessä
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Kuuntele muutoksia (kuten SIGN_OUT)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription?.unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return; // Älä tee mitään, kun tarkistetaan

        const inAuthRoute = segments[0] === 'auth';

        if (!session && !inAuthRoute) {
            // Ei sessiota -> pakota kirjautumissivulle
            router.replace('/auth/login');
        } else if (session && inAuthRoute) {
            // On sessio (mutta ollaan auth-sivulla) -> pakota etusivulle
            router.replace('/');
        }

    }, [session, loading, segments, router]);

    return { loading };
}

export default function RootLayout() {
    const { loading } = useAuthGuard();

    if (loading) {
        return null; // Tai latausindikaattori
    }

    // Slot renderöi joko /auth/login TAI (tabs)-ryhmän
    return <Slot />;
}