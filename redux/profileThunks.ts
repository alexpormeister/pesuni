import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase'; // Varmista, että polku Supabaseen on oikea
import { setProfile } from './profileSlice'; // setProfile action profileSlice-tiedostosta

// Määrittele rajapinta Supabasesta tulevalle profiilidatalle. 
// Tämän pitäisi olla sama kuin profileSlice.ts-tiedostossa, 
// mutta emme voi tuoda sitä suoraan tässä tiedostossa tyypitysvirheiden takia.
// 🔥 TÄRKEÄÄ: Varmista, että nämä kentät ovat samat kuin profileSlice.ts:ssä!
interface SupabaseProfileData {
    id: string;
    first_name: string | null | undefined;
    last_name: string | null | undefined;
    phone: string | null | undefined;
    email: string | null | undefined;
    address: string | null | undefined;
    // Lisää muut kentät, kuten profile_image, updated_at, user_id, jos tarvitset niitä
}


/**
 * Asynkroninen toiminto (Thunk) käyttäjän profiilin lataamiseen Supabasesta
 * ja sen asettamiseen Redux-tilaan.
 */
export const fetchUserProfile = createAsyncThunk(
    'profile/fetchUserProfile',
    async (arg, { dispatch, rejectWithValue }) => {
        try {
            // 1. Hae kirjautunut käyttäjä
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Jos käyttäjä ei ole kirjautunut, ei haeta profiilia
                return rejectWithValue('Käyttäjä ei ole kirjautunut sisään');
            }

            // 2. Hae profiili profiles-taulusta
            let { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, phone, address')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 on "Ei tuloksia", muut virheet ovat ongelmia
                throw error;
            }

            let profileData: SupabaseProfileData;

            if (!data) {
                // Jos profiiliriviä ei löydy (ensimmäinen kerta), luo oletusarvot
                profileData = {
                    id: user.id,
                    first_name: null,
                    last_name: null,
                    phone: null,
                    email: user.email || null, // Varmistettu null-tyypiksi
                    address: null,
                };
            } else {
                profileData = data as SupabaseProfileData;
            }
            
            // 🔥 3. ASENNA PROFIILI REDUX-TILAAN setProfile-ACTIONIN KAUTTA 🔥
            // dispatchataan suoraan setProfile-action, jota reducer käsittelee
            dispatch(setProfile(profileData));

            return profileData; // Palauta data (valinnainen, mutta hyödyllinen)

        } catch (error: any) {
            console.error('Profiilin haku epäonnistui:', error);
            // Palauta virhe, jotta Redux Toolkit osaa käsitellä sen
            return rejectWithValue(error.message || 'Profiilin lataus epäonnistui');
        }
    }
);

// Tämän tiedoston jälkeen:
// 1. Muuta index.tsx kutsumaan dispatch(fetchUserProfile()).
// 2. Päivitä PersonalInfoScreen.tsx kutsumaan dispatch(fetchUserProfile()).