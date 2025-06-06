import { Image } from 'expo-image';
import { Linking, StyleSheet, TouchableHighlight, TouchableOpacity } from 'react-native';

import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { useEffect, useState } from 'react';

const getStudentInfo = async () => {
  try {
    const response = await fetch('http://10.2.89.35:3001/studenten/0', {
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

    fetchStudent();
  }, []);

  const [voornaam, setVoornaam] = useState('');
  const [achternaam, setAchternaam] = useState('');
  const [email, setEmail] = useState('');
  const [pfp, setPfp] = useState('');
  const [linkedin, setLinkedin] = useState('');

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

});
