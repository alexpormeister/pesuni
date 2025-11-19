import { Tabs, usePathname, useRouter } from 'expo-router';
import React from 'react';
import BottomNavBar from "../../components/BottomNavBar";

export default function TabLayout() {
  const router = useRouter();

  const pathname = usePathname();

  const handleTabChange = (tabId: string) => {
    if (tabId === 'home') {
      router.push({ pathname: '/' });
    } else if (tabId === 'orders') {
      router.push({ pathname: '/washes' });
    } else if (tabId === 'profile') {
      router.push({ pathname: '/profile' });
    }
    else if (tabId === 'orders') {
      router.push({ pathname: '/orders' });
    }
  };

  const getActiveTab = () => {

    if (pathname === '/washes') {
      return 'orders';
    }
    if (pathname === '/profile') {
      return 'profile';
    }
    if (pathname === '/orders') {
      return 'orders';
    }
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
      <Tabs.Screen name="orders" options={{ headerShown: false }} />
    </Tabs>
  );
}