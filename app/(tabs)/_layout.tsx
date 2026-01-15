import { Tabs, usePathname, useRouter } from 'expo-router';
import React from 'react';
import BottomNavBar from "../../components/BottomNavBar";

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  // Käsitellään välilehden vaihto
  const handleTabChange = (tabId: string) => {
    if (tabId === 'home') {
      router.push({ pathname: '/' });
    } else if (tabId === 'orders') {
      // Ohjataan aina washes-sivulle, kun painetaan tilaus-ikonia
      router.push({ pathname: '/washes' });
    } else if (tabId === 'profile') {
      router.push({ pathname: '/profile' });
    }
  };

  // Määritetään mikä ikoni on aktiivisena navigaatiopalkissa
  const getActiveTab = () => {
    if (pathname === '/washes') {
      return 'orders';
    }
    if (pathname === '/profile') {
      return 'profile';
    }
    // Oletuksena koti
    return 'home';
  };

  return (
    <Tabs
      tabBar={() => (
        <BottomNavBar
          activeTab={getActiveTab()}
          onTabChange={handleTabChange}
        />
      )}
    >
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="washes" options={{ headerShown: false }} />
      <Tabs.Screen name="profile" options={{ headerShown: false }} />
      {/* Poistettu Tabs.Screen name="orders" */}
    </Tabs>
  );
}