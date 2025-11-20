import { Feather } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectCartItems } from '../redux/cartSlice';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Vakiot
const BUBBLE_SIZE = 60;
const SNAP_PADDING = 15;
const TAP_THRESHOLD = 5;

interface FloatingCartBubbleProps {
    onPress: () => void;
}

const FloatingCartBubble: React.FC<FloatingCartBubbleProps> = ({ onPress }) => {
    const cartItems = useSelector(selectCartItems);
    const itemCount = cartItems.length;

    const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - BUBBLE_SIZE - SNAP_PADDING, y: SCREEN_HEIGHT / 2 })).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,

            onPanResponderGrant: () => {
                pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
                pan.setValue({ x: 0, y: 0 });
            },

            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
                useNativeDriver: false,
            }),

            onPanResponderRelease: (evt, gestureState) => {
                pan.flattenOffset();

                const distance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy);

                if (distance < TAP_THRESHOLD) {
                    onPress();
                    return;
                }

                const currentX = (pan.x as any)._value;
                const releaseVelocity = gestureState.vx;

                const isNearLeft = currentX < SCREEN_WIDTH / 2;

                let targetX;

                if (isNearLeft || releaseVelocity < -0.5) {
                    targetX = SNAP_PADDING;
                } else {
                    targetX = SCREEN_WIDTH - BUBBLE_SIZE - SNAP_PADDING;
                }

                Animated.spring(pan, {
                    toValue: { x: targetX, y: (pan.y as any)._value },
                    useNativeDriver: false,
                    speed: 15,
                    bounciness: 0,
                }).start();
            },
        })
    ).current;

    if (itemCount === 0) return null;

    return (
        <Animated.View
            style={[
                styles.bubbleContainer,
                {
                    transform: pan.getTranslateTransform(),
                },
            ]}
            {...panResponder.panHandlers}
        >
            <View style={styles.bubble}>
                {/* SININEN OSTOSKORI-IKONI */}
                <Feather name="shopping-cart" size={24} color={COLORS.white} />

                {/* SININEN TUOTTEIDEN LUKUMÄÄRÄ */}
                {itemCount > 0 && (
                    <View style={styles.itemCountBubble}>
                        <Text style={styles.itemCountText}>{itemCount}</Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

export default FloatingCartBubble;

// --- UUDET TYYLIT ---
const COLORS = {
    white: '#e8e8e8ff',
    primary: '#00c2ff', // Käytetään tätä sinisenä värinä
    redAccent: '#FF4500',
};

const styles = StyleSheet.create({
    bubbleContainer: {
        position: 'absolute',
        zIndex: 9999,
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
    },
    bubble: {
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        borderRadius: BUBBLE_SIZE / 2,
        backgroundColor: COLORS.primary, // VALKOINEN TAUSTA
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    itemCountBubble: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.white, // Sininen tausta lukumäärälle
        borderRadius: 10,
        minWidth: 20, // Varmistaa, että pallo on riittävän iso yhdelle tai kahdelle numerolle
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4, // Lisää hieman tilaa sivuille
    },
    itemCountText: {
        color: COLORS.primary, // Valkoinen teksti sinisellä pohjalla
        fontSize: 12,
        fontWeight: 'bold',
    },
});