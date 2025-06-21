import { Picker } from '@react-native-picker/picker';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, useColorScheme, View } from 'react-native';

import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';


async function save(key: string, value: any) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export async function getKeyValueStore(key: string, defaultval: any) {
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

export const getUserID = async () => {
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
    return data["user"]["id"];
  } catch (error) {
    console.log('[ ERROR ]  Failed to fetch student info:', error);
    return null;
  }
};

const openLinkedInProfile = async (username: String) => {
  const appUrl = 'linkedin://' + username; // Only opens if the app is already installed on the device
  const webUrl = 'https://www.linkedin.com' + username;

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
  DoB: string;
  opleiding: string;
  studiejaar: string;
  type: Int32;
};

type Opleidingen = {
  id: number;
  naam: string;
  type: string;
};


function LoginMessage() {
    const bottomSheetRegistrationRef = useRef<BottomSheetModal>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);

    const handlePresentRegistrationPress = useCallback(() => {
      bottomSheetRegistrationRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
    }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [voornaam, setVoornaam] = useState('');
  const [achternaam, setAchternaam] = useState('');
  const [linkedIn, setLinkedin] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [studiejaar, setStudiejaar] = useState(1);
  const [picture, setPicture] = useState('https://winaero.com/blog/wp-content/uploads/2015/05/user-200.png');

  const [DD, setDD] = useState("");
  const [MM, setMM] = useState("");
  const [YYYY, setYYYY] = useState("");


  const [opleidingen, setOpleidingen] = useState<Opleidingen[]>([]);
  const [selectedId, setSelectedId] = useState();
  const [isPickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    const fetchOpleidingen = async () => {
      try {
        const response = await fetch('https://api.ehb-match.me/opleidingen', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          return;
        }

        const data = await response.json();
        setOpleidingen(data);

        console.log('Parsed response:', data);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchOpleidingen();
  }, []); 

  const StartRegistration = async () => {
    try {
      const uploading = await uploadImage(picture);
      if (uploading != null) {
        setPicture(uploading["profiel_foto_key"]);
      }

      const response = await fetch('https://api.ehb-match.me/auth/register/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          voornaam: voornaam,
          achternaam: achternaam,
          linkedin: linkedIn,
          profiel_foto: picture,
          studiejaar: studiejaar,
          opleiding_id: selectedId,
          date_of_birth: `${YYYY}-${MM}-${DD}`
        }),
      });

      const data = await response.json();  // Read response once
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      Alert.alert('Registratie succesvol!', 'Je kunt nu inloggen met je nieuwe account.')
      console.log('Registration successful:', data);

    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const selectpfp = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      setPicture(manipulatedImage.uri);
      console.log('Selected image URI:', manipulatedImage.uri);
    }
  };

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
      }else{
        return response.json();
      }
    })
    .then(async data => {
      setIsLoading(false);
      const unixAccessToken = Math.floor(new Date(data["accessTokenExpiresAt"]).getTime() / 1000);
      const unixRefreshToken = Math.floor(new Date(data["refreshTokenExpiresAt"]).getTime() / 1000);

      save("Token", {
        "accessToken": data["accessToken"],
        "accessTokenExpiration": unixAccessToken,

        "refreshToken": data["refreshToken"],
        "refreshTokenExpiration": unixRefreshToken
      })

      const tokenData = await getKeyValueStore("Token", "{}");
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
  };

  const colorScheme = useColorScheme();
  const snapPoints = useMemo(() => ['90%'], []);

  const uploadImage = async (uri: string) => {
    const filename = uri.split('/').pop() ?? 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    const formData = new FormData();
    formData.append('image', {
      uri,
      name: filename,
      type,
    } as any);

    try {
      const response = await fetch('https://api.ehb-match.me/profielfotos', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Upload failed:', text);
        return;
      }

      const data = await response.json();
      console.log('Upload success:', data);
      return data;
    } catch (error) {
      return null
    }
  };

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
        <TouchableOpacity onPress={handlePresentRegistrationPress} style={styles.button} accessibilityLabel="Register button">
          <ThemedText style={styles.buttonText}>Registreren</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Dit is de login scherm */}
      <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      onChange={handleSheetChanges}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      )}
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
          <ThemedText>Word lid van het netwerk door in te loggen.</ThemedText>

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

      {/* Dit is de registratie scherm */}
      <BottomSheetModal
      ref={bottomSheetRegistrationRef}
      index={1}
      onChange={handleSheetChanges}
      snapPoints={snapPoints}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      )}
      backgroundStyle={{ backgroundColor: colorScheme === 'dark' ? '#23201E' : '#F1EFEB' }}
      handleIndicatorStyle={{ backgroundColor: 'gray' }}
    >
      <BottomSheetView style={[
        styles.contentContainer,
        { backgroundColor: colorScheme === 'dark' ? '#23201E' : '#F1EFEB' },
        sheets.confirmPadding
      ]}>
        <ThemedView style={{ backgroundColor: colorScheme === 'dark' ? '#23201E' : '#F1EFEB' }}>
          <ThemedText type="title">Maak een account aan!</ThemedText>
          <ThemedText>Word lid van het netwerk door aan te melden.</ThemedText>

          <TouchableOpacity
          onPress={selectpfp}
          style={{alignItems: 'center', paddingTop: 10}}
          >
            <Image source={{ uri: picture }} style={styles.profileImg} />
          </TouchableOpacity>
          
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

          <TextInput
            style={[sheets.input, {backgroundColor: '#F1EFEB'}]}
            placeholder="Voornaam"
            keyboardType="email-address"
            autoComplete="email"
            value={voornaam}
            onChangeText={setVoornaam}
          />

          <TextInput
            style={[sheets.input, {backgroundColor: '#F1EFEB'}]}
            placeholder="Achternaam"
            keyboardType="email-address"
            autoComplete="email"
            value={achternaam}
            onChangeText={setAchternaam}
          />

         <View style={{ flexDirection: 'row' }}>
          <TextInput
            style={[sheets.input2, { backgroundColor: '#F1EFEB' }]}
            placeholder="Studiejaar"
            keyboardType="numeric"
            value={studiejaar.toString()}
            onChangeText={text => setStudiejaar(Number(text))}
          />

          <TouchableOpacity
            style={[sheets.input2, { justifyContent: 'center', backgroundColor: '#F1EFEB' }]}
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: selectedId ? '#000' : '#888' }}>
              {selectedId
                ? (() => {
                    const o = opleidingen.find(o => o.id === selectedId);
                    return o ? `${o.naam} (${o.type})` : 'Opleiding';
                  })()
                : 'Opleiding'}
            </Text>
          </TouchableOpacity>

          <Modal
            isVisible={isPickerVisible}
            onBackdropPress={() => setPickerVisible(false)}
            style={{ justifyContent: 'flex-end', margin: 0 }}
          >
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
              <Picker
                selectedValue={selectedId}
                onValueChange={(itemValue) => {
                  setSelectedId(itemValue);
                  setPickerVisible(false);
                }}
              >
                <Picker.Item label="Opleiding" value={undefined} />
                  {opleidingen.map((opleiding) => (
                    <Picker.Item
                      key={opleiding.id}
                      label={`${opleiding.naam} (${opleiding.type})`}
                      value={opleiding.id}
                    />
                  ))}
              </Picker>
            </View>
          </Modal>
        </View>

          <ThemedText style={{ textAlign: 'center', marginVertical: 10, color: '#888' }}>
              Geboortedatum (in DD-MM-YYYY)
          </ThemedText>  
         <View style={{ flexDirection: 'row' }}>
          <TextInput
            style={[sheets.input3, { backgroundColor: '#F1EFEB' }]}
            placeholder="DD"
            value={DD}
            onChangeText={setDD}
          />
          <TextInput
            style={[sheets.input3, { backgroundColor: '#F1EFEB' }]}
            placeholder="MM"
            keyboardType="numeric"
            value={MM}
            onChangeText={setMM}
          />
          <TextInput
            style={[sheets.input3, { backgroundColor: '#F1EFEB' }]}
            placeholder="YYYY"
            keyboardType="numeric"
            value={YYYY}
            onChangeText={setYYYY}
          />
          </View>

          <TextInput
            style={[sheets.input, {backgroundColor: '#F1EFEB'}]}
            placeholder="LinkedIn Profiel (/in/John)"
            keyboardType="email-address"
            autoComplete="email"
            value={linkedIn}
            onChangeText={setLinkedin}
          />

          <TouchableOpacity
            style={[styles.button, { marginTop: 20, marginHorizontal: 10 }]}
            onPress={StartRegistration}
            accessibilityLabel="Login button"
          >
            <ThemedText style={styles.buttonText}>
              Meld aan
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

