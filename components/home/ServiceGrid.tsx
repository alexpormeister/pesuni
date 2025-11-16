import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';

import { supabase } from '../../lib/supabase';

interface Product {
    product_id: string;
    name: string;
    description: string;
    image_url: string;
    base_price: number;
}

interface Category {
    id: string;
    name: string;
    category_id: string;
    products: Product[];
}

const FILTER_OPTIONS = [
    'Kaikki palvelut',
    'Arjen pyykit',
    'Kodintekstiilit',
    'Mattopesu',
    'Kengät & Erikoispesut',
];

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const dispatch = useDispatch();
    const [isAdded, setIsAdded] = useState(false); // Tila napin tilalle

    const handleAddToCart = () => {
        dispatch(addToCart({
            id: product.product_id,
            name: product.name,
            price: product.base_price,
        }));

        // Muutetaan napin tila
        setIsAdded(true);

        // Palautetaan nappi normaaliksi 2 sekunnin kuluttua
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    };

    return (
        <View style={styles.productCard}>
            <Image source={{ uri: product.image_url }} style={styles.productImage} resizeMode="cover" />
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
                <Text style={styles.productPrice}>{product.base_price} €</Text>

                <TouchableOpacity
                    style={[styles.addButton, isAdded && { backgroundColor: '#4CAF50' }]} // Vihreä väri kun lisätty
                    onPress={handleAddToCart}
                    disabled={isAdded} // Estetään tuplaklikkaus animaation aikana
                >
                    <Text style={styles.addButtonText}>
                        {isAdded ? "Lisätty koriin! ✓" : "Lisää ostoskoriin"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

type ServiceGridProps = {
    ListHeaderComponent?: React.ReactNode;
};

const ServiceGrid: React.FC<ServiceGridProps> = ({ ListHeaderComponent }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string>('Kaikki palvelut');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('categories')
                .select(
                    `
          id,
          name,
          category_id,
          products!inner (
            product_id,
            name,
            description,
            image_url,
            base_price
          )
        `
                )
                .eq('products.is_active', true)
                .order('sort_order');

            if (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } else if (data) {
                setCategories(data as Category[]);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const displayedCategories = useMemo(() => {
        if (selectedFilter === 'Kaikki palvelut') {
            return categories;
        }
        return categories.filter(
            (category) => category.name === selectedFilter
        );
    }, [categories, selectedFilter]);

    const renderFilterButton = (filterName: string) => {
        const isActive = filterName === selectedFilter;
        return (
            <TouchableOpacity
                key={filterName}
                style={[styles.filterButton, isActive && styles.filterButtonActive]}
                onPress={() => setSelectedFilter(filterName)}
            >
                <Text
                    style={[
                        styles.filterButtonText,
                        isActive && styles.filterButtonTextActive,
                    ]}
                >
                    {filterName}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderCategory = ({ item: category }: { item: Category }) => (
        <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <FlatList
                data={category.products}
                renderItem={({ item }) => <ProductCard product={item} />}
                keyExtractor={(product) => product.product_id}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productList}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text>Loading services...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Failed to load data: {error}</Text>
            </View>
        );
    }

    return (
        <FlatList
            style={styles.container}
            data={displayedCategories}
            renderItem={renderCategory}
            keyExtractor={(category) => category.id}
            ListHeaderComponent={
                <>
                    {ListHeaderComponent}
                    <View style={styles.filterContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterScroll}
                        >
                            {FILTER_OPTIONS.map((filter) => renderFilterButton(filter))}
                        </ScrollView>
                    </View>
                </>
            }
            ListEmptyComponent={
                <View style={styles.centeredEmpty}>
                    <Text>No services found for this filter.</Text>
                </View>
            }

            ListFooterComponent={<View style={{ height: 100 }} />}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 300,
    },
    centeredEmpty: {
        padding: 40,
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        padding: 20,
        textAlign: 'center',
    },
    filterContainer: {
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterScroll: {
        paddingHorizontal: 12,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#e9ecef',
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: '#00cce0',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#ffffff',
        fontWeight: '700',
    },
    categorySection: {
        marginTop: 16,
        backgroundColor: '#ffffff',
    },
    categoryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#212529',
        paddingHorizontal: 16,
        marginBottom: 16,
        paddingTop: 16,
        textAlign: 'center',
    },
    productList: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    productCard: {
        width: 280,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginRight: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    productDescription: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        minHeight: 32,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 8,
    },
    addButton: {
        backgroundColor: '#00cce0',
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

});

export default ServiceGrid;