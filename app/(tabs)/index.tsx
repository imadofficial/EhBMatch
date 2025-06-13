import { Image } from 'expo-image';
import { Dimensions, StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScrollView } from 'react-native-gesture-handler';
import { useNotification } from '@/context/NotificationContext';

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
        {/* Left section */}
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

        {/* Right section */}
        <ThemedView style={{ alignItems: 'flex-end' }}>
          <ThemedText type="subtitle">17:00</ThemedText>
          <ThemedText type="defaultSemiBold">Aula 3</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

export default function HomeScreen() {
  const { expoPushToken, notification, error } = useNotification();


  console.log(expoPushToken)

  const theme = useColorScheme(); // Get the current theme (light or dark)
  const borderColor = theme === 'dark' ? 'white' : 'black';

  return (
    <ScrollView>
      <ThemedView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welkom!</ThemedText>
          <ThemedText type="subtitle">Zo ziet je dag eruit!</ThemedText>
        </ThemedView>

        <ThemedView style={DateBoxStyles.container}>
          <ThemedView style={[DateBoxStyles.BoxDesign, {borderColor: borderColor}]}>
            <DateBox bedrijfsNaam = "Proximus" kortBeschrijving = "Telecom" logoURL = "https://logosandtypes.com/wp-content/uploads/2021/04/proximus.svg" />
            <DateBox bedrijfsNaam = "Delhaize" kortBeschrijving = "IT-Team" logoURL = "https://cdn.freebiesupply.com/logos/large/2x/delhaize-1-logo-png-transparent.png" />
            <DateBox bedrijfsNaam = "Combell" kortBeschrijving = "Hosting" logoURL = "https://s3-eu-west-1.amazonaws.com/tpd/logos/58d12fdc0000ff00059eea8f/0x0.png" />
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
    paddingVertical: 10, 
  },
  container: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    flex: 1, 
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
