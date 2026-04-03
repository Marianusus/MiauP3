import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LibraryContext = createContext();
const FOLDER_KEY = 'miaup3_folder';

const AUDIO_EXTENSIONS = ['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac'];

function isAudio(filename) {
  const lower = filename.toLowerCase();
  return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function LibraryProvider({ children }) {
  const [permissionStatus, requestPermission] = MediaLibrary.usePermissions();
  const [savedFolder, setSavedFolder] = useState(null); // { id, title, uri }
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carica la cartella salvata all'avvio
  useEffect(() => {
    AsyncStorage.getItem(FOLDER_KEY).then((data) => {
      if (data) {
        const folder = JSON.parse(data);
        setSavedFolder(folder);
        scanFolder(folder.id);
      }
    });
  }, []);

  const scanFolder = useCallback(async (albumId) => {
    setLoading(true);
    try {
      let allAssets = [];
      let hasNextPage = true;
      let after = undefined;

      while (hasNextPage) {
        const result = await MediaLibrary.getAssetsAsync({
          album: albumId,
          mediaType: MediaLibrary.MediaType.audio,
          first: 200,
          after,
        });
        allAssets = [...allAssets, ...result.assets];
        hasNextPage = result.hasNextPage;
        after = result.endCursor;
      }

      const audioTracks = allAssets
        .filter((a) => isAudio(a.filename))
        .map((a) => ({
          id: a.id,
          uri: a.uri,
          title: a.filename.replace(/\.[^/.]+$/, ''),
          filename: a.filename,
          duration: a.duration,
        }))
        .sort((a, b) => a.title.localeCompare(b.title));

      setTracks(audioTracks);
    } catch (e) {
      console.error('Errore scansione cartella:', e);
    }
    setLoading(false);
  }, []);

  const pickFolder = useCallback(async () => {
    if (!permissionStatus?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }

    const albums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: false });

    // Ritorna la lista degli album così la UI può mostrare un picker
    return albums.filter((a) => a.assetCount > 0);
  }, [permissionStatus, requestPermission]);

  const selectFolder = useCallback(async (album) => {
    const folder = { id: album.id, title: album.title };
    setSavedFolder(folder);
    await AsyncStorage.setItem(FOLDER_KEY, JSON.stringify(folder));
    await scanFolder(album.id);
  }, [scanFolder]);

  const clearFolder = useCallback(async () => {
    setSavedFolder(null);
    setTracks([]);
    await AsyncStorage.removeItem(FOLDER_KEY);
  }, []);

  const refreshFolder = useCallback(() => {
    if (savedFolder) scanFolder(savedFolder.id);
  }, [savedFolder, scanFolder]);

  return (
    <LibraryContext.Provider value={{ savedFolder, tracks, loading, pickFolder, selectFolder, clearFolder, refreshFolder, permissionStatus }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}
