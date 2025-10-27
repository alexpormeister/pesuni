import React from 'react';
import { StyleSheet, View } from 'react-native';
// Korjattu import-lauseke. Oletetaan, että ServiceGrid on esim. app/components/-kansiossa
// ja ServiceItem on samassa kansiossa. Muokkaa polkua tarvittaessa.
import ServiceItem from "../ServiceItem";

// Tämä on dataa, joka tulee yleensä ylemmältä tasolta (esim. päänäkymästä)
// Voit siirtää tämän pois tästä tiedostosta.
interface Service {
    id: number;
    name: string;
    imagePath: any;
    backgroundColor: string;
}

// Komponentin propsit
interface ServiceGridProps {
    services: Service[];
}

const ServiceGrid: React.FC<ServiceGridProps> = ({ services }) => {
    return (
        <View style={styles.gridContainer}>
            {services.map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                    <ServiceItem
                        name={item.name}
                        imagePath={item.imagePath}
                        backgroundColor={item.backgroundColor}
                        onPress={() => console.log(`Palvelu ${item.name} valittu`)}
                    />
                </View>
            ))}
        </View>
    );
};

export default ServiceGrid;

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        marginBottom: 50,
        paddingBottom: 15,
    },
    cardWrapper: {
        width: '48%',
        aspectRatio: 1,
        marginBottom: 15,
    },
});