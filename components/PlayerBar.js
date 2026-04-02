import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import PlayerScreen from '../screens/PlayerScreen';

export default function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay } = usePlayer();
  const [showPlayer, setShowPlayer] = useState(false);

  if (!currentTrack) return null;

  return (
    <>
      <Modal visible={showPlayer} animationType="slide" onRequestClose={() => setShowPlayer(false)}>
        <PlayerScreen onClose={() => setShowPlayer(false)} />
      </Modal>
      <TouchableOpacity style={styles.container} onPress={() => setShowPlayer(true)} activeOpacity={0.9}>
        <View style={styles.thumb}>
          <Ionicons name="musical-note" size={20} color="#a78bfa" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
        <TouchableOpacity
          onPress={e => { e.stopPropagation(); togglePlay(); }}
          style={styles.btn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: '#2a2a3e' },
  thumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#2d1b4e', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 14, fontWeight: '500' },
  artist: { color: '#666', fontSize: 12, marginTop: 2 },
  btn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
