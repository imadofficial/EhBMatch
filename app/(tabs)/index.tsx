import { Image } from 'expo-image';
import { ActivityIndicator, Dimensions, RefreshControl, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { getKeyValueStore, ValidateToken } from './account';

import { getUserID } from './account';

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
    <ThemedView style={{ paddingTop: 10, paddingBottom: 10, borderRadius: 20 }}>
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
            <ThemedText type="subtitle" style={{width: 220}} adjustsFontSizeToFit numberOfLines={1} >{bedrijfsNaam}</ThemedText>
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

export const syncToken = async (Token: string) => {
  try {
    const userID = await getUserID();
    console.log(userID);
        
    if(userID != null){
      const response = await fetch("https://school.raven.co.com/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userID,
          token: Token,
        }),
      });

      if(response.ok){
        console.log("Token synced Successfully")
      }else{
        console.log(`Token wasn't updated: ${Token}`)
      }

      console.log(await response.text())
    }
  } catch (error) {
    console.log("Error fetching data:", error);
  }
};

const HEADER_HEIGHT = 90;

export function LoginError(){
  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 20, borderRadius: 20 }}>
      <ThemedText type="subtitle">U bent momenteel niet ingelogd. Log in en probeer het opnieuw.</ThemedText>
    </ThemedView>
    )
}

export default function planningScreen() {
  const router = useRouter();
  const [speeddates, setSpeeddates] = useState<SpeedDate[]>([]);
  const [loginConfirmed, setLoginConfirmed] = useState(false);
  const [loading, isLoading] = useState(true);
  const [pendingSpeedDate, setPendingSpeedDates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const key = await getKeyValueStore("Token", "WholeLoadaShit");

      if (key === "WholeLoadaShit") {
        //console.log("Token still invalid, retrying in 1 second...");
        setLoginConfirmed(false);
        setTimeout(fetchData, 1000);
        return;
      }

      const token = await ValidateToken();
      if (token === "WholeLoadaShit") {
        //console.log("Token still invalid, retrying in 1 second...");
        setLoginConfirmed(false);
        setTimeout(fetchData, 1000);
        return;
      }

      const response = await fetch("https://api.ehb-match.me/speeddates/accepted", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setSpeeddates(data);
      setLoginConfirmed(true);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };


const fetchPending = async () => {
  try {
    const token = await ValidateToken();
    const response = await fetch('https://api.ehb-match.me/speeddates/pending', {
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
    console.error('Error fetching pending data:', error);
  }
};

  useEffect(() => {
    isLoading(true);
    
    const init = async () => {
      await fetchData();
      await fetchPending();
      isLoading(false);
    };

    init();

    // No interval needed
  }, []);


  const onRefresh = useCallback(async () => {
    console.log("Refreshing...");
    isLoading(true);
    await fetchData();
    isLoading(false);
  }, []);

  const theme = useColorScheme();
  
  const borderColor = theme === "dark" ? "white" : "black";
  const colorScheme = useColorScheme();

  const events = speeddates.map((date) => ({
      ...date,
      beginDate: new Date(date.begin),
    })).sort((a, b) => a.beginDate.getTime() - b.beginDate.getTime());

  const grouped: Record<string, SpeedDate[]> = {};
  for (const event of events) {
    const key = event.beginDate.toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }

  const groupedDates = Object.keys(grouped)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const formatDate = (date: Date): string => date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
    
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView
        style={[
          styles.headerContainer,
          {
            height: HEADER_HEIGHT,
            backgroundColor:
              theme === "dark"
                ? "rgba(20,20,20,0.95)"
                : "rgba(255,255,255,0.95)",
          },
        ]}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welkom!</ThemedText>
          <ThemedText type="subtitle">Zo ziet je kalender eruit!</ThemedText>
        </ThemedView>

        <ThemedView style={styles.loaderContainer}>
          <ActivityIndicator
            size="small"
            color={theme === "dark" ? "#fff" : "#000"}
            style={{opacity:
              loading === false
                ? 0
                : 1,}}
          />
        </ThemedView>
      </ThemedView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 70 }} refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#007AFF']}
                  tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
                />
              }>
        <ThemedView>
          <ThemedView style={DateBoxStyles.container}>
            <ThemedView style={[DateBoxStyles.BoxDesign, { borderColor }]}>

              <ThemedView style={{}}>
                <TouchableOpacity
                  onPress={() => 
                    router.push({
                      pathname: "./inAfwachting",
                        params: {
                          pendingDates: JSON.stringify(pendingSpeedDate)
                        },
                      })
                    }
                  >
                    <ThemedView
                      style={[
                          DateBoxStyles["BoxDesign"],
                        { borderColor, backgroundColor: 'orange', height: 40, justifyContent: 'center' },
                      ]}
                    >
                    <ThemedText style={{ textAlign: 'center', color: 'black' }}>
                      Je hebt momenteel {pendingSpeedDate["length"]} dates in afwachting
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              </ThemedView>

              {groupedDates.map((dateKey) => {
                const dateGroup = grouped[dateKey];
                const title = formatDate(new Date(dateKey));

                return (
                  <ThemedView style={{ borderRadius: 20}} key={dateKey}>
                    <ThemedText
                      style={{
                        marginLeft: 20,
                        fontSize: 20,
                        fontWeight: "bold",
                        marginBottom: 10,
                        marginTop: 10,
                      }}
                    >
                      {title.charAt(0).toUpperCase() + title.slice(1)}
                    </ThemedText>

                    {dateGroup.map((date, index) => (
                      <ThemedView
                        key={date.id || index}
                        style={{ borderRadius: 10 }}
                      >
                        <DateBox
                          bedrijfsNaam={date.naam_bedrijf}
                          kortBeschrijving={
                            date.sector_bedrijf || "Geen sector opgegeven"
                          }
                          logoURL={date.profiel_foto_bedrijf}
                          Lokaal={date.lokaal}
                          Tijdstip={date.begin}
                        />
                      </ThemedView>
                    ))}
                  </ThemedView>
                );
              })}

            {loginConfirmed == true ? (
              <ThemedView>
                </ThemedView>
              ) : (
                <LoginError />
              )}
              
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const DateBoxStyles = StyleSheet.create({
  BoxDesign: {
    borderWidth: 0,
    borderRadius: 19,
    width: 350,
    marginTop: 75
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
    height: HEADER_HEIGHT,
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

