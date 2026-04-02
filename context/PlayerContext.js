import React, { createContext, useContext, useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  React.useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
    });
  }, []);

  async function playTrack(track) {
    player.replace({ uri: track.uri });
    player.play();
    setCurrentTrack(track);
  }

  function togglePlay() {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  function toggleLoop() {
    player.loop = !isLooping;
    setIsLooping(!isLooping);
  }

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying: status.playing, isLooping, playTrack, togglePlay, toggleLoop, player, status }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
