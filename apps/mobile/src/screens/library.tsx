import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRepository } from '@comic-catalog/ui';
import type { Item } from '@comic-catalog/core';
import type { RootStackParamList } from '../navigation/root-navigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_GAP = 8;
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - 32 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function LibraryScreen() {
  const nav = useNavigation<NavProp>();
  const repo = useRepository();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [total, setTotal] = useState(0);

  const loadItems = useCallback(async () => {
    const result = await repo.listItems({
      search: search || undefined,
      limit: 200,
    });
    setItems(result.items);
    setTotal(result.total);
  }, [repo, search]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems]),
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const renderGridItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => nav.navigate('ComicDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.gridCover}>
        <CoverThumb imageId={item.coverImageId} />
      </View>
      <View style={styles.gridInfo}>
        <Text style={styles.gridTitle} numberOfLines={1}>{item.series}</Text>
        <Text style={styles.gridSubtitle}>#{item.issueNumber}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => nav.navigate('ComicDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.listCover}>
        <CoverThumb imageId={item.coverImageId} />
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {item.series} #{item.issueNumber}
        </Text>
        {item.publisher && <Text style={styles.listSubtitle}>{item.publisher}</Text>}
        {item.condition && <Text style={styles.listMeta}>{item.condition}</Text>}
      </View>
      {item.purchasePrice != null && (
        <Text style={styles.listPrice}>${item.purchasePrice.toFixed(2)}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search comics..."
          placeholderTextColor="#adb5bd"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Text style={styles.viewToggleText}>{viewMode === 'grid' ? '\u2630' : '\u25A6'}</Text>
        </TouchableOpacity>
      </View>

      {/* Count */}
      <Text style={styles.count}>{total} comic{total !== 1 ? 's' : ''}</Text>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No comics yet</Text>
          <Text style={styles.emptyText}>Add your first comic to get started</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => nav.navigate('ComicForm', {})}
          >
            <Text style={styles.addButtonText}>+ Add Comic</Text>
          </TouchableOpacity>
        </View>
      ) : viewMode === 'grid' ? (
        <FlatList
          data={items}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={GRID_COLUMNS}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => nav.navigate('ComicForm', {})}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function CoverThumb({ imageId }: { imageId: string | null }) {
  const repo = useRepository();
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId) return;
    let cancelled = false;
    (async () => {
      const img = await repo.getImage(imageId);
      if (img && !cancelled) {
        const url = await repo.getImageUrl(img);
        if (!cancelled && url) setUri(typeof url === 'string' ? url : null);
      }
    })();
    return () => { cancelled = true; };
  }, [imageId, repo]);

  if (!uri) {
    return (
      <View style={styles.coverPlaceholder}>
        <Text style={styles.coverPlaceholderText}>No Cover</Text>
      </View>
    );
  }

  return <Image source={{ uri }} style={styles.coverImage} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  searchRow: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 0,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  viewToggle: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  viewToggleText: { fontSize: 18 },
  count: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    color: '#868e96',
  },
  gridList: { paddingHorizontal: 12, paddingBottom: 80 },
  gridRow: { gap: GRID_GAP },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: GRID_GAP,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  gridCover: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: '#f1f3f5',
  },
  gridInfo: { padding: 8 },
  gridTitle: { fontSize: 12, fontWeight: '600', color: '#212529' },
  gridSubtitle: { fontSize: 11, color: '#868e96', marginTop: 1 },
  listList: { paddingHorizontal: 12, paddingBottom: 80 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  listCover: {
    width: 44,
    height: 60,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f1f3f5',
  },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '600', color: '#212529' },
  listSubtitle: { fontSize: 12, color: '#868e96', marginTop: 1 },
  listMeta: { fontSize: 11, color: '#adb5bd', marginTop: 1 },
  listPrice: { fontSize: 14, fontWeight: '500', color: '#495057' },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
  },
  coverPlaceholderText: { fontSize: 10, color: '#ced4da' },
  coverImage: { width: '100%', height: '100%' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#495057', marginBottom: 4 },
  emptyText: { fontSize: 14, color: '#868e96', marginBottom: 16 },
  addButton: {
    backgroundColor: '#4c6ef5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4c6ef5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4c6ef5',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
