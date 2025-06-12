import { Image } from 'expo-image';
import { Platform, StyleSheet, Dimensions } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScrollView } from 'react-native-gesture-handler';

const screenHeight = Dimensions.get('window').height;

export function DateBox() {
  return (
    <ThemedView style={{ paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, borderRadius: 20 }}>
      <ThemedView
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Left section */}
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{
              uri: 'https://logosandtypes.com/wp-content/uploads/2021/04/proximus.svg',
            }}
            style={{ width: 50, height: 50 }}
            contentFit="cover"
            transition={300}
          />

          <ThemedView style={{ paddingLeft: 10 }}>
            <ThemedText type="subtitle">Proximus</ThemedText>
            <ThemedText type="defaultSemiBold">Multinational</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Right section */}
        <ThemedView>
          <ThemedText type="subtitle">16:30 - 17:00</ThemedText>
          <ThemedText type="defaultSemiBold">Aula 3</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView>
      <ThemedView> {/* De root view van alles */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welkom!</ThemedText>
          <ThemedText type="subtitle">Zo ziet je dag eruit!</ThemedText>
        </ThemedView>

        <ThemedView style={DateBoxStyles.container}>
          <ThemedView style={DateBoxStyles.BoxDesign}>
            <DateBox />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const DateBoxStyles = StyleSheet.create({
  BoxDesign: {
    borderWidth: 1,
    borderRadius: 19,
    width: 350,
  },
  container: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  }
});

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 70,
    paddingLeft: 30,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
