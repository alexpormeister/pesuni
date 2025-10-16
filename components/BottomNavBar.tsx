import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Määritellään propsit, jotka komponentti ottaa vastaan.
// Tämä mahdollistaa tilan hallinnan komponentin ulkopuolelta (esim. _layout.tsx-tiedostossa).
interface BottomNavBarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
    // Navigaatiopainikkeiden tiedot
    const navItems = [
        { id: 'home', iconName: 'home' as const },
        { id: 'orders', iconName: 'inbox' as const },
        { id: 'profile', iconName: 'user' as const },
    ];

    return (
        // SafeAreaView varmistaa, ettei sisältö mene laitteen käyttöliittymäelementtien,
        // kuten iPhonen alareunan "viivan", alle.
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {navItems.map((item) => {
                    // Tarkistetaan, onko tämä painike aktiivinen propsien perusteella
                    const isActive = activeTab === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.navButton}
                            // Kutsutaan annettua onTabChange-funktiota, kun painiketta painetaan
                            onPress={() => onTabChange(item.id)}
                        >
                            <FontAwesome
                                name={item.iconName}
                                size={28}
                                // Vaihdetaan väriä sen perusteella, onko välilehti aktiivinen
                                color={isActive ? '#3b82f6' : '#9ca3af'}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        // Kiinnitetään komponentti näytön alaosaan
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        // Lisätään siisti reunaviiva ja varjo yläreunaan
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb', // Vaalea harmaa
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2, // Varjo ylöspäin
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 5, // Varjo Androidille
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60, // Navigaatiopalkin korkeus
    },
    navButton: {
        flex: 1, // Varmistaa, että painikkeet jakavat tilan tasan
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
});

export default BottomNavBar;

