import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const COLORS = {
    white: '#FFFFFF',
    darkText: '#0A1B32',
    textGray: '#6B7280',
    primary: '#00c2ff',
    lightGray: '#F8F9FD',
    borderColor: '#EFEFEF',
    unavailable: '#F0F0F0',
    activeBorder: '#00c2ff',
};

const BUFFER_HOURS = 2;
const WASH_CYCLE_HOURS = 24;

interface TimeSlot {
    id: string;
    time: string;
    startHour: number;
    isAvailable: boolean;
}

interface TimeSlotPickerProps {
    onSelectionChange: (pickup: any, delivery: any) => void;
    style?: ViewStyle;
}

const MOCK_SLOTS: TimeSlot[] = [
    { id: 't1', time: '08:00 - 10:00', startHour: 8, isAvailable: true },
    { id: 't2', time: '10:00 - 12:00', startHour: 10, isAvailable: true },
    { id: 't3', time: '12:00 - 14:00', startHour: 12, isAvailable: true },
    { id: 't4', time: '14:00 - 16:00', startHour: 14, isAvailable: true },
    { id: 't5', time: '16:00 - 18:00', startHour: 16, isAvailable: true },
    { id: 't6', time: '18:00 - 20:00', startHour: 18, isAvailable: true },
];

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ onSelectionChange, style }) => {
    const [isAsapPickup, setIsAsapPickup] = useState(true);
    const [selectedPickupDate, setSelectedPickupDate] = useState<Date>(new Date());
    const [selectedPickupSlotId, setSelectedPickupSlotId] = useState<string | null>(null);

    const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date>(new Date());
    const [selectedDeliverySlotId, setSelectedDeliverySlotId] = useState<string | null>(null);

    // 1. Logic for ASAP
    const asapDetails = useMemo(() => {
        const now = new Date();
        const targetHour = now.getHours() + BUFFER_HOURS;
        const availableToday = MOCK_SLOTS.find(s => s.startHour >= targetHour && s.isAvailable);

        if (availableToday) {
            return { date: now, slot: availableToday };
        } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return { date: tomorrow, slot: MOCK_SLOTS[0] };
        }
    }, []);

    // 2. Logic for Earliest Delivery
    const minDeliveryDate = useMemo(() => {
        const baseDate = isAsapPickup ? asapDetails.date : selectedPickupDate;
        const d = new Date(baseDate);
        // If manual slot is picked, we need to find that slot's start hour for precision
        const pickupSlot = isAsapPickup ? asapDetails.slot : MOCK_SLOTS.find(s => s.id === selectedPickupSlotId);
        if (pickupSlot) d.setHours(pickupSlot.startHour);

        d.setHours(d.getHours() + WASH_CYCLE_HOURS);
        return d;
    }, [isAsapPickup, asapDetails, selectedPickupDate, selectedPickupSlotId]);

    const pickupDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return d;
        });
    }, []);

    const deliveryDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(minDeliveryDate);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [minDeliveryDate]);

    useEffect(() => {
        if (selectedDeliveryDate < minDeliveryDate) {
            setSelectedDeliveryDate(deliveryDates[0]);
            setSelectedDeliverySlotId(null);
        }
    }, [minDeliveryDate, deliveryDates, selectedDeliveryDate]);

    useEffect(() => {
        const pickup = isAsapPickup
            ? asapDetails
            : { date: selectedPickupDate, slot: MOCK_SLOTS.find(s => s.id === selectedPickupSlotId) };

        const delivery = {
            date: selectedDeliveryDate,
            slot: MOCK_SLOTS.find(s => s.id === selectedDeliverySlotId)
        };

        onSelectionChange(pickup, delivery);
    }, [isAsapPickup, asapDetails, selectedPickupDate, selectedPickupSlotId, selectedDeliveryDate, selectedDeliverySlotId, onSelectionChange]);

    const renderDateSelector = (dates: Date[], selectedDate: Date, onSelect: (d: Date) => void) => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelectorScroll}>
            {dates.map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                return (
                    <TouchableOpacity
                        key={index}
                        style={[styles.dateButton, isSelected && styles.dateButtonSelected]}
                        onPress={() => onSelect(date)}
                    >
                        <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                            {date.toLocaleDateString('fi-FI', { weekday: 'short' })}
                        </Text>
                        <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>
                            {date.getDate()}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );

    const renderSlotSelector = (currentDate: Date, selectedId: string | null, onSelect: (id: string) => void) => {
        const now = new Date();
        const isToday = currentDate.toDateString() === now.toDateString();
        const currentHourWithBuffer = now.getHours() + BUFFER_HOURS;

        return (
            <View style={styles.slotsGrid}>
                {MOCK_SLOTS.map(slot => {
                    // CRITICAL FIX: Disable slot if it's today AND starts before (now + buffer)
                    const isTimeRestricted = isToday && slot.startHour < currentHourWithBuffer;
                    const isAvailable = slot.isAvailable && !isTimeRestricted;
                    const isSelected = slot.id === selectedId;

                    return (
                        <TouchableOpacity
                            key={slot.id}
                            disabled={!isAvailable}
                            style={[
                                styles.slotButton,
                                isSelected && styles.slotButtonSelected,
                                !isAvailable && styles.slotButtonUnavailable,
                            ]}
                            onPress={() => onSelect(slot.id)}
                        >
                            <Text style={[styles.slotText, isSelected && styles.slotTextSelected, !isAvailable && styles.slotTextUnavailable]}>
                                {slot.time}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>Nouto- ja palautusajat</Text>

            <View style={styles.toggleContainer}>
                <TouchableOpacity style={[styles.toggleButton, isAsapPickup && styles.toggleButtonActive]} onPress={() => setIsAsapPickup(true)}>
                    <Text style={[styles.toggleText, isAsapPickup && styles.toggleTextActive]}>ASAP</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleButton, !isAsapPickup && styles.toggleButtonActive]} onPress={() => setIsAsapPickup(false)}>
                    <Text style={[styles.toggleText, !isAsapPickup && styles.toggleTextActive]}>Valitse aika</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nouto</Text>
                {isAsapPickup ? (
                    <View style={styles.asapContainer}>
                        <Feather name="zap" size={20} color={COLORS.primary} />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.asapLabel}>Nopein mahdollinen nouto:</Text>
                            <Text style={styles.asapTime}>
                                {asapDetails.date.toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'short' })} klo {asapDetails.slot.time}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <>
                        {renderDateSelector(pickupDates, selectedPickupDate, setSelectedPickupDate)}
                        {renderSlotSelector(selectedPickupDate, selectedPickupSlotId, setSelectedPickupSlotId)}
                    </>
                )}
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Palautus</Text>
                <Text style={styles.subtitle}>Puhdasta aikaisintaan 24h noudon jälkeen.</Text>
                {renderDateSelector(deliveryDates, selectedDeliveryDate, setSelectedDeliveryDate)}
                {renderSlotSelector(selectedDeliveryDate, selectedDeliverySlotId, setSelectedDeliverySlotId)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginVertical: 10, marginHorizontal: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: COLORS.borderColor },
    title: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText, marginBottom: 16 },
    toggleContainer: { flexDirection: 'row', backgroundColor: COLORS.lightGray, borderRadius: 12, padding: 4, marginBottom: 20 },
    toggleButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    toggleButtonActive: { backgroundColor: COLORS.white, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    toggleText: { fontSize: 14, fontWeight: '600', color: COLORS.textGray },
    toggleTextActive: { color: COLORS.primary },
    section: { marginBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkText, marginBottom: 12 },
    subtitle: { fontSize: 13, color: COLORS.textGray, marginBottom: 12, fontStyle: 'italic' },
    asapContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F0FBFF', borderRadius: 12, borderWidth: 1, borderColor: '#B3E5FF' },
    asapLabel: { fontSize: 12, color: COLORS.textGray, textTransform: 'uppercase', letterSpacing: 0.5 },
    asapTime: { fontSize: 15, fontWeight: 'bold', color: COLORS.darkText, marginTop: 2 },
    dateSelectorScroll: { marginBottom: 16 },
    dateButton: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 10, backgroundColor: COLORS.lightGray, borderRadius: 12, alignItems: 'center', minWidth: 65 },
    dateButtonSelected: { backgroundColor: COLORS.primary },
    dateText: { fontSize: 12, color: COLORS.textGray, textTransform: 'capitalize' },
    dateNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.darkText, marginTop: 4 },
    dateTextSelected: { color: COLORS.white },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    slotButton: { width: '48%', padding: 14, marginBottom: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderColor, alignItems: 'center', backgroundColor: COLORS.white },
    slotButtonSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
    slotButtonUnavailable: { backgroundColor: COLORS.unavailable, opacity: 0.5 },
    slotText: { fontSize: 13, fontWeight: '600', color: COLORS.darkText },
    slotTextSelected: { color: COLORS.white },
    slotTextUnavailable: { color: COLORS.textGray },
    divider: { height: 1, backgroundColor: COLORS.borderColor, marginVertical: 20, borderStyle: 'dashed' },
});

export default TimeSlotPicker;