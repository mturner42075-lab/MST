import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRepository } from '@comic-catalog/ui';
import type { RootStackParamList } from '../navigation/root-navigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function ScannerScreen() {
  const nav = useNavigation<NavProp>();
  const repo = useRepository();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const lastScanRef = useRef<string>('');
  const debounceRef = useRef<number>(0);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    const now = Date.now();
    // Debounce: ignore same code within 3 seconds
    if (data === lastScanRef.current && now - debounceRef.current < 3000) {
      return;
    }

    lastScanRef.current = data;
    debounceRef.current = now;
    setScanned(true);

    // Haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Look up in local DB
    const existing = await repo.findItemByBarcode(data);

    if (existing) {
      nav.navigate('ComicDetail', { id: existing.id });
    } else {
      Alert.alert(
        'Barcode Scanned',
        `Barcode: ${data}\n\nNot found in your collection. Add as new comic?`,
        [
          { text: 'Cancel', onPress: () => setScanned(false), style: 'cancel' },
          {
            text: 'Add Comic',
            onPress: () => nav.navigate('ComicForm', { barcode: data }),
          },
        ],
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permText}>
          We need camera access to scan barcodes on your comics.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <Text style={styles.hint}>Point camera at a barcode</Text>
      </View>

      {scanned && (
        <View style={styles.rescanRow}>
          <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
            <Text style={styles.rescanText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const CORNER_SIZE = 20;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 32,
  },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 260,
    height: 160,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  topLeft: {
    top: 0, left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: '#4c6ef5',
  },
  topRight: {
    top: 0, right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: '#4c6ef5',
  },
  bottomLeft: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: '#4c6ef5',
  },
  bottomRight: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: '#4c6ef5',
  },
  hint: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    textShadowColor: '#000',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  rescanRow: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  rescanBtn: {
    backgroundColor: '#4c6ef5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  rescanText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  permTitle: { fontSize: 18, fontWeight: '700', color: '#212529', marginBottom: 8 },
  permText: { fontSize: 14, color: '#868e96', textAlign: 'center', marginBottom: 20 },
  permBtn: {
    backgroundColor: '#4c6ef5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
