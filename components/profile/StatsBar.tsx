import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatsBarProps {
    points: number;
    orders: number;
}

const StatsBar: React.FC<StatsBarProps> = ({ points, orders }) => {
    // Lasketaan pisteiden arvo euroina (100p = 2€ -> kerroin 0.02)
    const euroValue = (points * 0.02).toFixed(2);

    return (
        <View style={styles.container}>
            {/* Pesupisteet ja niiden arvo */}
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{points}</Text>
                <Text style={styles.statLabel}>Pesupisteet</Text>
                <Text style={styles.euroValue}>({euroValue} €)</Text>
            </View>

            {/* Pystyviiva erottimeksi */}
            <View style={styles.divider} />

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
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: "white",
        borderRadius: 15,
        paddingVertical: 15,
        width: '90%',
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 3,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    divider: {
        width: 1,
        height: '60%',
        backgroundColor: '#EFEFEF',
    },
    statNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
    },
    statLabel: {
        fontSize: 12,
        color: '#8A8A8A',
        marginTop: 2,
    },
    euroValue: {
        fontSize: 12,
        color: '#00c2ff', // Teeman mukainen korostusväri
        fontWeight: '600',
        marginTop: 2,
    },
});

export default StatsBar;