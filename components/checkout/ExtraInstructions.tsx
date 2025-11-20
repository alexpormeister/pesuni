import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    lightGray: '#F8F9FD',
    borderColor: '#EFEFEF',
};

interface ExtraInstructionsProps {
    onChangeText: (text: string) => void;
    initialValue?: string;
    style?: ViewStyle;
}

const ExtraInstructions: React.FC<ExtraInstructionsProps> = ({ onChangeText, initialValue = '', style }) => {
    const [instructions, setInstructions] = useState(initialValue);

    const handleTextChange = (text: string) => {
        setInstructions(text);
        onChangeText(text); // Välitä arvo yläkomponentille tallennusta varten
    };

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>Lisätiedot</Text>

            <Text style={styles.subtitle}>
                Erityisohjeet (valinnainen)
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Esim. nouto-osoite on ulko-oven vieressä, ovikoodi on 1234, tai allergiaa aiheuttavia aineita."
                value={instructions}
                onChangeText={handleTextChange}
                multiline={true} // TÄRKEÄÄ: Mahdollistaa monirivisen syötön
                numberOfLines={4} // Alkuperäinen korkeus (Androidissa vaikuttaa)
                textAlignVertical="top" // Teksti alkaa ylhäältä
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textGray,
        marginBottom: 15,
    },
    input: {
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        color: COLORS.darkText,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        minHeight: 120, // Antaa tilaa moniriviselle syötteelle
    },
});

export default ExtraInstructions;