import { Image } from 'expo-image';
import { ActivityIndicator, Dimensions, RefreshControl, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Float, Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { ValidateToken } from './account';

const screenHeight = Dimensions.get('window').height;

export function DateBox({ bedrijfsNaam, kortBeschrijving, logoURL, matchScore }: { bedrijfsNaam: string, kortBeschrijving: string, logoURL: string, matchScore: Float }) {
  const colorScheme = useColorScheme();

  let color;
  switch (true) {
  case (matchScore >= 0 && matchScore <= 20):
    color = 'red';
    break;
  case (matchScore > 20 && matchScore <= 50):
    color = 'orange';
    break;
  default:
    color = 'lime';
}


  return (
    <ThemedView style={{ paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, borderRadius: 20,     borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', borderBottomWidth: 1 }}>
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
          <ThemedText type="subtitle" adjustsFontSizeToFit numberOfLines={1} style={{ width: 160}}>
            {bedrijfsNaam}
          </ThemedText>
            <ThemedText type="defaultSemiBold">{kortBeschrijving}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={{ alignItems: 'flex-end' }}>
          <ThemedView style={{ height: 30, width: 60, backgroundColor: color, borderRadius: 100, alignItems: "center", justifyContent: "center"}}>
            <ThemedText type="subtitle" adjustsFontSizeToFit numberOfLines={1}>{Math.round(matchScore)}%</ThemedText>
          </ThemedView>

          <ThemedText type="defaultSemiBold">Match Score</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const HEADER_HEIGHT = 90;

export default function HomeScreen() {
  const [bedrijven, setBedrijven] = useState([]);
  const [selectedBedrijf, setSelectedBedrijf] = useState(0);
  const [bedrijfsNaam, setBedrijfsnaam] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, isLoading] = useState(true);

  const router = useRouter();
  const colorScheme = useColorScheme();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleDismissal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);
  const snapPoints = useMemo(() => ['36%'], []);
  
  const [companyData, setCompanyData] = useState([]); //functie
  const [opleidingData, setOpleidingData] = useState([]);
  const [technischeKennis, setTechnischeKennis] = useState([]);
  const [loginConfirmed, setLoginConfirmed] = useState(false);

  const getCompanyData = async (companyID: Int32, endpoint: string) => {
    try {
      const token = await ValidateToken();
      const response = await fetch(`https://api.ehb-match.me/bedrijven/${companyID}/${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log(data)
      return data
    } catch (error) {
        console.log('Error fetching data:', error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!selectedBedrijf) return;
      const data = await getCompanyData(selectedBedrijf, 'functies');
      const opleiding = await getCompanyData(selectedBedrijf, 'opleidingen');
      const technischeKennis = await getCompanyData(selectedBedrijf, 'skills');
      setCompanyData(data);
      setOpleidingData(opleiding["opleidingen"])
      setTechnischeKennis(technischeKennis)
    }

    fetchData();
  }, [selectedBedrijf]);

  const fetchData = useCallback(async () => {
    isLoading(true)
    try {
      const token = await ValidateToken();
      const response = await fetch('https://api.ehb-match.me/discover/bedrijven?onlyNew=false', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setBedrijven(data);
      setLoginConfirmed(true)
    } catch (error) {
      setLoginConfirmed(false)
      console.log('Error fetching data:', error);
    }

    isLoading(false)
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [])
  );

  const onRefresh = useCallback(async () => {
    console.log("Refreshing...")
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView
        style={[
          styles.headerContainer,
          {
            height: HEADER_HEIGHT,
            backgroundColor:
              colorScheme === 'dark'
                ? 'rgba(20,20,20,0.95)'
                : 'rgba(255,255,255,0.95)',
          },
        ]}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Match</ThemedText>
          <ThemedText type="subtitle">Je bedrijf!</ThemedText>
        </ThemedView>

        <ThemedView style={styles.loaderContainer}>
          <ActivityIndicator
            size="small"
            color={colorScheme === 'dark' ? '#fff' : '#000'}
            style={{opacity:
              loading === false
                ? 0
                : 1,}}
          />
        </ThemedView>
      </ThemedView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
          />
        }
      >
        <ThemedView>
          <ThemedView style={DateBoxStyles.container}>
            <ThemedView style={[DateBoxStyles.marginWithBox]}>
              {bedrijven.map((info, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    handlePresentModalPress();
                    setSelectedBedrijf(info["gebruiker_id"]);
                    setBedrijfsnaam(info["naam"]);
                  }}
                >
                  <DateBox
                    bedrijfsNaam={info["naam"]}
                    kortBeschrijving={info["plaats"]}
                    logoURL={info["profiel_foto_url"]}
                    matchScore={parseFloat(info["match_percentage"])}
                  />
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>

          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={snapPoints}
            backdropComponent={(props) => (
              <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
              />
            )}
            backgroundStyle={{
              backgroundColor: colorScheme === 'dark' ? '#23201E' : '#F1EFEB',
            }}
            handleIndicatorStyle={{ backgroundColor: 'gray' }}
          >
            <BottomSheetView
              style={{
                backgroundColor:
                  colorScheme === 'dark' ? '#23201E' : '#F1EFEB',
              }}
            >
              <ThemedView
                style={{
                  backgroundColor:
                    colorScheme === 'dark' ? '#23201E' : '#F1EFEB',
                  paddingHorizontal: 25,
                }}
              >
                <ThemedText type="title" adjustsFontSizeToFit numberOfLines={1}>
                  {bedrijfsNaam}
                </ThemedText>
                <ThemedText>Wat wil je doen met dit bedrijf?</ThemedText>

              <View style={{ alignItems: 'center', paddingTop: 15 }}>
                  <ThemedText style={{ textAlign: 'center', fontSize: 21, fontWeight: '700' }}>
                    Functie
                  </ThemedText>

                <View style={{ flexDirection: 'row' }}>
                  {companyData && companyData.length > 0 ? (
                    companyData.map((item, index) => (
                      <ThemedText key={index} style={{ marginBottom: 8, paddingHorizontal: 5 }}>
                        {item["naam"]}
                      </ThemedText>
                    ))
                  ) : (
                    <ActivityIndicator />
                  )}
                </View>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'center', }}>
                <View style={{ alignItems: 'center', paddingTop: 15 }}>
                  
                    <ThemedText style={{ textAlign: 'center', fontSize: 21, fontWeight: '700' }}>
                      Opleidingen
                    </ThemedText>

                  <View style={{ flexDirection: 'row' }}>
                    {opleidingData && opleidingData.length > 0 ? (
                      opleidingData.map((item, index) => (
                        <ThemedText key={index} style={{ marginBottom: 8, paddingHorizontal: 5 }}>
                          {item["naam"]}
                        </ThemedText>
                      ))
                    ) : (
                      <ActivityIndicator />
                    )}
                  </View>
                </View>

                <View style={{ alignItems: 'center', paddingTop: 15, paddingLeft: 15 }}>
                    <ThemedText style={{ textAlign: 'center', fontSize: 21, fontWeight: '700' }}>
                      Skills
                    </ThemedText>

                  <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    {technischeKennis && technischeKennis.length > 0 ? (
                      technischeKennis.map((item, index) => (
                        <ThemedText key={index} style={{ marginBottom: 8, paddingHorizontal: 5 }}>
                          {item["naam"]}
                        </ThemedText>
                      ))
                    ) : (
                      <ActivityIndicator />
                    )}
                  </View>
                </View>
              </View>


                <ThemedView
                  style={{
                    backgroundColor:
                      colorScheme === 'dark' ? '#23201E' : '#F1EFEB',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    paddingBottom: 30,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: '/dateAfspraak',
                        params: {
                          bedrijfID: selectedBedrijf,
                          bedrijfNaam: bedrijfsNaam
                        },
                      });
                      handleDismissal();
                    }}
                    style={{
                      backgroundColor: '#007AFF',
                      paddingVertical: 12,
                      borderRadius: 8,
                      marginTop: 16,
                      alignItems: 'center',
                    }}
                    accessibilityLabel="Blauw afspraak aanmaak knop"
                  >
                    <Text style={{ color: 'white' }}>Afspraak maken</Text>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </BottomSheetView>
          </BottomSheetModal>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

export function LoginError(){
  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 20, borderRadius: 20 }}>
      <ThemedText type="subtitle">U bent momenteel niet ingelogd. Log in en probeer het opnieuw.</ThemedText>
    </ThemedView>
    )
}

const DateBoxStyles = StyleSheet.create({
  BoxDesign: {
    borderWidth: 1,
    borderRadius: 19,
    paddingVertical: 10
  },
  container: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    flex: 1,
  },
  marginWithBox: {
    marginTop: 140,
    width: 370,
  }
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

