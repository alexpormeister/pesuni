import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { supabase } from '../../lib/supabase';

export default function Account({ session }: { session: Session }) {
    const [loading, setLoading] = useState(true)
    // Korjattu: Muutettu state-muuttujat vastaamaan tietokantaasi
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [profileImage, setProfileImage] = useState('')

    useEffect(() => {
        if (session) getProfile()
    }, [session])

    async function getProfile() {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            // Korjattu: Haetaan oikeat sarakkeet tietokannasta
            const { data, error, status } = await supabase
                .from('profiles')
                .select(`phone, address, profile_image`) // <--- TÄMÄ MUUTETTU
                .eq('id', session?.user.id)
                .single()
            if (error && status !== 406) {
                throw error
            }

            if (data) {
                // Korjattu: Asetetaan data oikeisiin state-muuttujiin
                setPhone(data.phone)
                setAddress(data.address)
                setProfileImage(data.profile_image)
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile({
        phone,
        address,
        profile_image, // Korjattu: Argumentit vastaamaan tietokantaa
    }: {
        phone: string
        address: string
        profile_image: string
    }) {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            // Korjattu: Luodaan päivitysobjekti oikeilla sarakkeilla
            const updates = {
                id: session?.user.id,
                phone,
                address,
                profile_image,
                updated_at: new Date(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) {
                throw error
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                {/* Tämä pysyy samana, koska sähköposti tulee 'auth.users'-taulusta */}
                <Input label="Email" value={session?.user?.email} disabled />
            </View>

            {/* Korjattu: Muutettu 'Username' -> 'Phone' */}
            <View style={styles.verticallySpaced}>
                <Input label="Phone" value={phone || ''} onChangeText={(text) => setPhone(text)} />
            </View>

            {/* Korjattu: Muutettu 'Website' -> 'Address' */}
            <View style={styles.verticallySpaced}>
                <Input label="Address" value={address || ''} onChangeText={(text) => setAddress(text)} />
            </View>

            {/* Huom: 'profile_image' ei ole tässä tekstikenttänä, 
                koska se on yleensä kuvan URL. Koodi päivittää sen silti. */}

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                    title={loading ? 'Loading ...' : 'Update'}
                    // Korjattu: Lähetetään oikeat tiedot päivitysfunktiolle
                    onPress={() => updateProfile({ phone, address, profile_image: profileImage })}
                    disabled={loading}
                />
            </View>

            <View style={styles.verticallySpaced}>
                <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
})