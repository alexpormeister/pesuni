import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SettingItem = {
    id: string;
    label: string;
    icon: string;
    onPress: () => void;
};

interface SettingsListProps {
    title: string;
    items: SettingItem[];
}

const SettingsList: React.FC<SettingsListProps> = ({ title, items }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.listContainer}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.itemRow,
                            index === items.length - 1 && styles.lastItemRow
                        ]}
                        onPress={item.onPress}
                    >
                        <FontAwesome5 name={item.icon} size={22} color="#00c2ff" style={styles.icon} />
                        <Text style={styles.itemText}>{item.label}</Text>
                        <FontAwesome5 name="chevron-right" size={16} color="#C7C7CC" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        marginVertical: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8A8A8A',
        marginBottom: 8,
        marginLeft: 5,
    },
    listContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 3,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    lastItemRow: {
        borderBottomWidth: 0,
    },
    icon: {
        width: 30,
        textAlign: 'center',
    },
    itemText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 17,
        color: '#000000',
    },
});

export default SettingsList;