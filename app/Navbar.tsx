import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Navbar() {
  return (
    <ThemedView style={styles.navbar}>
      <TouchableOpacity onPress={() => alert('Navbar button pressed')}>
        <View>
          <Text style={[styles.title, styles.item]}>Thuis</Text>
          <Text style={[styles.subtitle, styles.item]}>Account & Instellingen</Text>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 25 : 40,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    paddingHorizontal: 35,
    overflow: 'visible',
  },
  item: {
    marginBottom: Platform.OS === 'android' ? -5 : 0,  // less space on Android
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },
});
