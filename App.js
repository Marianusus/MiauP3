import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { PlayerProvider } from './context/PlayerContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PlayerBar from './components/PlayerBar';
import LibraryScreen from './screens/LibraryScreen';
import PlaylistScreen from './screens/PlaylistScreen';
import SettingsScreen from './screens/SettingsScreen';

SplashScreen.preventAutoHideAsync();

function Main() {
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [songs, setSongs] = useState([]);
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {showSettings ? (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      ) : showPlaylists ? (
        <PlaylistScreen songs={songs} onClose={() => setShowPlaylists(false)} />
      ) : (
        <LibraryScreen
          songs={songs}
          setSongs={setSongs}
          onOpenPlaylists={() => setShowPlaylists(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
      <PlayerBar />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <PlayerProvider>
        <Main />
      </PlayerProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
