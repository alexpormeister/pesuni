import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BottomNavBarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {

    // Voit myös tulostaa tämän nähdäksesi, että saat oikean arvon _layout-tiedostosta
    // console.log("Aktiivinen välilehti:", activeTab); 

    const navItems = [
        { id: 'home', iconName: 'home' as const },
        { id: 'orders', iconName: 'washing-machine' as const },
        { id: 'profile', iconName: 'account' as const },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.navButton}
                            onPress={() => onTabChange(item.id)}
                        >
                            <MaterialCommunityIcons
                                name={item.iconName}
                                size={28}
                                color={isActive ? '#4da3e0ff' : '#9ca3af'}
                            // KORJAUS: Tämä rivi on poistettu, 
                            // koska se ei kuulu MaterialCommunityIcons-kirjastoon
                            // solid 
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
