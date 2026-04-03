import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';

export default function LibraryScreen({ onOpenPlaylists, onOpenSettings }) {
  const [ratings, setRatings] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [availableFolders, setAvailableFolders] = useState([]);
  const [toDelete, setToDelete] = useState(null);
  const { playTrack, currentTrack } = usePlayer();
  const { theme } = useTheme();
  const { tracks, loading, savedFolder, pickFolder, selectFolder, clearFolder, refreshFolder } = useLibrary();

  async function openFolderPicker() {
    setShowMenu(false);
    const folders = await pickFolder();
    if (folders && folders.length > 0) {
      setAvailableFolders(folders);
      setShowFolderPicker(true);
    }
  }

  async function onSelectFolder(album) {
    setShowFolderPicker(false);
    await selectFolder(album);
  }

  function setRating(id, stars) {
    setRatings(prev => ({ ...prev, [id]: stars }));
  }

  function renderStars(id) {
    const r = ratings[id] || 0;
    return [1, 2, 3, 4, 5].map(s => (
      <TouchableOpacity key={s} onPress={() => setRating(id, s)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
        <Ionicons name={s <= r ? 'star' : 'star-outline'} size={14} color={theme.accent} />
      </TouchableOpacity>
    ));
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Libreria</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]} onPress={onOpenPlaylists}>
            <Ionicons name="list" size={20} color={theme.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]} onPress={onOpenSettings}>
            <Ionicons name="settings-outline" size={20} color={theme.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={() => setShowMenu(true)}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cartella attiva */}
      {savedFolder && (
        <View style={[styles.folderBar, { backgroundColor: theme.surface }]}>
          <Ionicons name="folder-open-outline" size={16} color={theme.accent} />
          <Text style={[styles.folderBarText, { color: theme.text }]} numberOfLines={1}>{savedFolder.title}</Text>
          <TouchableOpacity onPress={refreshFolder}>
            <Ionicons name="refresh-outline" size={16} color={theme.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearFolder}>
            <Ionicons name="close-circle-outline" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Menu + */}
      <Modal visible={showMenu} transparent animationType="slide">
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
          <TouchableOpacity style={[styles.menu, { backgroundColor: theme.surface }]} onPress={() => setShowMenu(false)} activeOpacity={1}>
            <TouchableOpacity style={styles.menuItem} onPress={openFolderPicker}>
              <Ionicons name="folder-open-outline" size={24} color={theme.accent} />
              <View>
                <Text style={[styles.menuText, { color: theme.text }]}>Seleziona cartella</Text>
                <Text style={[styles.menuSub, { color: theme.textMuted }]}>Carica tutti gli mp3 da una cartella</Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Folder picker modal */}
      <Modal visible={showFolderPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setShowFolderPicker(false)}>
          <View style={[styles.menu, { backgroundColor: theme.surface }]}>
            <Text style={[styles.folderPickerTitle, { color: theme.text }]}>Scegli cartella</Text>
            <FlatList
              data={availableFolders}
              keyExtractor={item => item.id}
              style={{ maxHeight: 400 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem} onPress={() => onSelectFolder(item)}>
                  <Ionicons name="folder-outline" size={22} color={theme.accent} />
                  <View>
                    <Text style={[styles.menuText, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.menuSub, { color: theme.textMuted }]}>{item.assetCount} brani</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Lista brani */}
      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => playTrack(item, tracks, tracks.indexOf(item))}
            onLongPress={() => setToDelete(item)}
            delayLongPress={400}
            activeOpacity={0.7}
          >
            <View style={[styles.thumb, { backgroundColor: theme.card }]}>
              <Ionicons name="musical-note" size={20} color={theme.accent} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.artist, { color: theme.textMuted }]}>Sconosciuto</Text>
              <View style={styles.starsRow}>{renderStars(item.id)}</View>
            </View>
            {currentTrack?.id === item.id && (
              <Ionicons name="volume-high" size={18} color={theme.accent} />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              {loading ? 'Caricamento...' : 'Nessun brano'}
            </Text>
            <Text style={[styles.emptySubText, { color: theme.textMuted }]}>
              {loading ? '' : 'Premi + per selezionare una cartella'}
            </Text>
          </View>
        }
      />

      {/* Dialog elimina */}
      <Modal visible={!!toDelete} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setToDelete(null)}>
          <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dialogTitle, { color: theme.text }]}>Rimuovi brano</Text>
            <Text style={[styles.dialogSub, { color: theme.textMuted }]}>{toDelete?.title}</Text>
            <View style={styles.dialogBtns}>
              <TouchableOpacity style={styles.dialogBtnSecondary} onPress={() => setToDelete(null)}>
                <Text style={[styles.dialogBtnSecondaryText, { color: theme.textMuted }]}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dialogBtnDanger} onPress={() => setToDelete(null)}>
                <Text style={styles.dialogBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  folderBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  folderBarText: { flex: 1, fontSize: 13 },
  folderPickerTitle: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  menu: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
  menuText: { fontSize: 16 },
  menuSub: { fontSize: 12, marginTop: 2 },
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
