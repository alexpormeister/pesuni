import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatsBarProps {
    points: number;
    orders: number;
}

const StatsBar: React.FC<StatsBarProps> = ({ points, orders }) => {
    return (
        <View style={styles.container}>
            {/* Pesupisteet */}
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{points}</Text>
                <Text style={styles.statLabel}>Pesupisteet</Text>
            </View>

            {/* Tilaukset */}
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{orders}</Text>
                <Text style={styles.statLabel}>Tilauksia</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: "white", // Vaalea beige väri kuvasta
        borderRadius: 15,
        paddingVertical: 20,
        width: '90%', // Sama leveys kuin ProfileHeaderin kortilla
        marginTop: 10,
        // Lisätään hienovarainen varjo
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 3,
    },
    statItem: {
        alignItems: 'center', // Keskittää numeron ja tekstin pystysuunnassa
        flex: 1, // Varmistaa, että molemmat vievät yhtä paljon tilaa
    },
    statNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#8A8A8A', // Pehmeä harmaa väri
    },
});

export default StatsBar;