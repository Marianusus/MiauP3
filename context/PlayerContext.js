import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlayerContext = createContext();
const PLAYER_KEY = 'miaup3_player_state';

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldDuckAndroid: false,
      staysActiveInBackground: true,
      interruptionModeAndroid: 1,
      interruptionModeIOS: 1,
    });

    AsyncStorage.getItem(PLAYER_KEY).then((data) => {
      if (data) {
        const { savedTrack, savedIndex } = JSON.parse(data);
        if (savedTrack) {
          setCurrentTrack(savedTrack);
          setQueueIndex(savedIndex || 0);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (currentTrack) {
      AsyncStorage.setItem(PLAYER_KEY, JSON.stringify({ savedTrack: currentTrack, savedIndex: queueIndex }));
    }
  }, [currentTrack, queueIndex]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const nextIndex = queueIndex + 1 < queue.length ? queueIndex + 1 : 0;
    const nextTrack = queue[nextIndex];
    setQueueIndex(nextIndex);
    player.replace({ uri: nextTrack.uri });
    player.play();
    setCurrentTrack(nextTrack);
  }, [queue, queueIndex, player]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    const prevIndex = queueIndex - 1 >= 0 ? queueIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIndex];
    setQueueIndex(prevIndex);
    player.replace({ uri: prevTrack.uri });
    player.play();
    setCurrentTrack(prevTrack);
  }, [queue, queueIndex, player]);

  useEffect(() => {
    if (status.didJustFinish && !isLooping) {
      playNext();
    }
  }, [status.didJustFinish, isLooping, playNext]);

  const playTrack = useCallback((track, trackQueue = [], index = 0) => {
    player.replace({ uri: track.uri });
    player.play();
    setCurrentTrack(track);
    if (trackQueue.length > 0) {
      setQueue(trackQueue);
      setQueueIndex(index);
    }
  }, [player]);

  const togglePlay = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [status.playing, player]);

  const toggleLoop = useCallback(() => {
    player.loop = !isLooping;
    setIsLooping(!isLooping);
  }, [isLooping, player]);

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying: status.playing, isLooping, playTrack, togglePlay, toggleLoop, playNext, playPrev, player, status, queue, queueIndex, setQueue, setQueueIndex }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
