import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Vakiovärit komponentille
const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    primaryBlue: '#5abaff',
    accentBlue: '#5abaff',
    badgeBg: '#EBF5FF',
    dotInactive: '#E5E7EB',
};

const ActiveOrders = () => {
    return (
        <View style={styles.card}>
            {/* Yläosa: Badge ja Aika */}
            <View style={styles.cardHeader}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>● MATKALLA</Text>
                </View>
                <View>
                    <Text style={styles.arrivalLabel}>ARVIO</Text>
                    <Text style={styles.arrivalTime}>Tänään 14:00</Text>
                </View>
            </View>

            <Text style={styles.storeNameLarge}>Zalando</Text>

            {/* Progress Bar -janat */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressDot, styles.activeDot]} />
                <View style={[styles.progressLine, styles.activeLine]} />
                <View style={[styles.progressDot, styles.activeDot]} />
                <View style={[styles.progressLine, styles.activeLine]} />

                {/* Rekka-pallura */}
                <View style={styles.truckIconContainer}>
                    <Text style={{ fontSize: 16 }}>🚚</Text>
                </View>

                <View style={[styles.progressLine, styles.inactiveLine]} />
                <View style={[styles.progressDot, styles.inactiveDot]} />
            </View>

            {/* Tuotekuvat */}
            <View style={styles.productRow}>
                <View style={styles.productThumb}><Text>🧥</Text></View>
                <View style={styles.productThumb}><Text>👟</Text></View>
                <View style={styles.productThumbMore}>
                    <Text style={styles.moreText}>+2</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Seuraa lähetystä</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    badge: {
        backgroundColor: COLORS.badgeBg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: COLORS.accentBlue,
        fontWeight: 'bold',
        fontSize: 12,
    },
    arrivalLabel: {
        textAlign: 'right',
        fontSize: 10,
        color: COLORS.textGray,
        fontWeight: 'bold',
    },
    arrivalTime: {
        textAlign: 'right',
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    storeNameLarge: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 20,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    progressDot: { width: 10, height: 10, borderRadius: 5 },
    progressLine: { flex: 1, height: 2, marginHorizontal: 5 },
    activeDot: { backgroundColor: COLORS.accentBlue },
    activeLine: { backgroundColor: COLORS.accentBlue },
    inactiveDot: { backgroundColor: COLORS.dotInactive },
    inactiveLine: { backgroundColor: COLORS.dotInactive },
    truckIconContainer: {
        backgroundColor: COLORS.accentBlue,
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.badgeBg
    },
    productRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    productThumb: {
        width: 50,
        height: 50,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    productThumbMore: {
        width: 50,
        height: 50,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moreText: {
        color: COLORS.textGray,
        fontWeight: 'bold',
    },
    primaryButton: {
        backgroundColor: COLORS.primaryBlue,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ActiveOrders;