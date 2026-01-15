import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider'; // Varmista että tämä on asennettu
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { supabase } from '../../lib/supabase';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    primary: '#00c2ff',
    lightGray: '#F8F9FD',
    borderColor: '#EFEFEF',
    success: '#4CAF50',
    pointsGold: '#FFD700',
    textGray: '#6B7280',
};

interface PointsUsageProps {
    onPointsApplied: (discount: number, pointsUsed: number) => void;
    style?: ViewStyle;
}

const PointsUsage: React.FC<PointsUsageProps> = ({ onPointsApplied, style }) => {
    const [userPoints, setUserPoints] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUserPoints();
    }, []);

    const fetchUserPoints = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('points_balance')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            setUserPoints(data?.points_balance || 0);
        } catch (error) {
            console.error('Points fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSliderChange = (value: number) => {
        const roundedValue = Math.floor(value);
        setPointsToUse(roundedValue);

        // Lasketaan alennus: 1p = 0.02€
        const discount = roundedValue * 0.02;
        onPointsApplied(discount, roundedValue);
    };

    if (isLoading) {
        return (
            <View style={[styles.card, styles.centered, style]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    }

    const currentDiscount = (pointsToUse * 0.02).toFixed(2);

    return (
        <View style={[styles.card, style]}>
            <View style={styles.headerRow}>
                <MaterialCommunityIcons name="star-circle" size={26} color={COLORS.pointsGold} />
                <Text style={styles.title}>Käytä pesupisteitä</Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.pointsLabel}>Käytössä: <Text style={styles.bold}>{pointsToUse} p</Text></Text>
                <Text style={styles.discountLabel}>–{currentDiscount} €</Text>
            </View>

            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={userPoints}
                step={1}
                value={pointsToUse}
                onValueChange={handleSliderChange}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.borderColor}
                thumbTintColor={COLORS.primary}
                disabled={userPoints <= 0}
            />

            <View style={styles.rangeLabels}>
                <Text style={styles.rangeText}>0 p</Text>
                <Text style={styles.rangeText}>Saldo: {userPoints} p</Text>
            </View>

            {pointsToUse > 0 && (
                <View style={styles.appliedBadge}>
                    <Text style={styles.appliedText}>Pisteet käytössä tilauksessa</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 18,
        marginVertical: 12,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    centered: { justifyContent: 'center', alignItems: 'center', minHeight: 120 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    title: { fontSize: 17, fontWeight: 'bold', color: COLORS.darkText, marginLeft: 10 },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    pointsLabel: { fontSize: 15, color: COLORS.darkText },
    discountLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    bold: { fontWeight: 'bold' },
    slider: {
        width: '100%',
        height: 40,
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -5
    },
    rangeText: { fontSize: 12, color: COLORS.textGray },
    appliedBadge: {
        marginTop: 15,
        backgroundColor: '#F0FAFF',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#B2EBF2'
    },
    appliedText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' }
});

export default PointsUsage;