import { Image } from 'expo-image';
import { ActivityIndicator, Dimensions, StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { ValidateToken } from './(tabs)/account';

const screenHeight = Dimensions.get('window').height;

export function DateBox({ bedrijfsNaam, kortBeschrijving, logoURL }: { bedrijfsNaam: string, kortBeschrijving: string, logoURL: string }) {
  return (
    <ThemedView style={{ paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, borderRadius: 20 }}>
      <ThemedView
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{
              uri: logoURL,
            }}
            style={{ width: 50, height: 50, borderRadius: 10 }}
            contentFit="cover"
            transition={300}
            
          />

          <ThemedView style={{ paddingLeft: 10 }}>
            <ThemedText type="subtitle">{bedrijfsNaam}</ThemedText>
            <ThemedText type="defaultSemiBold">{kortBeschrijving}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={{ alignItems: 'flex-end' }}>
          <ThemedText type="subtitle">17:00</ThemedText>
          <ThemedText type="defaultSemiBold">Aula 3</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

export default function HomeScreen() {
  const [speeddates, setSpeeddates] = useState([]);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const token = await ValidateToken();
      const response = await fetch('https://api.ehb-match.me/speeddates', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setSpeeddates(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, []);

  const theme = useColorScheme();
  const borderColor = theme === 'dark' ? 'white' : 'black';


  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <ThemedView>
          <ThemedView style={DateBoxStyles.container}>
            <ThemedView style={[DateBoxStyles.BoxDesign, { borderColor }]}>
              
              <ThemedText style={{textAlign: "center"}}>F</ThemedText>
              
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const DateBoxStyles = StyleSheet.create({
  BoxDesign: {
    borderWidth: 1,
    borderRadius: 19,
    width: 350,
    paddingVertical: 10,
    marginTop: 0
  },
  container: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    flex: 1,
  },
});

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute', 
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    borderRadius: 10,
    marginHorizontal: 16,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  loaderContainer: {
    alignSelf: 'center',
  },
});

