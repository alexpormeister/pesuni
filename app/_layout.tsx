// Tiedosto: app/_layout.tsx
import { Session } from '@supabase/supabase-js';
import { Slot, useRouter, useSegments } from 'expo-router';
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
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription?.unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return;
        const inAuthRoute = segments[0] === 'auth';

        if (!session && !inAuthRoute) {
            router.replace('/auth/login');
        } else if (session && inAuthRoute) {
            router.replace('/');
        }

    }, [session, loading, segments, router]);

    return { loading };
}

export default function RootLayout() {
    const { loading } = useAuthGuard();

    if (loading) {
        return null;
    }
    return (
        <Provider store={store}>
            <Slot />
        </Provider>
    );
}