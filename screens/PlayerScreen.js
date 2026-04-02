import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const PROGRESS_WIDTH = width - 56;

export default function PlayerScreen({ onClose }) {
  const { currentTrack, isPlaying, isLooping, togglePlay, toggleLoop, player, status } = usePlayer();
  const { theme } = useTheme();

  if (!currentTrack) return null;

  const duration = status?.duration ?? 0;
  const position = status?.currentTime ?? 0;
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  function formatTime(secs) {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  async function seekTo(evt) {
    if (!player || duration <= 0) return;
    const x = evt.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(x / PROGRESS_WIDTH, 1));
    await player.seekTo(ratio * duration);
  }

  const thumbOffset = progress * PROGRESS_WIDTH;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="chevron-down" size={28} color={theme.textMuted} />
      </TouchableOpacity>

      <View style={[styles.cover, { backgroundColor: theme.card }]}>
        <Ionicons name="musical-note" size={100} color={theme.accent} />
      </View>

      <View style={styles.bottom}>
        <View style={styles.infoRow}>
          <View style={styles.info}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={[styles.artist, { color: theme.textMuted }]} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <TouchableOpacity
            style={styles.progressBar}
            onPress={seekTo}
            activeOpacity={1}
          >
            <View style={[styles.progressTrack, { backgroundColor: theme.surface }]}>
              <View style={[styles.progressFill, { width: thumbOffset, backgroundColor: theme.accent }]} />
            </View>
            <View style={[styles.thumb, { left: thumbOffset - 7, backgroundColor: theme.accent }]} />
          </TouchableOpacity>
          <View style={styles.timeRow}>
            <Text style={[styles.time, { color: theme.textMuted }]}>{formatTime(position)}</Text>
            <Text style={[styles.time, { color: theme.textMuted }]}>-{formatTime(duration - position)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={toggleLoop}>
            <Ionicons name="repeat" size={24} color={isLooping ? theme.accent : theme.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn}>
            <Ionicons name="play-skip-back" size={32} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlay} style={[styles.playBtn, { borderColor: theme.text }]}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn}>
            <Ionicons name="play-skip-forward" size={32} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.ctrlBtn} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: { position: 'absolute', top: 50, left: 20, padding: 10, zIndex: 10 },
  cover: { width: width, height: height * 0.52, alignItems: 'center', justifyContent: 'center' },
  bottom: { flex: 1, paddingHorizontal: 28, paddingTop: 24, justifyContent: 'space-between', paddingBottom: 40 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  title: { fontSize: 22, fontWeight: '600' },
  artist: { fontSize: 15, marginTop: 4 },
  progressContainer: { gap: 8 },
  progressBar: { height: 28, justifyContent: 'center' },
  progressTrack: { height: 3, borderRadius: 2, width: PROGRESS_WIDTH },
  progressFill: { height: 3, borderRadius: 2 },
  thumb: { position: 'absolute', width: 14, height: 14, borderRadius: 7, top: 7 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ctrlBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 68, height: 68, borderRadius: 34, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
