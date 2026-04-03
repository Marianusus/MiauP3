import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';

const PLAYLISTS_KEY = 'miaup3_playlists';

export default function PlaylistScreen({ onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(null);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [newName, setNewName] = useState('');
  const { tracks } = useLibrary();
  const { playTrack } = usePlayer();
  const { theme } = useTheme();

  useEffect(() => {
    AsyncStorage.getItem(PLAYLISTS_KEY).then((data) => {
      if (data) setPlaylists(JSON.parse(data));
    });
  }, []);

  function savePlaylists(updated) {
    setPlaylists(updated);
    AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
  }

  function createPlaylist() {
    if (!newName.trim()) return;
    savePlaylists([...playlists, { id: Date.now().toString(), name: newName.trim(), songs: [] }]);
    setNewName('');
    setShowCreate(false);
  }

  function addSongToPlaylist(playlistId, song) {
    savePlaylists(playlists.map(p => {
      if (p.id !== playlistId) return p;
      if (p.songs.find(s => s.id === song.id)) return p;
      return { ...p, songs: [...p.songs, song] };
    }));
  }

  function removeSongFromPlaylist(playlistId, songId) {
    savePlaylists(playlists.map(p => {
      if (p.id !== playlistId) return p;
      return { ...p, songs: p.songs.filter(s => s.id !== songId) };
    }));
  }

  function deletePlaylist(id) {
    savePlaylists(playlists.filter(p => p.id !== id));
    setShowPlaylist(null);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Playlist</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => setShowPlaylist(item)} activeOpacity={0.7}>
            <View style={[styles.thumb, { backgroundColor: theme.card }]}>
              <Ionicons name="musical-notes" size={22} color={theme.accent} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>{item.songs.length} brani</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Nessuna playlist</Text>
            <Text style={[styles.emptySubText, { color: theme.textMuted }]}>Premi + per crearne una</Text>
          </View>
        }
      />

      {/* Dialog crea playlist */}
      <Modal visible={showCreate} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowCreate(false)}>
          <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dialogTitle, { color: theme.text }]}>Nuova playlist</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Nome playlist"
              placeholderTextColor={theme.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.dialogBtns}>
              <TouchableOpacity style={styles.dialogBtnSecondary} onPress={() => setShowCreate(false)}>
                <Text style={[styles.dialogBtnSecondaryText, { color: theme.textMuted }]}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dialogBtn, { backgroundColor: theme.accent }]} onPress={createPlaylist}>
                <Text style={styles.dialogBtnText}>Crea</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Dettaglio playlist */}
      <Modal visible={!!showPlaylist} transparent={false} animationType="slide">
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {showPlaylist && (
            <>
              <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setShowPlaylist(null)}>
                  <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{showPlaylist.name}</Text>
                <View style={styles.headerBtns}>
                  <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]} onPress={() => setShowAddSongs(true)}>
                    <Ionicons name="add" size={20} color={theme.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]} onPress={() => deletePlaylist(showPlaylist.id)}>
                    <Ionicons name="trash-outline" size={20} color="#c0392b" />
                  </TouchableOpacity>
                </View>
              </View>

              <FlatList
                data={playlists.find(p => p.id === showPlaylist.id)?.songs ?? []}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.row} onPress={() => {
                    const songs = playlists.find(p => p.id === showPlaylist.id)?.songs ?? [];
                    playTrack(item, songs, songs.indexOf(item));
                  }}>
                    <View style={[styles.thumb, { backgroundColor: theme.card }]}>
                      <Ionicons name="musical-note" size={20} color={theme.accent} />
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[styles.subtitle, { color: theme.textMuted }]}>{item.artist ?? 'Sconosciuto'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeSongFromPlaylist(showPlaylist.id, item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name="remove-circle-outline" size={22} color="#c0392b" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.empty}>
                    <Ionicons name="musical-notes-outline" size={48} color={theme.textMuted} />
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>Nessun brano</Text>
                    <Text style={[styles.emptySubText, { color: theme.textMuted }]}>Premi + per aggiungere</Text>
                  </View>
                }
              />
            </>
          )}
        </View>
      </Modal>

      {/* Aggiungi brani dalla libreria */}
      <Modal visible={showAddSongs} transparent={false} animationType="slide">
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setShowAddSongs(false)}>
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Aggiungi brani</Text>
            <View style={{ width: 40 }} />
          </View>

          <FlatList
            data={tracks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const added = playlists.find(p => p.id === showPlaylist?.id)?.songs.find(s => s.id === item.id);
              return (
                <TouchableOpacity style={styles.row} onPress={() => addSongToPlaylist(showPlaylist.id, item)} activeOpacity={0.7}>
                  <View style={[styles.thumb, { backgroundColor: theme.card }]}>
                    <Ionicons name="musical-note" size={20} color={theme.accent} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                  </View>
                  {added && <Ionicons name="checkmark-circle" size={22} color={theme.accent} />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="musical-notes-outline" size={48} color={theme.textMuted} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>Nessun brano in libreria</Text>
                <Text style={[styles.emptySubText, { color: theme.textMuted }]}>Seleziona prima una cartella dalla Libreria</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  thumb: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  info: { flex: 1 },
  title: { fontSize: 15 },
  subtitle: { fontSize: 12, marginTop: 3 },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '500' },
  emptySubText: { fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  dialog: { borderRadius: 16, padding: 24, width: '80%', gap: 16 },
  dialogTitle: { fontSize: 18, fontWeight: '600' },
  input: { borderRadius: 10, padding: 12, fontSize: 15 },
  dialogBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  dialogBtn: { borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  dialogBtnText: { color: '#fff', fontWeight: '600' },
  dialogBtnSecondary: { paddingHorizontal: 20, paddingVertical: 10 },
  dialogBtnSecondaryText: { fontSize: 15 },
});
