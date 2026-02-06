import React from 'react';
import { Text } from 'react-native';

// Simple text-based icon replacement to avoid @expo/vector-icons dependency issues in monorepo
// In production, replace with @expo/vector-icons/Ionicons

const iconMap: Record<string, string> = {
  book: '\u{1F4DA}',
  barcode: '\u{1F4F7}',
  settings: '\u{2699}',
  add: '+',
  search: '\u{1F50D}',
  grid: '\u{25A6}',
  list: '\u{2630}',
  camera: '\u{1F4F7}',
  image: '\u{1F5BC}',
  trash: '\u{1F5D1}',
  close: '\u{2715}',
  back: '\u{2190}',
  filter: '\u{25BD}',
};

interface IoniconsProps {
  name: string;
  size?: number;
  color?: string;
}

export function Ionicons({ name, size = 24, color = '#000' }: IoniconsProps) {
  return (
    <Text style={{ fontSize: size * 0.7, color, textAlign: 'center' }}>
      {iconMap[name] || '?'}
    </Text>
  );
}
