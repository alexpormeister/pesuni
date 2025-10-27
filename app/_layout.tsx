import { Tabs, useRouter, useSegments } from 'expo-router';
import React from 'react';
// Varmista, että polku on oikea (luultavasti ../../../)
import BottomNavBar from "../components/BottomNavBar";

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments(); // Hakee nykyisen reitin osat

  // Funktio, joka käsittelee navigointia, kun alapalkin nappia painetaan
  const handleTabChange = (tabId: string) => {
    if (tabId === 'home') {
      // KORJATTU: Käytä juuripolkua '/'
      router.push({ pathname: '/' });
    } else if (tabId === 'orders') {
      // KORJATTU: Käytä reitin nimeä
      router.push({ pathname: '/washes' });
    } else if (tabId === 'profile') {
      // KORJATTU: Käytä reitin nimeä
      router.push({ pathname: '/profile' });
    }
  };

  // Funktio, joka määrittää aktiivisen välilehden nykyisen reitin perusteella
  const getActiveTab = () => {
    const currentRoute = segments[segments.length - 1] || 'index';
    if (currentRoute === 'washes') {
      return 'orders';
    }
    if (currentRoute === 'profile') {
      return 'profile';
    }
    // Oletuksena palautetaan 'home' juurireitille ('index')
    return 'home';
  };

  return (
    <Tabs
      // tabBar-propsilla kerrotaan, että haluamme renderöidä oman
      // custom-komponenttimme oletusnavigaation sijaan.
      tabBar={() => (
        <BottomNavBar
          activeTab={getActiveTab()}
          onTabChange={handleTabChange}
        />
      )}
    >
      {/* KORJATTU: Nimi "home" muutettu muotoon "index" vastaamaan
        tiedostonimeä app/(tabs)/index.tsx.
      */}
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="washes" options={{ headerShown: false }} />
      <Tabs.Screen name="profile" options={{ headerShown: false }} />
    </Tabs>
  );
}

