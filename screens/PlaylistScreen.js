import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlaylistScreen({ songs, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(null);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [newName, setNewName] = useState('');

  function createPlaylist() {
    if (!newName.trim()) return;
    setPlaylists(prev => [...prev, { id: Date.now().toString(), name: newName.trim(), songs: [] }]);
    setNewName('');
    setShowCreate(false);
  }

  function addSongToPlaylist(playlistId, song) {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      if (p.songs.find(s => s.id === song.id)) return p;
      return { ...p, songs: [...p.songs, song] };
    }));
  }

  function removeSongFromPlaylist(playlistId, songId) {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      return { ...p, songs: p.songs.filter(s => s.id !== songId) };
    }));
  }

  function deletePlaylist(id) {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    setShowPlaylist(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Playlist</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => setShowPlaylist(item)} activeOpacity={0.7}>
            <View style={styles.thumb}>
              <Ionicons name="musical-notes" size={20} color="#a78bfa" />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.subtitle}>{item.songs.length} brani</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#444" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={48} color="#333" />
            <Text style={styles.emptyText}>Nessuna playlist</Text>
            <Text style={styles.emptySubText}>Premi + per crearne una</Text>
          </View>
        }
      />

      <Modal visible={showCreate} transparent animationType="fade" onRequestClose={() => setShowCreate(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowCreate(false)}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Nuova playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome playlist"
              placeholderTextColor="#555"
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.dialogBtns}>
              <TouchableOpacity style={styles.dialogBtnSecondary} onPress={() => setShowCreate(false)}>
                <Text style={styles.dialogBtnSecondaryText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dialogBtn} onPress={createPlaylist}>
                <Text style={styles.dialogBtnText}>Crea</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={!!showPlaylist} animationType="slide" onRequestClose={() => setShowPlaylist(null)}>
        {showPlaylist && (
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setShowPlaylist(null)} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{showPlaylist.name}</Text>
              <View style={styles.headerBtns}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setShowAddSongs(true)}>
                  <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => deletePlaylist(showPlaylist.id)}>
                  <Ionicons name="trash-outline" size={20} color="#e05" />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={playlists.find(p => p.id === showPlaylist.id)?.songs ?? []}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View style={styles.thumb}>
                    <Ionicons name="musical-note" size={20} color="#a78bfa" />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeSongFromPlaylist(showPlaylist.id, item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="remove-circle-outline" size={22} color="#555" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>Nessun brano</Text>
                  <Text style={styles.emptySubText}>Premi + per aggiungere</Text>
                </View>
              }
            />
            <Modal visible={showAddSongs} animationType="slide" onRequestClose={() => setShowAddSongs(false)}>
              <View style={styles.container}>
                <View style={styles.header}>
                  <TouchableOpacity onPress={() => setShowAddSongs(false)} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={26} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Aggiungi brani</Text>
                  <View style={{ width: 40 }} />
                </View>
                <FlatList
                  data={songs}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => {
                    const added = playlists.find(p => p.id === showPlaylist.id)?.songs.find(s => s.id === item.id);
                    return (
                      <TouchableOpacity style={styles.row} onPress={() => addSongToPlaylist(showPlaylist.id, item)} activeOpacity={0.7}>
                        <View style={styles.thumb}>
                          <Ionicons name="musical-note" size={20} color="#a78bfa" />
                        </View>
                        <View style={styles.info}>
                          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        </View>
                        {added && <Ionicons name="checkmark-circle" size={22} color="#a78bfa" />}
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={styles.empty}>
                      <Text style={styles.emptyText}>Nessun brano in libreria</Text>
                    </View>
                  }
                />
              </View>
            </Modal>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12121f' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#a78bfa', alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2d1b4e', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  thumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#2d1b4e', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  info: { flex: 1 },
  title: { color: '#e0e0e0', fontSize: 15 },
  subtitle: { color: '#555', fontSize: 12, marginTop: 3 },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { color: '#555', fontSize: 16, fontWeight: '500' },
  emptySubText: { color: '#444', fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  dialog: { backgroundColor: '#1e1e30', borderRadius: 16, padding: 24, width: '80%', gap: 16 },
  dialogTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  input: { backgroundColor: '#12121f', color: '#fff', borderRadius: 10, padding: 12, fontSize: 15 },
  dialogBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  dialogBtn: { backgroundColor: '#a78bfa', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  dialogBtnText: { color: '#fff', fontWeight: '600' },
  dialogBtnSecondary: { paddingHorizontal: 20, paddingVertical: 10 },
  dialogBtnSecondaryText: { color: '#888' },
});
