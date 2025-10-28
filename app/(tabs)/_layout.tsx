// Tiedosto: app/(tabs)/_layout.tsx
// KORJATTU: Tuodaan 'usePathname'
import { Tabs, usePathname, useRouter } from 'expo-router';
import React from 'react';
import BottomNavBar from "../../components/BottomNavBar";

export default function TabLayout() {
  const router = useRouter();

  // KORJATTU: Käytetään 'usePathname', joka palauttaa polun merkkijonona (esim. "/", "/washes")
  const pathname = usePathname();

  const handleTabChange = (tabId: string) => {
    if (tabId === 'home') {
      router.push({ pathname: '/' });
    } else if (tabId === 'orders') {
      router.push({ pathname: '/washes' });
    } else if (tabId === 'profile') {
      router.push({ pathname: '/profile' });
    }
  };

  const getActiveTab = () => {
    // KORJATTU: Tarkistetaan suoraan polun nimeä

    // Voit lisätä tämän rivin nähdäksesi konsolissa, mitä polkua se lukee:
    // console.log("Nykyinen polku:", pathname); 

    if (pathname === '/washes') {
      return 'orders';
    }
    if (pathname === '/profile') {
      return 'profile';
    }
    // Kaikissa muissa tapauksissa (pääasiassa '/')
    return 'home';
  };

  return (
    <Tabs
      tabBar={() => (
        <BottomNavBar
          // getActiveTab() palauttaa nyt luotettavasti oikean ID:n
          activeTab={getActiveTab()}
          onTabChange={handleTabChange}
        />
      )}
    >
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="washes" options={{ headerShown: false }} />
      <Tabs.Screen name="profile" options={{ headerShown: false }} />
    </Tabs>
  );
}