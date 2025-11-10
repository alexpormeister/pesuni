import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
    primary: '#005D97',
    white: 'white',
    gradientStart: '#8ed6ff',
    gradientEnd: '#4da3e0ff',
};

const BasketImage = require("../../assets/images/pesuni-basket.png");

interface HomeHeaderProps {
    onStartPress: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ onStartPress }) => {
    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            style={styles.header}>

            <View style={styles.headerContent}>
                <Text style={styles.title}>Pyykkiä tulossa?</Text>
                <Text style={styles.subtitle}>Valitse pestävät ja noutoaika, me hoidamme loput.</Text>

                <TouchableOpacity
                    style={styles.startButton}
                    onPress={onStartPress}
                >
                    <Text style={styles.startButtonText}>Aloita Pesu</Text>
                </TouchableOpacity>
            </View>

            <Image
                source={BasketImage}
                style={styles.basketImage}
                resizeMode="contain"
            />
        </LinearGradient>
    );
}

export default HomeHeader;

const styles = StyleSheet.create({
    header: {
        padding: 25,
        paddingTop: 60,
        paddingBottom: 135,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.white,
        marginBottom: 25,
        maxWidth: '70%',
    },
    headerContent: {
        top: 55,
    },
    startButton: {
        backgroundColor: COLORS.white,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignSelf: 'flex-start',
    },
    startButtonText: {
        color: "black",
        fontSize: 18,
        fontWeight: 'bold',
    },
    basketImage: {
        position: 'absolute',
        bottom: -10,
        right: 15,
        width: 150,
        height: 150,
        zIndex: 10,
    },
});
