import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { height } = Dimensions.get('window');
const LOGO_IMAGE = require('../assets/images/pesuni-basket.png'); // Varmista, että polku on oikein

interface SplashScreenProps {
    onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
    const translateY = useSharedValue(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            // 👇 TÄMÄ ON AINOA MUUTOS: kesto on nyt 2000ms 👇
            translateY.value = withTiming(-height, { duration: 2000 }, (isFinished) => {
                if (isFinished) {
                    runOnJS(onAnimationComplete)();
                }
            });
        }, 2000); // Odotetaan 2 sekuntia ennen animaation alkua

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <LinearGradient
                colors={['#00B4F5', '#B5E8FF', '#FFFFFF']}
                style={styles.gradient}
            >
                <View style={styles.logoContainer}>
                    <Image source={LOGO_IMAGE} style={styles.logo} />
                </View>
                <Text style={styles.appName}>PESUNI</Text>
                <Text style={styles.tagline}>PUHDASTA ARKEA</Text>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    appName: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#005D97',
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 16,
        color: '#005D97',
        letterSpacing: 1,
    },
});

export default SplashScreen;