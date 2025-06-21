import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ValidateToken } from './(tabs)/account';

type SpeeddatesSlot = {
  begin: string;
  einde: string;
  id: number;
};

const formatDateTime = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const screenOptions = {
  title: 'Plan een afspraak in',
};

export function DateBox({ bedrijfsNaam, kortBeschrijving }: { bedrijfsNaam: string, kortBeschrijving: string }) {
  const colorScheme = useColorScheme();
  const formattedStart = new Date(bedrijfsNaam);
  const localTime = formattedStart.toLocaleTimeString('en-US', {
  timeZone: 'Europe/Brussels',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
  return (
    <ThemedView style={{ paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, borderRadius: 20, borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', borderBottomWidth: 1 }}>
      <ThemedView
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ThemedView style={{ paddingLeft: 10 }}>
          <ThemedText type="subtitle" adjustsFontSizeToFit numberOfLines={1} style={{ width: 160}}>
            {localTime}
          </ThemedText>
            <ThemedText type="defaultSemiBold">tot {kortBeschrijving}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}


export default function HomeScreen() {
  const navigation = useNavigation();

  const theme = useColorScheme();
  const borderColor = theme === 'dark' ? 'white' : 'black';
  const roundedcornerBorderColor = theme === 'dark' ? 'white' : 'black';

  const dropDowncolors = theme === 'dark' ? '#272727' : '#eee';
  const dropDownBordercolors = theme === 'dark' ? 'gray' : '#ccc';


  const { bedrijfID, bedrijfNaam } = useLocalSearchParams<{ bedrijfID: string, bedrijfNaam: string }>();
  console.log(bedrijfNaam, bedrijfID);
  const router = useRouter();

  const [speeddates, setSpeeddates] = useState<SpeeddatesSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [dateDropdownVisible, setDateDropdownVisible] = useState(false);
  const [timeDropdownVisible, setTimeDropdownVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: "Maak afspraak aan" });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await ValidateToken();
        const response = await fetch(
          `https://api.ehb-match.me/speeddates/user/${bedrijfID}/available`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data: SpeeddatesSlot[] = await response.json();
        setSpeeddates(data);
        console.log(data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [bedrijfID]);

  const formatDate = (iso: string) => new Date(iso).toISOString().split('T')[0];
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const uniqueDates = Array.from(
    new Set(speeddates.map((slot) => formatDate(slot.begin)))
  );

  const timesForDate = speeddates
    .filter((slot) => formatDate(slot.begin) === selectedDate)
    .map((slot) => formatTime(slot.begin));

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Selectie incompleet', 'Selecteer zowel datum als tijd.');
      return;
    }

    const combinedDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const matchingSlot = speeddates.find(
      (slot) => new Date(slot.begin).toISOString() === combinedDateTime.toISOString()
    );

    if (!matchingSlot) {
      Alert.alert('Ongeldig slot', 'Dit slot is niet beschikbaar.');
      return;
    }

    try {
      const token = await ValidateToken();
      console.log("Tijd: " + formatDateTime(combinedDateTime))
      const response = await fetch(`https://api.ehb-match.me/speeddates/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_bedrijf: bedrijfID,
          datum: formatDateTime(combinedDateTime),
        }),
      });

      
      if (!response.ok) throw new Error('Server error.');

      Alert.alert('Afspraak gemaakt', 'Wacht op goedkeuring van het bedrijf.');
      router.back();
    } catch (err) {
      Alert.alert('Fout', 'Kon afspraak niet maken: Al ingenomen door een ander gebruiker.');
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        <ThemedView style={[styles.box, { borderColor }]}>
          <ThemedText style={styles.title}>
            Afspraak met
          </ThemedText>
          <ThemedText style={[styles.title, {fontSize: 22}]}>
            {bedrijfNaam}
          </ThemedText>

        <ThemedView>
          <TouchableOpacity
            style={[styles.dropdown, {borderColor: roundedcornerBorderColor}]}
            onPress={() => setDateDropdownVisible(!dateDropdownVisible)}
          >
            <ThemedText>
              {selectedDate ?? 'Selecteer een datum'}
            </ThemedText>
          </TouchableOpacity>
          {dateDropdownVisible &&
            uniqueDates.map((date) => (
              <TouchableOpacity
                key={date}
                style={[styles.dropdownOption, { backgroundColor: dropDowncolors, borderColor: dropDownBordercolors }]}
                onPress={() => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                  setDateDropdownVisible(false);
                }}
              >
                <ThemedText style={{color: borderColor}}>{date}</ThemedText>
              </TouchableOpacity>
            ))}

          {selectedDate && (
            <ThemedView>
              <TouchableOpacity
                style={[styles.dropdown, {borderColor: roundedcornerBorderColor}]}
                onPress={() => setTimeDropdownVisible(!timeDropdownVisible)}
              >
                <ThemedText>
                  {selectedTime ?? 'Selecteer een tijd'}
                </ThemedText>
              </TouchableOpacity>
              {timeDropdownVisible &&
                timesForDate.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.dropdownOption, { backgroundColor: dropDowncolors, borderColor: dropDownBordercolors }]}
                    onPress={() => {
                      setSelectedTime(time);
                      setTimeDropdownVisible(false);
                    }}
                  >
                    <ThemedText style={{color: borderColor}}>{time}</ThemedText>
                  </TouchableOpacity>
                ))}
            </ThemedView>
          )}
          </ThemedView>

          <View style={{ marginTop: 10 }}>
            <Button title="Reserveer afspraak" onPress={handleSubmit} />
          </View>
        </ThemedView>
      </ScrollView>

      <ThemedView style={{paddingHorizontal: 20, paddingBottom: 30}}>
        <ThemedText style={{color: borderColor, textAlign: 'center', opacity: 0.65, fontSize: 14}}>Door een afspraak te maken, accepteer je onze voorwaarden & dat Groep 2 op de 2e plaats is.</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const DateBoxStyles = StyleSheet.create({
  BoxDesign: {
    borderWidth: 0,
    borderRadius: 19,
    width: 350,
    paddingVertical: 10,
  },
  container: {
    alignItems: 'center',
    marginTop: 0,
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
  box: {
    borderWidth: 0,
    borderRadius: 10,
    padding: 15,
    marginTop: 0,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  dropdown: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
  },
});

