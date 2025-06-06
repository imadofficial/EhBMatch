import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';
import { Linking, StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, useColorScheme } from 'react-native';

import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import {
  BottomSheetModal,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';


async function save(key: string, value: any) {
  await SecureStore.setItemAsync(key, value);
}

async function getKeyValueStore(key: string, defaultval: any) {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
    return result;
  } else {
    save(key,defaultval);
    result = await SecureStore.getItemAsync(key);
    return result
  }
}

const getStudentInfo = async () => {
  try {
    const response = await fetch('https://api.ehb-match.me//studenten/0', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer 1234',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch student info:', error);
    return null;
  }
};

const openLinkedInProfile = async (username: String) => {
  const appUrl = 'linkedin://in' + username; // This may not always work
  const webUrl = 'https://www.linkedin.com/in' + username;

  const supported = await Linking.canOpenURL(appUrl);

  if (supported) {
    Linking.openURL(appUrl);
  } else {
    Linking.openURL(webUrl);
  }
};

type AccountDetails = {
  voornaam: string;
  achternaam: string;
  pfp: string;
  email: string;
  linkedin: string;
};

const Page = () => {
    const snapPoints = useMemo(() => ['70%'], []);
}

export function LoginMessage() {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
      console.log('handleSheetChanges', index);
    }, []);

    const colorScheme = useColorScheme();
    const snapPoints = useMemo(() => ['90%'], []);

  return (
    <ThemedView>
      <ThemedView style={styles.VStack}>
        <ThemedText type="title">Niet ingelogd!</ThemedText>
        <ThemedText>
          U bent momenteel niet ingelogd. Log in om de volledige featureset van deze app te gebruiken.
        </ThemedText>

        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={handlePresentModalPress}
          accessibilityLabel="Login button"
        >
          <ThemedText style={styles.buttonText}>Inloggen</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} accessibilityLabel="Register button">
          <ThemedText style={styles.buttonText}>Registreren</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      onChange={handleSheetChanges}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: colorScheme === 'dark' ? '#151718' : '#FFFFFF' }}
      handleIndicatorStyle={{ backgroundColor: 'gray' }}
    >
      <BottomSheetView style={[
        styles.contentContainer,
        { backgroundColor: colorScheme === 'dark' ? '#151718' : '#FFFFFF' },
        sheets.confirmPadding
      ]}>
        <ThemedView>
          <ThemedText type="title">Log in</ThemedText>
          <ThemedText>Join the network by logging in.</ThemedText>

          <TextInput
            style={sheets.input}
            placeholder="useless placeholder"
            keyboardType="numeric"
          />
        </ThemedView>
      </BottomSheetView>
    </BottomSheetModal>

    </ThemedView>
  );
}

