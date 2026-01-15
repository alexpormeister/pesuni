import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BottomNavBarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {

    const navItems = [
        { id: 'home', iconName: 'home' as const },
        { id: 'orders', iconName: 'washing-machine' as const },
        { id: 'profile', iconName: 'account' as const },
    ];

    return (
        <View style={styles.container}>
            {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.navButton}
                        activeOpacity={0.7}
                        onPress={() => onTabChange(item.id)}
                    >
                        <MaterialCommunityIcons
                            name={item.iconName}
                            size={26} // Hieman pienempi ikoni
                            color={isActive ? '#00c2ff' : '#9ca3af'}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        // Säädetään korkeus alustan mukaan
        height: Platform.OS === 'ios' ? 75 : 60,
        // iOS tarvitsee pienen paddingin alareunaan, jotta ikoni ei ole palkin päällä
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,

        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',

        // Varjot
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 10,

        // Varmistetaan että palkki pysyy alhaalla
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
});

export default BottomNavBar;