import { Image } from 'expo-image';
import { ActivityIndicator, Dimensions, StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { ValidateToken } from './(tabs)/account';

export default function Screen() {
    const theme = useColorScheme();
    const borderColor = theme === 'dark' ? 'white' : 'black';
    const navigation = useNavigation();

    const { pendingDates } = useLocalSearchParams();

    useEffect(() => {
        navigation.setOptions({ title: 'Dates in afwachting' });
    }, []);

    return (
        <ThemedView>
            
        </ThemedView>
    )
}