export function AccountDetails({ voornaam, achternaam, pfp, email, linkedin }: AccountDetails) {
  return(
    <ThemedView>
      <ThemedView style={styles.titleContainer}>
        <TouchableHighlight>
          <Image source={{ uri: pfp }} style={styles.profileImg} />
        </TouchableHighlight>

        <ThemedView style={styles.VStack}>
          <ThemedText type="title">{voornaam} {achternaam}</ThemedText>
          <ThemedText>Erasmus Hogeschool Brussel</ThemedText>
          <ThemedText style={{opacity: 0.5}}>Student • 1TI</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedView style={styles.sectionRow}>
          <ThemedView style={styles.rowLeft}>
            <IconSymbol name="figure.child" color="#8e8e93" style={styles.icon} />
            <ThemedText style={styles.sectionText}>Geboortedatum</ThemedText>
          </ThemedView>
          <ThemedText style={styles.sectionValue}>18/03/2005</ThemedText>
        </ThemedView>

        <ThemedView style={styles.sectionRow}>
          <ThemedView style={styles.rowLeft}>
            <IconSymbol name="envelope" color="#8e8e93" style={styles.icon} />
            <ThemedText style={styles.sectionText}>E-mail</ThemedText>
          </ThemedView>
          <ThemedText style={styles.sectionValue}>{email}</ThemedText>
        </ThemedView>

        <TouchableOpacity onPress={() => {
          console.log('Opening Linkedin...');
          openLinkedInProfile(linkedin);
        }} activeOpacity={0.7}>
          <ThemedView style={styles.sectionRow}>
            <ThemedView style={styles.rowLeft}>
              <IconSymbol name="link" color="#8e8e93" style={styles.icon} />
              <ThemedText style={styles.sectionText}>LinkedIn Gekoppeld?</ThemedText>
            </ThemedView>
            <ThemedText style={styles.sectionValue}>Nee</ThemedText>
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}


export default function AccountScreen() {

  useEffect(() => {
    const fetchStudent = async () => {
      const student = await getStudentInfo();
      if (student) {
        setVoornaam(student["voornaam"]);
        setAchternaam(student["achternaam"]);
        setEmail(student["email"]);
        setPfp(student["profielfoto"]);
        setLinkedin(student["linkedin"]);
      }
    };

    const checkTokenAvailability = async () => {
      const Token = await getKeyValueStore("Token", "WholeLoadaShit")
      if(Token == "WholeLoadaShit"){
        isLoggedIn(false);
      }
    }

    fetchStudent();
    checkTokenAvailability();
  }, []);

  const [voornaam, setVoornaam] = useState('');
  const [achternaam, setAchternaam] = useState('');
  const [email, setEmail] = useState('');
  const [pfp, setPfp] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [loggedIn, isLoggedIn] = useState(false); //Switch naar true als de gebruiker effectief ingelogd is.

  if(loggedIn == false){
      
  }
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name='person.fill'
          style={styles.headerImage}
        />
      }>
      {loggedIn ? (
        <AccountDetails voornaam={voornaam} achternaam={achternaam} email={email} pfp={pfp} linkedin={linkedin} />
      ) : (
        <LoginMessage />
      )}

      
      <ThemedText style={{ textAlign: 'center', fontSize: 15, opacity: 0.9 }}>
        Onze{' '}
        <ExternalLink href="https://example.com/gebruiksvoorwaarden" style={{ color: '#007bff' }}>
          gebruiksvoorwaarden
        </ExternalLink>{' '}
        &{' '}
        <ExternalLink href={"https://example.com/gdpr"} style={{ color: '#007bff' }}>
          GDPR-wetten
        </ExternalLink>{' '}
        zijn van toepassing.
      </ThemedText>
    </ParallaxScrollView> 
  );
}

const sheets = StyleSheet.create({
  confirmPadding:{
    padding: 30
  },
  input: {
    height: 60,
    margin: 10,
    width: 350,
    borderWidth: 1,
    padding: 15,
    borderRadius: 10
  },
})

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -20,
    position: 'absolute',
  },
  smallImage : {
    marginRight: 8,
    width: 20,
    height: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  profileImg: {
    height: 80,
    width: 80,
    borderRadius: 40,
  },
  VStack: {
    flexDirection: 'column',
    justifyContent: 'center'
  },
  HStack: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  BlockStart: {
    backgroundColor: '#242524',
    height: 45,
    borderStartEndRadius: 10,
    borderStartStartRadius: 10,
    justifyContent: 'center',
  },
  BlockMid: {
    backgroundColor: '#242524',
    height: 45,
    justifyContent: 'center',
  },
  BlockEnd: {
    backgroundColor: '#242524',
    height: 45,
    borderEndEndRadius: 10,
    borderEndStartRadius: 10,
    justifyContent: 'center',
  },
  BlockEmbeddedText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  screen: {
    flex: 1,
    backgroundColor: '#1c1c1e', // iOS dark gray
    padding: 16,
  },
  sectionRowLast: {
    borderBottomWidth: 0,
  },
  icon: {
    marginRight: 16,
    fontSize: 20,
  },
  sectionText: {
    fontSize: 16,
    backgroundColor: 'transparent'
  },
  sectionContainer: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // align left/right
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a3a3c',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // optional, if your RN version supports it
  },
  sectionValue: {
    fontSize: 16,
    color: '#8e8e93',
    backgroundColor: 'transparent'
  },
  button: {
    backgroundColor: '#3b82f6', // blue-ish background
    borderRadius: 10,
    paddingVertical: 15,   // makes button taller
    paddingHorizontal: 40, // makes button wider
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18, // larger text
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  }
});
