import { Image } from 'expo-image';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, useColorScheme } from 'react-native';
import { ValidateToken } from './(tabs)/account';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface SpeedDate {
  id: string;
  naam_bedrijf: string;
  sector_bedrijf?: string;
  profiel_foto_bedrijf: string;
  lokaal: string;
  begin: string;
}

interface SpeedDateWithDate extends SpeedDate {
  beginDate: Date;
}

interface DateBoxProps {
  bedrijfsNaam: string;
  kortBeschrijving: string;
  logoURL: string;
  Lokaal: string;
  Tijdstip: string;
}

export function DateBox({
  bedrijfsNaam,
  kortBeschrijving,
  logoURL,
  Lokaal,
  Tijdstip,
}: DateBoxProps) {
  const d = new Date(Tijdstip);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <ThemedView style={{ paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, borderRadius: 20 }}>
      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: logoURL }}
            style={{ width: 50, height: 50, borderRadius: 10 }}
            contentFit="cover"
            transition={300}
          />
          <ThemedView style={{ paddingLeft: 10 }}>
            <ThemedText type="subtitle" style={{ width: 195 }} adjustsFontSizeToFit numberOfLines={1}>
              {bedrijfsNaam}
            </ThemedText>
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

export default function Screen() {
  const theme = useColorScheme();
  const borderColor = theme === 'dark' ? 'white' : 'black';
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<SpeedDateWithDate[]>([]);

  useEffect(() => {
    navigation.setOptions({ title: 'Dates in afwachting' });
    fetchPendingDates();
  }, [navigation]);

  const fetchPendingDates = async (): Promise<void> => {
    try {
      const token = await ValidateToken();
      const response = await fetch('https://api.ehb-match.me/speeddates/pending', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SpeedDate[] = await response.json();
      const sorted: SpeedDateWithDate[] = data
        .map((item: SpeedDate) => ({
          ...item,
          beginDate: new Date(item.begin),
        }))
        .sort((a: SpeedDateWithDate, b: SpeedDateWithDate) => a.beginDate.getTime() - b.beginDate.getTime());

      setEvents(sorted);
    } catch (error) {
      console.error('Error fetching pending speed dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const grouped: Record<string, SpeedDateWithDate[]> = {}; //TypeSafe Dict
  for (const event of events) {
    const key = event.beginDate.toDateString();
    if (!grouped[key]) {
      grouped[key] = [];
    }
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

  return (
    <ThemedView style={{ flex: 1, alignItems: "center" }}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
          {groupedDates.map((dateKey) => {
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
                  {title}
                </ThemedText>

                {dateGroup.map((date, index) => (
                  <ThemedView key={date.id || `${dateKey}-${index}`} style={{ borderRadius: 10 }}>
                    <DateBox
                      bedrijfsNaam={date.naam_bedrijf}
                      kortBeschrijving={date.sector_bedrijf || 'Geen sector opgegeven'}
                      logoURL={date.profiel_foto_bedrijf}
                      Lokaal={date.lokaal}
                      Tijdstip={date.begin}
                    />
                  </ThemedView>
                ))}
              </ThemedView>
            );
          })}
        </ScrollView>
      )}
    </ThemedView>
  );
}