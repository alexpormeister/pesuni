import React from 'react';
import { View } from 'react-native';
import HomeScreen from "../app/home"; // Polku saattaa olla väärä
// Poistettu LoginScreen-tuonti

export default function App() {
  // Poistettu kaikki state- ja kirjautumislogiikka

  // Renderöidään aina HomeScreen
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen />
    </View>
  );
}

