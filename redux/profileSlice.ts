// /redux/profileSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store'; // Oletetaan, että RootState on määritelty store.ts:ssä

// Rajapinta profiilitiedolle

export interface UserProfile {
     id: string;
    first_name: string | null | undefined; // 🔥 LISÄTTY | undefined 🔥
    last_name: string | null | undefined;  // 🔥 LISÄTTY | undefined 🔥
    phone: string | null | undefined;      // 🔥 LISÄTTY | undefined 🔥
    email: string | null | undefined;      // 🔥 LISÄTTY | undefined 🔥
    address: string | null | undefined;    // 🔥 LISÄTTY | undefined 🔥
    address_coords?: { lat: number; lon: number } | undefined;
}

// Alkuperäinen tila
const initialState: UserProfile = {
    id: '', // <-- LISÄTTY: Alustetaan tyhjällä merkkijonolla
    first_name: null,
    last_name: null,
    phone: null,
    email: null,
    address: null,
    address_coords: undefined,
};

export const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        // Päivittää KAIKKI profiilin tiedot kerralla
        setProfile: (state, action: PayloadAction<UserProfile>) => {
            return action.payload;
        },
        // Päivittää vain tietyt kentät (käytetään esim. tallennuksen jälkeen)
        updateProfileFields: (state, action: PayloadAction<Partial<UserProfile>>) => {
            return { ...state, ...action.payload };
        },
    },
});

export const { setProfile, updateProfileFields } = profileSlice.actions;

// Selector, jota käytetään tiedon lukemiseen mistä tahansa komponentista
export const selectUserProfile = (state: RootState) => state.profile;

export default profileSlice.reducer;