import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Propsien tyypitys (jos käytät TypeScriptiä, suositeltavaa)
interface HistoryItemProps {
    store: string;
    date: string;
    price: string;
    items: string;
    isBurger?: boolean; // Valinnainen prop, muuttaa ikonia
}

const COLORS = {
    white: '#FFFFFF',
    darkText: '#181818ff',
    textGray: '#6B7280',
    greenBg: '#D1FAE5',
    greenText: '#059669',
    accentBlue: '#5abaff',
    divider: '#F3F4F6',
};


const HistoryItem = ({ store, date, price, items, isBurger }: HistoryItemProps) => {
    return (
        <View style={styles.historyCard}>
            <View style={styles.historyRow}>
                {/* Ikoni vasemmalla: Burgerille laatikko, muille 'check' */}
                <View style={[styles.iconCircle, isBurger && { backgroundColor: '#F3F4F6' }]}>
                    {isBurger ? <Text>📦</Text> : <Text style={{ color: COLORS.greenText, fontWeight: 'bold' }}>✓</Text>}
                </View>

                {/* Tekstit */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.storeName}>{store}</Text>
                        <Text style={styles.price}>{price}</Text>
                    </View>
                    <Text style={styles.dateText}>{date}</Text>
                </View>
            </View>

            {/* Alarivi: Tuotteet ja Linkki */}
            <View style={styles.historyFooter}>
                <Text style={styles.itemCount}>{items}</Text>
                <TouchableOpacity>
                    <Text style={styles.linkText}>AVAA KUITTI</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    historyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 2,
    },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: COLORS.greenBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    storeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkText,
    },
    dateText: {
        color: COLORS.textGray,
        fontSize: 13,
        marginTop: 2,
    },
    historyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
        paddingTop: 15,
    },
    itemCount: {
        color: '#9CA3AF',
        fontSize: 13,
    },
    linkText: {
        color: COLORS.accentBlue,
        fontWeight: 'bold',
        fontSize: 13,
    },
});

export default HistoryItem;