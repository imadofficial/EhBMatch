import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, StyleSheet, TextInput, TouchableHighlight, TouchableOpacity, useColorScheme } from 'react-native';

import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import {
  BottomSheetModal,
  BottomSheetView
} from '@gorhom/bottom-sheet';


async function save(key: string, value: any) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

async function getKeyValueStore(key: string, defaultval: any) {
  try {
    const result = await SecureStore.getItemAsync(key);
    if (result) {
      return JSON.parse(result);
    } else {
      await save(key, defaultval);
      return defaultval;
    }
  } catch (error) {
    console.error('Error retrieving from SecureStore:', error);
    return defaultval;
  }
} 


const getStudentInfo = async () => {
  try {
    const response = await fetch('https://api.ehb-match.me/auth/info', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: "Bearer " + await ValidateToken()
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

function LoginMessage() {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
      console.log('handleSheetChanges', index);
    }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const StartAuth = async () => {
    setIsLoading(true);
    setMessage('');

    fetch('https://api.ehb-match.me/auth/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'EhBMatch/Mobile',
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
    })
    .then(response => {
      if (!response.ok) {
        setIsLoading(false);
        setMessage("Login gegevens incorrect.")
      }
      return response.json();
    })
    .then(async data => {
      setIsLoading(false);
      console.log('Parsed response:', data);
      const unixAccessToken = Math.floor(new Date(data["accessTokenExpiresAt"]).getTime() / 1000);
      const unixRefreshToken = Math.floor(new Date(data["refreshTokenExpiresAt"]).getTime() / 1000);

      save("Token", {
        "accessToken": data["accessToken"],
        "accessTokenExpiration": unixAccessToken,

        "refreshToken": data["refreshToken"],
        "refreshTokenExpiration": unixRefreshToken
      })

      const tokenData = await getKeyValueStore("Token", "{}");
      console.log('Retrieved token data:', tokenData);
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
  };

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
      backgroundStyle={{ backgroundColor: colorScheme === 'dark' ? '#23201E' : '#F1EFEB' }}
      handleIndicatorStyle={{ backgroundColor: 'gray' }}
    >
      <BottomSheetView style={[
        styles.contentContainer,
        { backgroundColor: colorScheme === 'dark' ? '#23201E' : '#F1EFEB' },
        sheets.confirmPadding
      ]}>
        <ThemedView style={{ backgroundColor: colorScheme === 'dark' ? '#23201E' : '#F1EFEB' }}>
          <ThemedText type="title">Log in</ThemedText>
          <ThemedText>Join the network by logging in.</ThemedText>

          <TextInput
            style={[sheets.input, {backgroundColor: '#F1EFEB'}]}
            placeholder="E-Mail"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={[sheets.input, {backgroundColor: '#F1EFEB'}]}
            placeholder="Password"
            keyboardType="email-address"
            secureTextEntry={true}
            autoComplete="current-password"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, { marginTop: 20, marginHorizontal: 10 }]}
            onPress={StartAuth}
            accessibilityLabel="Login button"
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? "Logging in..." : "Inloggen"}
            </ThemedText>      
          </TouchableOpacity>

          <ThemedText style={styles.buttonText}>
            {message}
          </ThemedText> 

        </ThemedView>
      </BottomSheetView>
    </BottomSheetModal>

    </ThemedView>
  );
}

export function AccountDetails({ voornaam, achternaam, pfp, email, linkedin }: AccountDetails) {
  const logOut = async () => {
    console.log("Uitloggen...")
    save("Token", "WholeLoadaShit");
  }
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

        <ThemedView>
          <TouchableOpacity
            style={[styles.button, { marginTop: 20 }]}
            onPress={logOut}
            accessibilityLabel="Uitlog knop"
          >
            <ThemedText style={styles.buttonText}>Uitloggen</ThemedText>
          </TouchableOpacity>
          </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

export async function ValidateToken() {
  console.log("Starting Verification...")
  const key = await getKeyValueStore("Token", "WholeLoadaShit");
  const unixTime = Math.floor(new Date().getTime() / 1000);

  if (key["accessTokenExpiration"] > unixTime) {
    console.log(`Verification Complete: ${key["accessToken"]}`)
    return key["accessToken"];
  } else if (key["accessTokenExpiration"] < unixTime) {
    try {
      console.log(key["refreshToken"]);
      const response = await fetch('https://api.ehb-match.me/auth/refresh', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cookie': `refreshToken=${key["refreshToken"]}`,
        },
        body: JSON.stringify({
          
        }),
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Parsed response:', data);
      
      const unixAccessToken = Math.floor(new Date(data["accessTokenExpiresAt"]).getTime() / 1000);
      const unixRefreshToken = Math.floor(new Date(key["refreshTokenExpiresAt"]).getTime() / 1000);

      await save("Token", {
        "accessToken": data["accessToken"],
        "accessTokenExpiration": unixAccessToken,
        "refreshToken": key["refreshToken"],
        "refreshTokenExpiration": unixRefreshToken
      });

      const tokenData = await getKeyValueStore("Token", "{}");
      
      console.log(`Verification Complete: ${tokenData["accessToken"]}`)
      return tokenData["accessToken"];
      
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }else if (key["refreshTokenExpiration"] < unixTime) {
    console.log("Token is reset. Please log in again.");
    await save("Token", "WholeLoadaShit");
  }
}

export default function AccountScreen() {
  
const useTokenListener = () => {
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const checkToken = async () => {
      const currentToken = await getKeyValueStore("Token", "WholeLoadaShit");
      setToken(currentToken);
    };
    
    checkToken();
    const interval = setInterval(checkToken, 1000); // Check every second
    
    return () => clearInterval(interval);
  }, []);
  
  return token;
};

const token = useTokenListener();
const [studentFetched, setStudentFetched] = useState(false);

useEffect(() => {
  const fetchStudent = async () => {
    try {
      const student = await getStudentInfo();
      if (student) {
        setVoornaam(student["voornaam"]);
        setAchternaam(student["achternaam"]);
        setEmail(student["email"]);
        setPfp(student["profielfoto"]);
        setLinkedin(student["linkedin"]);
        setStudentFetched(true);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  const checkTokenAvailability = async () => {
    if (token == "WholeLoadaShit") {
      isLoggedIn(false);
    } else {
      isLoggedIn(true);
      if (!studentFetched) {
        await fetchStudent();
      }
    }
  };

  if (token !== null) {
    checkTokenAvailability();
  }
}, [token, studentFetched]);

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
