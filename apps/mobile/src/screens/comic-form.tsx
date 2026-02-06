import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useRepository } from '@comic-catalog/ui';
import { ConditionOptions } from '@comic-catalog/core';
import type { Item, Tag } from '@comic-catalog/core';
import type { RootStackParamList } from '../navigation/root-navigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type FormRoute = RouteProp<RootStackParamList, 'ComicForm'>;

export function ComicFormScreen() {
  const nav = useNavigation<NavProp>();
  const route = useRoute<FormRoute>();
  const repo = useRepository();
  const editId = route.params?.id;
  const prefillBarcode = route.params?.barcode;

  const [saving, setSaving] = useState(false);
  const [series, setSeries] = useState('');
  const [issueNumber, setIssueNumber] = useState('');
  const [variant, setVariant] = useState('');
  const [publisher, setPublisher] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [writers, setWriters] = useState('');
  const [artists, setArtists] = useState('');
  const [condition, setCondition] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [barcode, setBarcode] = useState(prefillBarcode || '');

  // Tags
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    repo.listTags().then(setAllTags);

    if (editId) {
      (async () => {
        const item = await repo.getItem(editId);
        if (item) {
          setSeries(item.series);
          setIssueNumber(item.issueNumber);
          setVariant(item.variant || '');
          setPublisher(item.publisher || '');
          setReleaseDate(item.releaseDate || '');
          setWriters(item.writers || '');
          setArtists(item.artists || '');
          setCondition(item.condition || '');
          setPurchasePrice(item.purchasePrice != null ? String(item.purchasePrice) : '');
          setLocation(item.location || '');
          setNotes(item.notes || '');
          setBarcode(item.barcode || '');
        }
        const tags = await repo.getItemTags(editId);
        setSelectedTagIds(tags.map((t) => t.id));
      })();
    }
  }, [repo, editId]);

  const handleSave = async () => {
    if (!series.trim()) {
      Alert.alert('Validation', 'Series is required');
      return;
    }
    if (!issueNumber.trim()) {
      Alert.alert('Validation', 'Issue number is required');
      return;
    }

    setSaving(true);
    try {
      const data: Partial<Item> & { series: string; issueNumber: string } = {
        ...(editId ? { id: editId } : {}),
        series: series.trim(),
        issueNumber: issueNumber.trim(),
        variant: variant.trim() || null,
        publisher: publisher.trim() || null,
        releaseDate: releaseDate || null,
        writers: writers.trim(),
        artists: artists.trim(),
        condition: condition || null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        barcode: barcode.trim() || null,
      };

      const saved = await repo.upsertItem(data);
      await repo.setItemTags(saved.id, selectedTagIds);

      if (editId) {
        nav.goBack();
      } else {
        nav.navigate('ComicDetail', { id: saved.id });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await repo.upsertTag(newTagName.trim());
    setAllTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]));
    setSelectedTagIds((prev) => (prev.includes(tag.id) ? prev : [...prev, tag.id]));
    setNewTagName('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Details</Text>

      <Field label="Series *" value={series} onChangeText={setSeries} placeholder="e.g., The Amazing Spider-Man" />
      <Field label="Issue Number *" value={issueNumber} onChangeText={setIssueNumber} placeholder="e.g., 300" />
      <Field label="Variant" value={variant} onChangeText={setVariant} placeholder="e.g., Newsstand" />
      <Field label="Publisher" value={publisher} onChangeText={setPublisher} placeholder="e.g., Marvel Comics" />
      <Field label="Release Date" value={releaseDate} onChangeText={setReleaseDate} placeholder="YYYY-MM-DD" />
      <Field label="Writers" value={writers} onChangeText={setWriters} placeholder="Comma-separated" />
      <Field label="Artists" value={artists} onChangeText={setArtists} placeholder="Comma-separated" />

      {/* Condition Picker */}
      <Text style={styles.label}>Condition</Text>
      <View style={styles.conditionRow}>
        {ConditionOptions.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.conditionChip, condition === c && styles.conditionChipActive]}
            onPress={() => setCondition(condition === c ? '' : c)}
          >
            <Text style={[styles.conditionText, condition === c && styles.conditionTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field
        label="Purchase Price ($)"
        value={purchasePrice}
        onChangeText={setPurchasePrice}
        placeholder="0.00"
        keyboardType="numeric"
      />
      <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g., Box A" />
      <Field label="Barcode" value={barcode} onChangeText={setBarcode} placeholder="UPC/EAN" />
      <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Notes..." multiline />

      {/* Tags */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Tags</Text>
      <View style={styles.tagRow}>
        {allTags.map((tag) => {
          const selected = selectedTagIds.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              style={[styles.tagChip, selected && styles.tagChipActive]}
              onPress={() =>
                setSelectedTagIds((prev) =>
                  selected ? prev.filter((id) => id !== tag.id) : [...prev, tag.id],
                )
              }
            >
              <Text style={[styles.tagText, selected && styles.tagTextActive]}>{tag.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.newTagRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={newTagName}
          onChangeText={setNewTagName}
          placeholder="New tag..."
          onSubmitEditing={handleAddTag}
        />
        <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
          <Text style={styles.addTagBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.5 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Comic'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#adb5bd"
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 12 },
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#868e96', marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#212529',
  },
  conditionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  conditionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f3f5',
  },
  conditionChipActive: { backgroundColor: '#4c6ef5' },
  conditionText: { fontSize: 12, color: '#495057' },
  conditionTextActive: { color: '#fff', fontWeight: '600' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
  },
  tagChipActive: { backgroundColor: '#4c6ef5' },
  tagText: { fontSize: 12, color: '#495057' },
  tagTextActive: { color: '#fff', fontWeight: '600' },
  newTagRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  addTagBtn: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addTagBtnText: { fontSize: 13, fontWeight: '600', color: '#495057' },
  saveBtn: {
    backgroundColor: '#4c6ef5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
