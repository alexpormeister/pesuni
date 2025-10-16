import React, { useState } from 'react';
import { View } from 'react-native';
import HomeScreen from "../app/home"; // Tuo juuri luotu kotinäkymäsi
import SplashScreen from "../app/splash"; // Tuo splash screen

export default function App() {
  // Tila, joka kertoo, onko splash screenin animaatio valmis
  const [isSplashAnimationComplete, setIsSplashAnimationComplete] = useState(false);

  // Voit lisätä tänne fonttien tai muiden tietojen latauslogiikan
  // useEffect-hookilla, jos tarpeen.

  return (
    <View style={{ flex: 1 }}>
      {/* 1. Kotinäkymä renderöidään aina taustalle */}
      <HomeScreen />

      {/* 2. Splash screen renderöidään ehdollisesti kotinäkymän päälle */}
      {!isSplashAnimationComplete && (
        <SplashScreen
          onAnimationComplete={() => setIsSplashAnimationComplete(true)}
        />
      )}
    </View>
  );
}