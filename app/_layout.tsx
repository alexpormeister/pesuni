import { Tabs, useRouter, useSegments } from 'expo-router';
import React from 'react';
import BottomNavBar from "../components/BottomNavBar"; // Varmista, että polku on oikea

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments(); // Hakee nykyisen reitin osat

  // Funktio, joka käsittelee navigointia, kun alapalkin nappia painetaan
  const handleTabChange = (tabId: string) => {
    if (tabId === 'home') {
      router.push('/'); // Navigoi juureen -> app/index.tsx
    } else if (tabId === 'orders') {
      router.push('/washes'); // Navigoi -> app/washes.tsx
    } else if (tabId === 'profile') {
      router.push('/profile');
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
      {/* Määritellään välilehdet. Nimet vastaavat tiedostonimiä app-kansiossa.
        Esim. 'index' viittaa 'app/index.tsx'-tiedostoon.
        'headerShown: false' piilottaa oletusotsikkopalkin.
      */}
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="washes" options={{ headerShown: false }} />
      <Tabs.Screen name="profile" options={{ headerShown: false }} />
    </Tabs>
  );
}

