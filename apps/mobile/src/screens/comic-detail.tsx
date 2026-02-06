import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useRepository } from '@comic-catalog/ui';
import type { Item, Tag } from '@comic-catalog/core';
import type { RootStackParamList } from '../navigation/root-navigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, 'ComicDetail'>;

export function ComicDetailScreen() {
  const nav = useNavigation<NavProp>();
  const route = useRoute<DetailRoute>();
  const repo = useRepository();
  const { id } = route.params;

  const [item, setItem] = useState<Item | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [coverUri, setCoverUri] = useState<string | null>(null);

  const load = useCallback(async () => {
    const found = await repo.getItem(id);
    if (found) {
      setItem(found);
      const t = await repo.getItemTags(id);
      setTags(t);
      if (found.coverImageId) {
        const img = await repo.getImage(found.coverImageId);
        if (img) {
          const url = await repo.getImageUrl(img);
          setCoverUri(typeof url === 'string' ? url : null);
        }
      } else {
        setCoverUri(null);
      }
    }
  }, [repo, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleDelete = () => {
    Alert.alert('Delete Comic', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await repo.deleteItem(id);
          nav.goBack();
        },
      },
    ]);
  };

  const handlePickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [2, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binary = atob(base64);
      const data = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        data[i] = binary.charCodeAt(i);
      }
      await repo.attachCoverImage(id, {
        data,
        mime: asset.mimeType || 'image/jpeg',
        width: asset.width,
        height: asset.height,
      });
      await load();
    }
  };

  const handleTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [2, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binary = atob(base64);
      const data = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        data[i] = binary.charCodeAt(i);
      }
      await repo.attachCoverImage(id, {
        data,
        mime: asset.mimeType || 'image/jpeg',
        width: asset.width,
        height: asset.height,
      });
      await load();
    }
  };

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cover */}
      <View style={styles.coverSection}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.placeholderText}>No Cover</Text>
          </View>
        )}
        <View style={styles.coverActions}>
          <TouchableOpacity style={styles.coverBtn} onPress={handlePickCover}>
            <Text style={styles.coverBtnText}>Pick Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.coverBtn} onPress={handleTakePhoto}>
            <Text style={styles.coverBtnText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailCard}>
        <Text style={styles.title}>{item.series}</Text>
        <Text style={styles.subtitle}>
          #{item.issueNumber}
          {item.variant ? ` (${item.variant})` : ''}
        </Text>

        <View style={styles.divider} />

        <DetailRow label="Publisher" value={item.publisher} />
        <DetailRow label="Release Date" value={item.releaseDate} />
        <DetailRow label="Writers" value={item.writers} />
        <DetailRow label="Artists" value={item.artists} />
        <DetailRow label="Condition" value={item.condition} />
        <DetailRow
          label="Price"
          value={item.purchasePrice != null ? `$${item.purchasePrice.toFixed(2)}` : null}
        />
        <DetailRow label="Location" value={item.location} />
        <DetailRow label="Barcode" value={item.barcode} />

        {item.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}

        {tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.fieldLabel}>Tags</Text>
            <View style={styles.tagRow}>
              {tags.map((t) => (
                <View key={t.id} style={styles.tagChip}>
                  <Text style={styles.tagText}>{t.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => nav.navigate('ComicForm', { id: item.id })}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loading: { color: '#868e96' },
  coverSection: { alignItems: 'center', marginBottom: 16 },
  coverImage: { width: 200, height: 300, borderRadius: 12 },
  coverPlaceholder: {
    width: 200,
    height: 300,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#adb5bd', fontSize: 14 },
  coverActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  coverBtn: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  coverBtnText: { fontSize: 13, color: '#495057', fontWeight: '500' },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#212529' },
  subtitle: { fontSize: 16, color: '#868e96', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f3f5', marginVertical: 14 },
  row: { flexDirection: 'row', marginBottom: 10 },
  fieldLabel: {
    width: 100,
    fontSize: 12,
    fontWeight: '600',
    color: '#adb5bd',
    textTransform: 'uppercase',
  },
  fieldValue: { flex: 1, fontSize: 14, color: '#495057' },
  notesSection: { marginTop: 12 },
  notesText: { fontSize: 14, color: '#495057', lineHeight: 20, marginTop: 4 },
  tagsSection: { marginTop: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tagChip: {
    backgroundColor: '#dbe4ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: { fontSize: 12, color: '#4263eb', fontWeight: '500' },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#4c6ef5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fa5252',
  },
  deleteBtnText: { color: '#fa5252', fontWeight: '600', fontSize: 15 },
});