export function AccountDetails({ voornaam, achternaam, pfp, email, linkedin, DoB, opleiding, studiejaar, type }: AccountDetails) {
  const logOut = async () => {
    console.log("Uitloggen...")
    save("Token", "WholeLoadaShit");
  }

  const formattedDate = new Date(DoB).toLocaleDateString('nl-BE');

  const typeProfiel = async () => {
    switch(type){
      case 2:
        return "Student"

      case 1:
        return "Bedrijf"
    }
  }

  return(
    <ThemedView>
      <ThemedView style={styles.titleContainer}>
        <TouchableHighlight>
          <Image source={{ uri: pfp }} style={styles.profileImg} />
        </TouchableHighlight>

        <ThemedView style={styles.VStack}>
          <ThemedText type="title">{voornaam}</ThemedText>
          <ThemedText type="subtitle">{achternaam}</ThemedText>
          <ThemedText style={{opacity: 0.5}}>Erasmus Hogeschool Brussel</ThemedText>
          <ThemedText style={{opacity: 0.5}}>{typeProfiel()} • {opleiding} {studiejaar}</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedView style={styles.sectionRow}>
          <ThemedView style={styles.rowLeft}>
            <IconSymbol name="figure.child" color="#8e8e93" style={styles.icon} />
            <ThemedText style={styles.sectionText}>Geboortedatum</ThemedText>
          </ThemedView>
          <ThemedText style={styles.sectionValue}>{formattedDate}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.sectionRow}>
          <ThemedView style={styles.rowLeft}>
            <IconSymbol name="envelope" color="#8e8e93" style={styles.icon} />
            <ThemedText style={styles.sectionValue}>{email}</ThemedText>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity onPress={() => {
-          openLinkedInProfile(linkedin);
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

          <ThemedView>
          <TouchableOpacity
            style={[styles.button, { marginTop: 20 }]}
            //onPress={}
            accessibilityLabel="Skills modificatie"
          >
            <ThemedText style={styles.buttonTextView}>Skills</ThemedText>
          </TouchableOpacity>
          </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

export let ID = null;

export async function ValidateToken() {
  const key = await getKeyValueStore("Token", "WholeLoadaShit");
  const unixTime = Math.floor(new Date().getTime() / 1000);

  console.log('Cookie header:', `refreshToken=${key["refreshToken"]}`);

  if (key["accessTokenExpiration"] > unixTime) {
    console.log(key["accessToken"]);
    return key["accessToken"];
  } else if (key["accessTokenExpiration"] < unixTime) {
    try {
      const response = await fetch('https://api.ehb-match.me/auth/refresh', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'refreshToken': key["refreshToken"]
        }),
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const unixAccessToken = Math.floor(new Date(data["accessTokenExpiresAt"]).getTime() / 1000);
      const unixRefreshToken = Math.floor(new Date(key["refreshTokenExpiresAt"]).getTime() / 1000);

      await save("Token", {
        "accessToken": data["accessToken"],
        "accessTokenExpiration": unixAccessToken,
        "refreshToken": key["refreshToken"],
        "refreshTokenExpiration": unixRefreshToken
      });

      const tokenData = await getKeyValueStore("Token", "{}");
      
      return tokenData["accessToken"];
      
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }else if (key["refreshTokenExpiration"] < unixTime) {
    await save("Token", "WholeLoadaShit");
  }
}

const useTokenListener = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkToken = async () => {
      const currentToken = await getKeyValueStore("Token", "WholeLoadaShit");
      setToken(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(currentToken)) {
          return currentToken;
        }
        return prev;
      });
    };

    checkToken();
    const interval = setInterval(() => {
      if (isMounted) checkToken();
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return token;
};

export default function AccountScreen() {
  const token = useTokenListener();

  const [voornaam, setVoornaam] = useState('');
  const [achternaam, setAchternaam] = useState('');
  const [email, setEmail] = useState('');
  const [pfp, setPfp] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [DoB, setDoB] = useState('');
  const [opleiding, setOpleiding] = useState('');
  const [studiejaar, setStudiejaar] = useState('');
  const [typeProfiel, setProfielType] = useState('');
  const [loggedIn, isLoggedIn] = useState(false);
  const [studentFetched, setStudentFetched] = useState(false);

  useEffect(() => {
  const fetchStudent = async () => {
    try {
      const student = await getStudentInfo();
      console.log(student)
      if (student) {
        setVoornaam(student["user"]["voornaam"]);
        setAchternaam(student["user"]["achternaam"]);
        setEmail(student["user"]["email"]);
        setPfp(student["user"]["profiel_foto_url"]);
        setLinkedin(student["user"]["linkedin"]);
        setDoB(student["user"]["date_of_birth"]);
        setOpleiding(student["user"]["opleiding"]);
        setStudiejaar(student["user"]["studiejaar"]);
        setProfielType(student["user"]["type"]);
        setStudentFetched(true);
      }
    } catch (error) {
      console.log('[Error] fetching student:', error);
    }
  };

  const checkTokenAvailability = async () => {
    if (token === "WholeLoadaShit") {
      isLoggedIn(false);
    } else {
      isLoggedIn(true);
      setStudentFetched(false);
      await fetchStudent();
    }
  };

  if (token !== null) {
    checkTokenAvailability();
  }
}, [token]);

  let TypeText = "";

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
        <AccountDetails
          voornaam={voornaam}
          achternaam={achternaam}
          email={email}
          pfp={pfp}
          linkedin={linkedin}
          DoB={DoB}
          opleiding={opleiding}
          studiejaar={studiejaar}
          type={parseInt(typeProfiel)}
        />
      ) : (
        <LoginMessage />
      )}

      <ThemedText style={{ textAlign: 'center', fontSize: 15, opacity: 0.9 }}>
        Onze{' '}
        <ExternalLink href="https://ehb-match.me/privacy" style={{ color: '#007bff' }}>
          Privacy Policy
        </ExternalLink>{' '}
        &{' '}
        <ExternalLink href={"https://europa.eu/youreurope/business/dealing-with-customers/data-protection/data-protection-gdpr/index_nl.htm"} style={{ color: '#007bff' }}>
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
    height: 50,
    margin: 10,
    width: 350,
    borderWidth: 1,
    padding: 15,
    borderRadius: 10
  },
  input2: {
    height: 50,
    margin: 10,
    width: 165,
    borderWidth: 1,
    padding: 15,
    borderRadius: 10
  },
  input3: {
    height: 50,
    margin: 10,
    width: 103,
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
  },
  sectionValue: {
    fontSize: 16,
    color: '#8e8e93',
    backgroundColor: 'transparent'
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 15, 
    paddingHorizontal: 40, // makes button wider
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextView: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    alignSelf: "flex-start",
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
