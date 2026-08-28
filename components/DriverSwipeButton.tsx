import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = SCREEN_WIDTH - 48;
const BUTTON_HEIGHT = 60;
const THUMB_SIZE = 52;
const SWIPE_MAX = BUTTON_WIDTH - THUMB_SIZE - 8;

interface DriverSwipeButtonProps {
    onSwipeSuccess: () => void;
    title?: string;
    loading?: boolean;
    disabled?: boolean;
}

export const DriverSwipeButton: React.FC<DriverSwipeButtonProps> = ({
    onSwipeSuccess,
    title = 'Ota keikka',
    loading = false,
    disabled = false,
}) => {
    const panX = useRef(new Animated.Value(0)).current;
    const [isConfirmed, setIsConfirmed] = useState(false);
    const hasTriggeredRef = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabled && !loading && !hasTriggeredRef.current,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return !disabled && !loading && !hasTriggeredRef.current && Math.abs(gestureState.dx) > 5;
            },
            onPanResponderGrant: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            },
            onPanResponderMove: (_, gestureState) => {
                if (hasTriggeredRef.current) return;
                const newX = Math.max(0, Math.min(gestureState.dx, SWIPE_MAX));
                panX.setValue(newX);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (hasTriggeredRef.current) return;

                if (gestureState.dx > SWIPE_MAX * 0.45) {
                    // Onnistunut pyyhkäisy
                    hasTriggeredRef.current = true;
                    setIsConfirmed(true);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

                    Animated.spring(panX, {
                        toValue: SWIPE_MAX,
                        useNativeDriver: true,
                        speed: 16,
                        bounciness: 4,
                    }).start(() => {
                        onSwipeSuccess();
                    });
                } else {
                    // Palautetaan alkuun
                    Animated.spring(panX, {
                        toValue: 0,
                        useNativeDriver: true,
                        speed: 18,
                        bounciness: 6,
                    }).start();
                }
            },
            onPanResponderTerminate: () => {
                if (!hasTriggeredRef.current) {
                    Animated.spring(panX, {
                        toValue: 0,
                        useNativeDriver: true,
                        speed: 18,
                    }).start();
                }
            },
        })
    ).current;

    // Tekstin häipyminen pyyhkäistäessä
    const textOpacity = panX.interpolate({
        inputRange: [0, SWIPE_MAX * 0.5],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const textTranslateX = panX.interpolate({
        inputRange: [0, SWIPE_MAX],
        outputRange: [0, 20],
        extrapolate: 'clamp',
    });

    return (
        <View style={[styles.container, (disabled || loading) && styles.disabled]}>
            {/* Taustateksti ja ohje */}
            <Animated.View
                style={[
                    styles.textWrapper,
                    {
                        opacity: textOpacity,
                        transform: [{ translateX: textTranslateX }],
                    },
                ]}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Vahvistetaan...' : `Pyyhkäise ottaaksesi keikan`}
                </Text>
            </Animated.View>

            {/* Liu'utettava nappi */}
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.thumb,
                    isConfirmed && styles.thumbConfirmed,
                    {
                        transform: [{ translateX: panX }],
                    },
                ]}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : isConfirmed ? (
                    <Feather name="check" size={24} color="#FFFFFF" />
                ) : (
                    <Feather name="chevrons-right" size={24} color="#FFFFFF" />
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        backgroundColor: '#0F172A',
        borderRadius: BUTTON_HEIGHT / 2,
        padding: 4,
        justifyContent: 'center',
        position: 'relative',
        shadowColor: '#00C2FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
        alignSelf: 'center',
        marginVertical: 6,
    },
    disabled: {
        opacity: 0.6,
    },
    textWrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 40,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: '#00C2FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    thumbConfirmed: {
        backgroundColor: '#10B981',
    },
});
