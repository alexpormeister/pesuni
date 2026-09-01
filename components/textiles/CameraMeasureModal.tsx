import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Platform,
    PanResponder,
    Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraMeasureModalProps {
    visible: boolean;
    onClose: () => void;
    onApplyDimensions: (lengthCm: number, widthCm: number) => void;
    initialLength?: number | null;
    initialWidth?: number | null;
}

export function CameraMeasureModal({
    visible,
    onClose,
    onApplyDimensions,
    initialLength,
    initialWidth,
}: CameraMeasureModalProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [measureMode, setMeasureMode] = useState<'box' | 'point'>('box');

    // Box measurement state (center + dimensions on screen)
    const [boxWidth, setBoxWidth] = useState<number>(initialWidth ? Math.min(Math.max(initialWidth, 40), 400) : 160);
    const [boxLength, setBoxLength] = useState<number>(initialLength ? Math.min(Math.max(initialLength, 40), 500) : 230);

    // Crosshair animation
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.15,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [visible, pulseAnim]);

    // PanResponder for Box resizing on screen
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                // Adjust width & length based on gesture
                setBoxWidth(prev => {
                    const next = Math.round(prev + gestureState.dx * 0.15);
                    return Math.min(Math.max(next, 40), 500);
                });
                setBoxLength(prev => {
                    const next = Math.round(prev - gestureState.dy * 0.15);
                    return Math.min(Math.max(next, 40), 600);
                });
            },
            onPanResponderRelease: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            },
        })
    ).current;

    const handleApply = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        onApplyDimensions(boxLength, boxWidth);
        onClose();
    };

    const handleQuickPreset = (l: number, w: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        setBoxLength(l);
        setBoxWidth(w);
    };

    const sqM = ((boxLength * boxWidth) / 10000).toFixed(2);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* KAMERANÄKYMÄ */}
                {permission?.granted ? (
                    <CameraView style={StyleSheet.absoluteFillObject} facing="back">
                        {/* AR OVERLAY - RUUDUKKO JA LASER-TÄHTÄIN */}
                        <View style={styles.arOverlay} pointerEvents="box-none">
                            {/* YLÄPALKKI */}
                            <View style={styles.topBar}>
                                <TouchableOpacity
                                    style={styles.closeBtn}
                                    onPress={onClose}
                                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                >
                                    <Feather name="x" size={24} color="#FFFFFF" />
                                </TouchableOpacity>

                                <View style={styles.topInfoBadge}>
                                    <MaterialCommunityIcons name="ruler" size={16} color="#00C2FF" style={{ marginRight: 6 }} />
                                    <Text style={styles.topInfoText}>AR-Kameramittaus</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.modeToggleBtn}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                        setMeasureMode(prev => (prev === 'box' ? 'point' : 'box'));
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={measureMode === 'box' ? 'vector-rectangle' : 'vector-line'}
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* MITTAUSALUE (BOX MODE) */}
                            <View style={styles.boxMeasureContainer} pointerEvents="box-none">
                                <View
                                    style={[
                                        styles.measuringBox,
                                        {
                                            width: Math.min(SCREEN_WIDTH * 0.78, Math.max(160, boxWidth * 1.3)),
                                            height: Math.min(SCREEN_HEIGHT * 0.38, Math.max(160, boxLength * 1.1)),
                                        },
                                    ]}
                                    {...panResponder.panHandlers}
                                >
                                    {/* KULMAMERKIT */}
                                    <View style={[styles.corner, styles.cornerTL]} />
                                    <View style={[styles.corner, styles.cornerTR]} />
                                    <View style={[styles.corner, styles.cornerBL]} />
                                    <View style={[styles.corner, styles.cornerBR]} />

                                    {/* KESKIPISTE JA LASER-TÄHTÄIN */}
                                    <Animated.View
                                        style={[
                                            styles.centerTarget,
                                            { transform: [{ scale: pulseAnim }] },
                                        ]}
                                    >
                                        <View style={styles.centerDot} />
                                    </Animated.View>

                                    {/* PITUUSMITTA (YLÄREUNA) */}
                                    <View style={styles.lengthTag}>
                                        <Text style={styles.dimensionTagText}>Pituus: {boxLength} cm</Text>
                                    </View>

                                    {/* LEVEYSMITTA (OIKEA REUNA) */}
                                    <View style={styles.widthTag}>
                                        <Text style={styles.dimensionTagText}>Leveys: {boxWidth} cm</Text>
                                    </View>

                                    {/* PINTA-ALA KESKELLÄ */}
                                    <View style={styles.areaTag}>
                                        <Text style={styles.areaTagText}>{sqM} m²</Text>
                                    </View>
                                </View>

                                <Text style={styles.instructionText}>
                                    Kohdista kamera mattoon. Raahaa kehyksestä tai käytä alla olevia säätimiä.
                                </Text>
                            </View>

                            {/* VAKIOMITTOJEN PIKAVALINNAT */}
                            <View style={styles.quickPresetsContainer}>
                                <Text style={styles.presetLabel}>Yleisimmät koot:</Text>
                                <View style={styles.presetRow}>
                                    {[
                                        { l: 200, w: 140, label: '140 × 200' },
                                        { l: 230, w: 160, label: '160 × 230' },
                                        { l: 300, w: 200, label: '200 × 300' },
                                        { l: 250, w: 80, label: '80 × 250 (Käytävä)' },
                                    ].map((item, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[
                                                styles.presetChip,
                                                boxLength === item.l && boxWidth === item.w && styles.presetChipActive,
                                            ]}
                                            onPress={() => handleQuickPreset(item.l, item.w)}
                                        >
                                            <Text
                                                style={[
                                                    styles.presetChipText,
                                                    boxLength === item.l && boxWidth === item.w && styles.presetChipTextActive,
                                                ]}
                                            >
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* ALAPALKKI JA TALLENNUS */}
                            <View style={styles.bottomControlCard}>
                                <View style={styles.resultSummaryRow}>
                                    <View style={styles.resultCol}>
                                        <Text style={styles.resultColLabel}>PITUUS</Text>
                                        <View style={styles.stepperRow}>
                                            <TouchableOpacity
                                                style={styles.stepBtn}
                                                onPress={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                                    setBoxLength(prev => Math.max(prev - 5, 20));
                                                }}
                                            >
                                                <Feather name="minus" size={16} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <Text style={styles.resultValText}>{boxLength} cm</Text>
                                            <TouchableOpacity
                                                style={styles.stepBtn}
                                                onPress={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                                    setBoxLength(prev => Math.min(prev + 5, 800));
                                                }}
                                            >
                                                <Feather name="plus" size={16} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.resultDivider} />

                                    <View style={styles.resultCol}>
                                        <Text style={styles.resultColLabel}>LEVEYS</Text>
                                        <View style={styles.stepperRow}>
                                            <TouchableOpacity
                                                style={styles.stepBtn}
                                                onPress={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                                    setBoxWidth(prev => Math.max(prev - 5, 20));
                                                }}
                                            >
                                                <Feather name="minus" size={16} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <Text style={styles.resultValText}>{boxWidth} cm</Text>
                                            <TouchableOpacity
                                                style={styles.stepBtn}
                                                onPress={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                                    setBoxWidth(prev => Math.min(prev + 5, 800));
                                                }}
                                            >
                                                <Feather name="plus" size={16} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.applyBtn}
                                    activeOpacity={0.88}
                                    onPress={handleApply}
                                >
                                    <Feather name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.applyBtnText}>
                                        Hyväksy mitat ({boxLength} × {boxWidth} cm – {sqM} m²)
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                ) : (
                    <View style={styles.permissionBox}>
                        <MaterialCommunityIcons name="camera-off" size={48} color="#94A3B8" />
                        <Text style={styles.permTitle}>Kameran käyttöoikeus vaaditaan</Text>
                        <Text style={styles.permDesc}>
                            Anna sovellukselle lupa käyttää kameraa mitataksesi mattoja ja tekstiilejä älykkäästi.
                        </Text>
                        <TouchableOpacity
                            style={styles.permBtn}
                            onPress={requestPermission}
                        >
                            <Text style={styles.permBtnText}>Salli kameran käyttö</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.permCancelBtn} onPress={onClose}>
                            <Text style={styles.permCancelBtnText}>Syötä mitat käsin</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    arOverlay: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 54 : 30,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    closeBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topInfoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 194, 255, 0.4)',
    },
    topInfoText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    modeToggleBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxMeasureContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    measuringBox: {
        position: 'relative',
        borderWidth: 2,
        borderColor: 'rgba(0, 194, 255, 0.85)',
        borderStyle: 'dashed',
        backgroundColor: 'rgba(0, 194, 255, 0.08)',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#00C2FF',
    },
    cornerTL: {
        top: -2,
        left: -2,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 6,
    },
    cornerTR: {
        top: -2,
        right: -2,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 6,
    },
    cornerBL: {
        bottom: -2,
        left: -2,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 6,
    },
    cornerBR: {
        bottom: -2,
        right: -2,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 6,
    },
    centerTarget: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: '#00C2FF',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 194, 255, 0.2)',
    },
    centerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00C2FF',
    },
    lengthTag: {
        position: 'absolute',
        top: -16,
        backgroundColor: '#00C2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    widthTag: {
        position: 'absolute',
        right: -16,
        backgroundColor: '#00C2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dimensionTagText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
    },
    areaTag: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#00C2FF',
    },
    areaTagText: {
        color: '#00C2FF',
        fontWeight: '800',
        fontSize: 14,
    },
    instructionText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 6,
        borderRadius: 12,
    },
    quickPresetsContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    presetLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        marginBottom: 6,
        fontWeight: '600',
    },
    presetRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    presetChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    presetChipActive: {
        backgroundColor: '#00C2FF',
        borderColor: '#00C2FF',
    },
    presetChipText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    presetChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    bottomControlCard: {
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        gap: 14,
    },
    resultSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resultCol: {
        flex: 1,
        alignItems: 'center',
    },
    resultDivider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    resultColLabel: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stepBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultValText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    applyBtn: {
        backgroundColor: '#00C2FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        shadowColor: '#00C2FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    applyBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    permissionBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 14,
    },
    permTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    permDesc: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
    permBtn: {
        backgroundColor: '#00C2FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 10,
    },
    permBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
    permCancelBtn: {
        paddingVertical: 10,
    },
    permCancelBtnText: {
        color: '#94A3B8',
        fontSize: 14,
    },
});
