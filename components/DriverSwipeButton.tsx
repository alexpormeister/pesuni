import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
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
const BUTTON_HEIGHT = 58;
const THUMB_SIZE = 50;
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

    // Palautetaan nappi alkuasentoon jos lataus päättyy
    useEffect(() => {
        if (!loading) {
            hasTriggeredRef.current = false;
            setIsConfirmed(false);
            Animated.spring(panX, {
                toValue: 0,
                useNativeDriver: true,
                speed: 18,
                bounciness: 4,
            }).start();
        }
    }, [loading]);

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
        <View style={[styles.outerWrapper, (disabled || loading) && styles.disabled]}>
            <LinearGradient
                colors={['#00C2FF', '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientContainer}
            >
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
                        {loading ? 'Vahvistetaan...' : 'Pyyhkäise ottaaksesi keikan'}
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
                        <ActivityIndicator size="small" color="#0284C7" />
                    ) : isConfirmed ? (
                        <Feather name="check" size={24} color="#FFFFFF" />
                    ) : (
                        <Feather name="chevrons-right" size={24} color="#0284C7" />
                    )}
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    outerWrapper: {
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        borderRadius: BUTTON_HEIGHT / 2,
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
        alignSelf: 'center',
        marginVertical: 8,
    },
    gradientContainer: {
        flex: 1,
        borderRadius: BUTTON_HEIGHT / 2,
        padding: 4,
        justifyContent: 'center',
        position: 'relative',
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
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    thumbConfirmed: {
        backgroundColor: '#10B981',
    },
});
