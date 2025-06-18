import { Image } from 'expo-image';
import { ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { ValidateToken } from './(tabs)/account';

const screenHeight = Dimensions.get('window').height;

interface SpeedDate {
  id: string;
  naam_bedrijf: string;
  sector_bedrijf?: string;
  profiel_foto_bedrijf: string;
  lokaal: string;
  begin: string;
}

export function DateBox({ bedrijfsNaam, kortBeschrijving, logoURL, Lokaal, Tijdstip }: { bedrijfsNaam: string, kortBeschrijving: string, logoURL: string, Lokaal: string, Tijdstip: string }) {
  var d = new Date(Tijdstip);
  var time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
            <ThemedText type="subtitle" style={{width: 195}} adjustsFontSizeToFit numberOfLines={1} >{bedrijfsNaam}</ThemedText>
            <ThemedText type="defaultSemiBold">{kortBeschrijving}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={{ alignItems: 'flex-end' }}>
          <ThemedText type="subtitle">{time}</ThemedText>
          <ThemedText type="defaultSemiBold">{Lokaal}</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

export default function HomeScreen() {
  const [pendingSpeedDate, setPendingSpeedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { speedDates } = useLocalSearchParams();
  const theme = useColorScheme();
  const borderColor = theme === 'dark' ? 'white' : 'black';

  useEffect(() => {
    navigation.setOptions({ title: 'Je planning' });
  }, []);

  const fetchData = async () => {
      try {
        const token = await ValidateToken();
        const response = await fetch(
          'https://api.ehb-match.me/speeddates/pending',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        setPendingSpeedDates(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [])
  );

  useEffect(() => {
    fetchData();
  }, []);

  const events = speedDates
    ? JSON.parse(speedDates as string)
        .map((item: any) => {
          return {
            ...item,
            beginDate: new Date(item.begin),
          };
        })
        .sort((a: any, b: any) => a.beginDate.getTime() - b.beginDate.getTime())
    : [];

  const grouped: Record<string, any[]> = {};
  for (const event of events) {
    const key = event.beginDate.toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }

  const groupedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <ThemedView>
          <ThemedView style={DateBoxStyles["container"]}>
            <TouchableOpacity
                onPress={() => 
                  router.push({
                    pathname: "./inAfwachting",
                    params: {
                      pendingDates: JSON.stringify(pendingSpeedDate)
                     },
                  })
              }>
              <ThemedView
                style={[
                  DateBoxStyles["BoxDesign"],
                  { borderColor, backgroundColor: 'orange' },
                ]}
              >
                <ThemedText style={{ textAlign: 'center', color: 'black' }}>
                  Je hebt momenteel {pendingSpeedDate["length"]} dates in afwachting
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={theme === 'dark' ? '#fff' : '#000'}
                style={{ marginTop: 20 }}
              />
            ) : (
              groupedDates.map((dateKey) => {
                const dateGroup = grouped[dateKey];
                const title = formatDate(new Date(dateKey));

                return (
                  <ThemedView style={{ borderRadius: 20, width: 380 }} key={dateKey}>
                    <ThemedText
                      style={{
                        marginLeft: 20,
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginBottom: 10,
                        marginTop: 20,
                      }}
                    >
                      { title }
                    </ThemedText>

                    {dateGroup.map((date, index) => (
                      <ThemedView key={date["id"] || index} style={{ borderRadius: 10 }}>
                        <DateBox
                          bedrijfsNaam={date["naam_bedrijf"]}
                          kortBeschrijving={date["sector_bedrijf"] || 'Geen sector opgegeven'}
                          logoURL={date["profiel_foto_bedrijf"]}
                          Lokaal={date["lokaal"]}
                          Tijdstip={date["begin"]}
                        />
                      </ThemedView>
                    ))}
                  </ThemedView>
                );
              })
            )}
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

