import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';

export default function LibraryScreen({ songs, setSongs, onOpenPlaylists, onOpenSettings }) {
  const [ratings, setRatings] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const { playTrack, currentTrack } = usePlayer();
  const { theme } = useTheme();

  async function pickFiles() {
    setShowMenu(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      multiple: true,
      copyToCacheDirectory: false,
    });
    if (!result.canceled) {
      addSongs(result.assets.map(a => ({
        id: a.uri,
        uri: a.uri,
        title: a.name.replace(/\.[^/.]+$/, ''),
        artist: 'Sconosciuto',
      })));
    }
  }

  async function scanLibrary() {
    setShowMenu(false);
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') return;
    const media = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 500 });
    addSongs(media.assets.map(a => ({
      id: a.id,
      uri: a.uri,
      title: a.filename.replace(/\.[^/.]+$/, ''),
      artist: 'Sconosciuto',
    })));
  }

  function addSongs(nuovi) {
    setSongs(prev => {
      const esistenti = new Set(prev.map(s => s.id));
      return [...prev, ...nuovi.filter(n => !esistenti.has(n.id))];
    });
  }

  function deleteSong(id) {
    setSongs(prev => prev.filter(s => s.id !== id));
    setToDelete(null);
  }

  function setRating(id, stars) {
    setRatings(prev => ({ ...prev, [id]: stars }));
  }

  function renderStars(id) {
    const r = ratings[id] || 0;
    return [1,2,3,4,5].map(s => (
      <TouchableOpacity key={s} onPress={() => setRating(id, s)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
        <Ionicons name={s <= r ? 'star' : 'star-outline'} size={14} color={s <= r ? theme.accent : '#444'} />
      </TouchableOpacity>
    ));
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Libreria</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.card }]} onPress={onOpenSettings}>
            <Ionicons name="settings-outline" size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.card }]} onPress={onOpenPlaylists}>
            <Ionicons name="list" size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={() => setShowMenu(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setShowMenu(false)} activeOpacity={1}>
          <View style={[styles.menu, { backgroundColor: theme.surface }]}>
            <TouchableOpacity style={styles.menuItem} onPress={scanLibrary}>
              <Ionicons name="phone-portrait-outline" size={22} color={theme.accent} />
              <View>
                <Text style={[styles.menuText, { color: theme.text }]}>Scansiona dispositivo</Text>
                <Text style={[styles.menuSub, { color: theme.textMuted }]}>Trova tutti i brani sul telefono</Text>
              </View>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: theme.background }]} />
            <TouchableOpacity style={styles.menuItem} onPress={pickFiles}>
              <Ionicons name="document-outline" size={22} color={theme.accent} />
              <View>
                <Text style={[styles.menuText, { color: theme.text }]}>Carica file</Text>
                <Text style={[styles.menuSub, { color: theme.textMuted }]}>Seleziona file singoli</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={!!toDelete} transparent animationType="fade" onRequestClose={() => setToDelete(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setToDelete(null)}>
          <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dialogTitle, { color: theme.text }]}>Rimuovi brano</Text>
            <Text style={[styles.dialogSub, { color: theme.textMuted }]} numberOfLines={2}>{toDelete?.title}</Text>
            <View style={styles.dialogBtns}>
              <TouchableOpacity style={styles.dialogBtnSecondary} onPress={() => setToDelete(null)}>
                <Text style={[styles.dialogBtnSecondaryText, { color: theme.textMuted }]}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dialogBtnDanger} onPress={() => deleteSong(toDelete.id)}>
                <Text style={styles.dialogBtnText}>Rimuovi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <FlatList
        data={songs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, currentTrack?.id === item.id && { backgroundColor: theme.surface }]}
            onPress={() => playTrack(item)}
            onLongPress={() => setToDelete(item)}
            delayLongPress={400}
            activeOpacity={0.7}
          >
            <View style={[styles.thumb, { backgroundColor: theme.card }]}>
              <Ionicons name="musical-note" size={20} color={theme.accent} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.artist, { color: theme.textMuted }]} numberOfLines={1}>{item.artist}</Text>
              <View style={styles.starsRow}>{renderStars(item.id)}</View>
            </View>
            {currentTrack?.id === item.id && (
              <Ionicons name="volume-high" size={16} color={theme.accent} />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={48} color="#333" />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Nessun brano</Text>
            <Text style={[styles.emptySubText, { color: '#444' }]}>Premi + per aggiungere musica</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '700' },
  headerBtns: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  menu: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
  menuText: { fontSize: 16 },
  menuSub: { fontSize: 12, marginTop: 2 },
  menuDivider: { height: 0.5, marginHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  thumb: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  info: { flex: 1 },
  title: { fontSize: 15 },
  artist: { fontSize: 12, marginTop: 2 },
  starsRow: { flexDirection: 'row', gap: 3, marginTop: 5 },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '500' },
  emptySubText: { fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  dialog: { borderRadius: 16, padding: 24, width: '80%', gap: 12 },
  dialogTitle: { fontSize: 18, fontWeight: '600' },
  dialogSub: { fontSize: 14 },
  dialogBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  dialogBtnDanger: { backgroundColor: '#c0392b', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  dialogBtnText: { color: '#fff', fontWeight: '600' },
  dialogBtnSecondary: { paddingHorizontal: 20, paddingVertical: 10 },
  dialogBtnSecondaryText: { fontSize: 15 },
});
