import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { useRepository } from '@comic-catalog/ui';
import type { StorageInfo } from '@comic-catalog/core';

export function SettingsScreen() {
  const repo = useRepository();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    repo.getStorageInfo().then(setStorageInfo);
  }, [repo]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const zipBytes = await repo.exportBackup();
      const filename = `comic-catalog-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      const path = `${FileSystem.cacheDirectory}${filename}`;

      let binary = '';
      for (let i = 0; i < zipBytes.length; i++) {
        binary += String.fromCharCode(zipBytes[i]);
      }
      const base64 = btoa(binary);

      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: 'application/zip',
          dialogTitle: 'Export Comic Catalog Backup',
        });
      } else {
        Alert.alert('Exported', `Backup saved to ${path}`);
      }
    } catch (err) {
      Alert.alert('Export Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      Alert.alert(
        'Import Backup',
        'This will replace ALL existing data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              setImporting(true);
              try {
                const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                const binary = atob(base64);
                const zipBytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                  zipBytes[i] = binary.charCodeAt(i);
                }

                await repo.importBackup(zipBytes);
                const info = await repo.getStorageInfo();
                setStorageInfo(info);
                Alert.alert('Success', `Imported ${info.itemCount} comics.`);
              } catch (err) {
                Alert.alert('Import Failed', err instanceof Error ? err.message : 'Unknown error');
              } finally {
                setImporting(false);
              }
            },
          },
        ],
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Storage Info */}
      <Text style={styles.sectionTitle}>Storage</Text>
      <View style={styles.card}>
        {storageInfo ? (
          <View style={styles.statsRow}>
            <StatItem label="Comics" value={storageInfo.itemCount} />
            <StatItem label="Tags" value={storageInfo.tagCount} />
            <StatItem label="Images" value={storageInfo.imageCount} />
          </View>
        ) : (
          <Text style={styles.loadingText}>Loading...</Text>
        )}
      </View>

      {/* Backup */}
      <Text style={styles.sectionTitle}>Backup & Restore</Text>
      <View style={styles.card}>
        <Text style={styles.description}>
          Export your collection as a ZIP or import a previous backup.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, exporting && { opacity: 0.5 }]}
          onPress={handleExport}
          disabled={exporting}
        >
          <Text style={styles.primaryBtnText}>
            {exporting ? 'Exporting...' : 'Export Backup'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, importing && { opacity: 0.5 }]}
          onPress={handleImport}
          disabled={importing}
        >
          <Text style={styles.secondaryBtnText}>
            {importing ? 'Importing...' : 'Import Backup'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <Text style={styles.aboutTitle}>Comic Catalog v0.1.0</Text>
        <Text style={styles.aboutText}>
          A local-only comic book collection manager. Your data stays on your device.
        </Text>
      </View>
    </ScrollView>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#868e96',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 4,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', color: '#212529' },
  statLabel: { fontSize: 12, color: '#868e96', marginTop: 2 },
  loadingText: { color: '#adb5bd', textAlign: 'center' },
  description: { fontSize: 14, color: '#868e96', marginBottom: 14, lineHeight: 20 },
  primaryBtn: {
    backgroundColor: '#4c6ef5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: '#f1f3f5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#495057', fontWeight: '600', fontSize: 15 },
  aboutTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 4 },
  aboutText: { fontSize: 14, color: '#868e96', lineHeight: 20 },
});
