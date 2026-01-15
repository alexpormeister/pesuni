import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = SCREEN_WIDTH - 40;
const SWIPE_RANGE = BUTTON_WIDTH - 74;

interface SwipeButtonProps {
    onSwipeSuccess: () => void;
    title: string;
    disabled?: boolean;
}

export default function SwipeButton({ onSwipeSuccess, title, disabled }: SwipeButtonProps) {
    const translateX = useSharedValue(0);

    // Uusi tapa käsitellä eleitä Reanimated 3:ssa
    const panGesture = Gesture.Pan()
        .enabled(!disabled)
        .onUpdate((event) => {
            translateX.value = Math.max(0, Math.min(event.translationX, SWIPE_RANGE));
        })
        .onEnd(() => {
            if (translateX.value > SWIPE_RANGE * 0.75) {
                translateX.value = withSpring(SWIPE_RANGE);
                runOnJS(onSwipeSuccess)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    const animatedHandleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SWIPE_RANGE * 0.6], [1, 0], Extrapolate.CLAMP),
        transform: [
            { translateX: interpolate(translateX.value, [0, SWIPE_RANGE], [0, 20], Extrapolate.CLAMP) }
        ]
    }));

    return (
        <View style={[styles.container, disabled && styles.disabled]}>
            <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                <Text style={styles.title}>{title}</Text>
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.handle, animatedHandleStyle]}>
                    <Feather name="chevrons-right" size={24} color="white" />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: BUTTON_WIDTH,
        height: 64,
        backgroundColor: '#f0f0f0',
        borderRadius: 32,
        padding: 5,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    disabled: { opacity: 0.5 },
    handle: {
        width: 54,
        height: 54,
        backgroundColor: '#00c2ff',
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    textContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 30,
    },
    title: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: 'bold',
    },
});