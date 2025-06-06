import BottomSheet from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

type LoginSheetProps = {
  onLoginSuccess: () => void;
};

export default function LoginSheet({ onLoginSuccess }: LoginSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['80%'], []);

  useEffect(() => {
    sheetRef.current?.expand();
  }, []);

  const handleLogin = () => {
    onLoginSuccess();
    sheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      handleComponent={null}
      backgroundStyle={{ backgroundColor: 'black' }}
    >
      <View style={styles.content}>
        <Text style={styles.text}>Please log in</Text>
        <Button title="Log In" onPress={handleLogin} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
});
