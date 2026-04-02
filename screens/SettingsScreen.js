import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen({ onClose }) {
  const { theme, currentTheme, setCurrentTheme, themes } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Impostazioni</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>TEMA</Text>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          {Object.entries(themes).map(([key, t], i, arr) => (
            <View key={key}>
              <TouchableOpacity
                style={styles.themeRow}
                onPress={() => setCurrentTheme(key)}
                activeOpacity={0.7}
              >
                <View style={[styles.themeCircle, { backgroundColor: t.accent }]} />
                <View style={styles.themeInfo}>
                  <Text style={[styles.themeName, { color: theme.text }]}>{t.name}</Text>
                  <View style={styles.themePalette}>
                    <View style={[styles.paletteBlock, { backgroundColor: t.background }]} />
                    <View style={[styles.paletteBlock, { backgroundColor: t.surface }]} />
                    <View style={[styles.paletteBlock, { backgroundColor: t.card }]} />
                    <View style={[styles.paletteBlock, { backgroundColor: t.accent }]} />
                  </View>
                </View>
                {currentTheme === key && (
                  <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
                )}
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: theme.background }]} />}
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>INFO</Text>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Versione</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>Beta 3</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.background }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Sviluppatore</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>TheBigMiau</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 },
  card: { borderRadius: 16, overflow: 'hidden' },
  themeRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  themeCircle: { width: 32, height: 32, borderRadius: 16 },
  themeInfo: { flex: 1, gap: 6 },
  themeName: { fontSize: 15 },
  themePalette: { flexDirection: 'row', gap: 4 },
  paletteBlock: { width: 16, height: 16, borderRadius: 4 },
  divider: { height: 0.5, marginHorizontal: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  infoLabel: { fontSize: 15 },
  infoValue: { fontSize: 15 },
});
