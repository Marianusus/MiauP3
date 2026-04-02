import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { usePlayer } from '../context/PlayerContext';

export default function OnlineScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playTrack, currentTrack } = usePlayer();

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://api.jamendo.com/v3.0/tracks/?client_id=b6747d04&format=json&limit=20&namesearch=${encodeURIComponent(query)}&audioformat=mp32`);
      setResults(res.data.results);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput style={styles.input} placeholder="Cerca brani..." placeholderTextColor="#666" value={query} onChangeText={setQuery} onSubmitEditing={search} />
        <TouchableOpacity style={styles.searchBtn} onPress={search}>
          <Text style={{ color: '#fff' }}>Cerca</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator color="#a78bfa" style={{ marginTop: 20 }} />}
      <FlatList
        data={results}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, currentTrack?.id === item.id && styles.active]} onPress={() => playTrack({ id: item.id, uri: item.audio, title: item.name, artist: item.artist_name })}>
            <View style={styles.thumb}><Text style={{ fontSize: 20 }}>🌐</Text></View>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.artist} numberOfLines={1}>{item.artist_name}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && <Text style={styles.empty}>Cerca un brano per iniziare</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12121f' },
  searchBar: { flexDirection: 'row', padding: 12, gap: 8 },
  input: { flex: 1, backgroundColor: '#2a2a3e', color: '#fff', borderRadius: 20, paddingHorizontal: 14, fontSize: 14 },
  searchBtn: { backgroundColor: '#a78bfa', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#1e1e30' },
  active: { backgroundColor: '#1e1e30' },
  thumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#1b2d4e', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  title: { color: '#e0e0e0', fontSize: 14 },
  artist: { color: '#666', fontSize: 12, marginTop: 2 },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },
});
