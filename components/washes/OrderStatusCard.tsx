import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

interface OrderStatusCardProps {
    order: any;
}

const statusConfig: any = {
    pending: { label: 'Odottaa', step: 1, icon: 'clock', color: '#8E8E93', image: require("../../assets/images/3dglossy-logo.png") },
    accepted: { label: 'Hyväksytty', step: 2, icon: 'thumbs-up', color: '#5856D6', image: require("../../assets/images/3dglossy-logo.png") },
    picking_up: { label: 'Noudossa', step: 3, icon: 'truck', color: '#FF9500', image: require("../../assets/images/pesuni-car.png") },
    washing: { label: 'Pesussa', step: 4, icon: 'droplet', color: '#007AFF', image: require("../../assets/images/pesuni-washing.png") },
    returning: { label: 'Palautuksessa', step: 5, icon: 'package', color: '#34C759', image: require("../../assets/images/pesuni-car.png") },
    delivered: { label: 'Toimitettu', step: 6, icon: 'check-circle', color: '#34C759', image: require("../../assets/images/3dglossy-logo.png") },
    rejected: { label: 'Hylätty', step: 0, icon: 'x-circle', color: '#FF3B30', image: require("../../assets/images/3dglossy-logo.png") },
};

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({ order }) => {
    const config = statusConfig[order.status] || statusConfig.pending;
    const isRejected = order.status === 'rejected';

    return (
        <View style={[styles.card, { borderTopWidth: 6, borderTopColor: config.color }]}>
            <View style={styles.mascotArea}>
                <View style={[styles.imageCircle, { backgroundColor: config.color + '15' }]}>
                    <Image
                        source={config.image}
                        style={[styles.mascot, isRejected && { opacity: 0.5, tintColor: '#8E8E93' }]}
                    />
                </View>
                <View style={[styles.statusBubble, { backgroundColor: config.color }]}>
                    <Feather name={config.icon} size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.statusText}>{config.label}</Text>
                </View>
            </View>

            {!isRejected ? (
                <View style={styles.progressContainer}>
                    {[1, 2, 3, 4, 5].map((step) => (
                        <View key={step} style={styles.stepWrapper}>
                            <View style={[styles.dot, step <= config.step ? { backgroundColor: config.color } : styles.inactiveDot]} />
                            {step < 5 && <View style={[styles.line, step < config.step ? { backgroundColor: config.color } : styles.inactiveLine]} />}
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.rejectedMessage}>
                    <Text style={styles.rejectedText}>Tilauksessa ilmeni ongelma.</Text>
                    <Text style={styles.rejectedSubText}>Ota yhteyttä tukeen sovelluksen kautta.</Text>
                </View>
            )}

            <View style={styles.orderContent}>
                <View style={styles.contentHeader}>
                    <Feather name="shopping-bag" size={14} color="#8E8E93" />
                    <Text style={styles.contentTitle}>TILAUKSEN SISÄLTÖ</Text>
                </View>
                <Text style={styles.serviceNameText}>{order.service_name || 'Pesupalvelu'}</Text>
                <Text style={styles.priceText}>{order.final_price || order.price} €</Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.orderIdText}>Tilaus #{order.id?.slice(0, 8) || '12345'}</Text>
                <Text style={styles.updateText}>Vaihe: {config.label}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
            android: { elevation: 5 }
        }),
        marginHorizontal: 16,
        marginVertical: 10,
    },
    mascotArea: { alignItems: 'center', marginBottom: 15 },
    imageCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: -20 },
    mascot: { width: 80, height: 80, resizeMode: 'contain' },
    statusBubble: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
    statusText: { color: '#fff', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
    progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20, width: '100%' },
    stepWrapper: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5 },
    inactiveDot: { backgroundColor: '#E5E5EA' },
    line: { width: 30, height: 3, borderRadius: 2 },
    inactiveLine: { backgroundColor: '#E5E5EA' },
    orderContent: {
        width: '100%',
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
        alignItems: 'flex-start',
    },
    contentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    contentTitle: { fontSize: 9, fontWeight: '700', color: '#8E8E93', marginLeft: 6, letterSpacing: 0.5 },
    serviceNameText: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
    priceText: { fontSize: 13, color: '#00c2ff', fontWeight: '700', marginTop: 2 },
    details: { alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F2F2F7', width: '100%', paddingTop: 10 },
    orderIdText: { fontSize: 12, fontWeight: '700', color: '#1C1C1E' },
    updateText: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
    rejectedMessage: { marginVertical: 15, alignItems: 'center' },
    rejectedText: { color: '#FF3B30', fontWeight: '700', fontSize: 14 },
    rejectedSubText: { color: '#8E8E93', fontSize: 11, marginTop: 3 },
});

export default OrderStatusCard;