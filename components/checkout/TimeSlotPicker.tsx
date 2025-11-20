import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
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

// --- Tyyppimäärittelyt ---
interface TimeSlot {
    id: string;
    time: string; // esim. "08:00 - 10:00"
    isAvailable: boolean;
}

interface TimeSlotPickerProps {
    onSelectionChange: (pickupSlot: TimeSlot | null, deliverySlot: TimeSlot | null) => void;
    style?: ViewStyle;
}

// --- SIMULOIDUT AINEISTOT ---
const MOCK_SLOTS: TimeSlot[] = [
    { id: 't1', time: '08:00 - 10:00', isAvailable: true },
    { id: 't2', time: '10:00 - 12:00', isAvailable: true },
    { id: 't3', time: '12:00 - 14:00', isAvailable: false }, // Varattu
    { id: 't4', time: '14:00 - 16:00', isAvailable: true },
    { id: 't5', time: '16:00 - 18:00', isAvailable: true },
    { id: 't6', time: '18:00 - 20:00', isAvailable: true },
];

const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        days.push(date);
    }
    return days;
};

// KORJATTU TÄMÄ OBJEKTI: Käytetään 'time' 'slot' sijaan
const NEXT_AVAILABLE_ASAP = {
    id: 'asap',
    time: '14:00 - 16:00', // Aikaikkuna
    date: new Date(),
    isAvailable: true,
};
// ------------------------------


const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ onSelectionChange, style }) => {
    // 1. Nouto-logiikka
    const [isAsapPickup, setIsAsapPickup] = useState(true);
    const [selectedPickupDate, setSelectedPickupDate] = useState<Date>(getNextSevenDays()[0]);
    const [selectedPickupSlotId, setSelectedPickupSlotId] = useState<string | null>(null);

    // 2. Palautus-logiikka
    const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date>(getNextSevenDays()[2]);
    const [selectedDeliverySlotId, setSelectedDeliverySlotId] = useState<string | null>(null);

    const availableDates = useMemo(() => getNextSevenDays(), []);

    // Tietojen välittäminen vanhemmalle komponentille
    React.useEffect(() => {
        // Määritellään noutoslotti
        const pickupSlot = isAsapPickup
            ? (NEXT_AVAILABLE_ASAP as unknown as TimeSlot)
            : MOCK_SLOTS.find(s => s.id === selectedPickupSlotId && s.isAvailable) || null;

        // Määritellään palautusslotti
        const deliverySlot = MOCK_SLOTS.find(s => s.id === selectedDeliverySlotId && s.isAvailable) || null;

        onSelectionChange(pickupSlot, deliverySlot);
    }, [isAsapPickup, selectedPickupSlotId, selectedDeliverySlotId, onSelectionChange]);


    // --- Renderöinti Funktiot ---

    const renderDateSelector = (selectedDate: Date, setSelectedDate: (date: Date) => void) => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelectorScroll}>
            {availableDates.map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dateButton,
                            isSelected && styles.dateButtonSelected,
                        ]}
                        onPress={() => setSelectedDate(date)}
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

    const renderSlotSelector = (selectedSlotId: string | null, setSelectedSlotId: (id: string) => void) => (
        <View style={styles.slotsGrid}>
            {MOCK_SLOTS.map(slot => {
                const isSelected = slot.id === selectedSlotId;
                return (
                    <TouchableOpacity
                        key={slot.id}
                        style={[
                            styles.slotButton,
                            isSelected && styles.slotButtonSelected,
                            !slot.isAvailable && styles.slotButtonUnavailable,
                        ]}
                        onPress={() => slot.isAvailable && setSelectedSlotId(slot.id)}
                        disabled={!slot.isAvailable}
                    >
                        <Text style={[
                            styles.slotText,
                            isSelected && styles.slotTextSelected,
                            !slot.isAvailable && styles.slotTextUnavailable,
                        ]}>
                            {slot.time}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>Valitse noutotapa ja aikaikkunat</Text>

            {/* --- 1. Noutotavan valinta --- */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, isAsapPickup && styles.toggleButtonActive]}
                    onPress={() => setIsAsapPickup(true)}
                >
                    <Text style={[styles.toggleText, isAsapPickup && styles.toggleTextActive]}>
                        Mahdollisimman pian
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, !isAsapPickup && styles.toggleButtonActive]}
                    onPress={() => setIsAsapPickup(false)}
                >
                    <Text style={[styles.toggleText, !isAsapPickup && styles.toggleTextActive]}>
                        Valitse aika
                    </Text>
                </TouchableOpacity>
            </View>

            {/* --- 2. Nouto: ASAP Tila tai Kalenteri --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nouto (Pickup)</Text>
                {isAsapPickup ? (
                    <View style={styles.asapContainer}>
                        <Feather name="clock" size={20} color={COLORS.primary} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.asapLabel}>Seuraava vapaa aikahaarukka:</Text>
                            <Text style={styles.asapTime}>
                                {NEXT_AVAILABLE_ASAP.date.toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'short' })},
                                {NEXT_AVAILABLE_ASAP.time} {/* KORJATTU: Käytetään .time */}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <>
                        <Text style={styles.dateTitle}>Valitse noutopäivä:</Text>
                        {renderDateSelector(selectedPickupDate, setSelectedPickupDate)}

                        <Text style={styles.slotTitle}>Valitse sopiva noutoaika:</Text>
                        {renderSlotSelector(selectedPickupSlotId, setSelectedPickupSlotId)}
                    </>
                )}
            </View>

            {/* --- 3. Palautus: Kalenteri --- */}
            <View style={[styles.section, { borderTopWidth: 1, borderTopColor: COLORS.borderColor, paddingTop: 20 }]}>
                <Text style={styles.sectionTitle}>Palautus (Delivery)</Text>
                <Text style={styles.subtitle}>Palvelu kestää tyypillisesti 48 tuntia noudosta.</Text>

                <Text style={styles.dateTitle}>Valitse palautuspäivä:</Text>
                {renderDateSelector(selectedDeliveryDate, setSelectedDeliveryDate)}

                <Text style={styles.slotTitle}>Valitse sopiva palautusaika:</Text>
                {renderSlotSelector(selectedDeliverySlotId, setSelectedDeliverySlotId)}
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 15,
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.textGray,
        marginBottom: 10,
    },

    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightGray,
        borderRadius: 10,
        marginBottom: 20,
        padding: 5,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: COLORS.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        color: COLORS.textGray,
    },
    toggleTextActive: {
        color: COLORS.darkText,
    },

    asapContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        marginTop: 10,
    },
    asapLabel: {
        fontSize: 12,
        color: COLORS.textGray,
    },
    asapTime: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },

    dateTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkText,
        marginTop: 15,
        marginBottom: 10,
    },
    dateSelectorScroll: {
        marginBottom: 15,
    },
    dateButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        alignItems: 'center',
    },
    dateButtonSelected: {
        backgroundColor: COLORS.primary,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textGray,
    },
    dateNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    dateTextSelected: {
        color: COLORS.white,
    },

    slotTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkText,
        marginTop: 10,
        marginBottom: 10,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    slotButton: {
        width: '48%',
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        alignItems: 'center',
    },
    slotButtonSelected: {
        borderColor: COLORS.activeBorder,
        backgroundColor: COLORS.primary,
    },
    slotButtonUnavailable: {
        backgroundColor: COLORS.unavailable,
        borderColor: COLORS.unavailable,
        opacity: 0.6,
    },
    slotText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.darkText,
    },
    slotTextSelected: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    slotTextUnavailable: {
        color: COLORS.textGray,
    },
});

export default TimeSlotPicker;