import JSZip from 'jszip';
import type { ExportData } from '@comic-catalog/core';

export async function createExportZip(
  data: ExportData,
  getImageData: (platformRef: string) => Promise<Uint8Array | null>,
): Promise<Uint8Array> {
  const zip = new JSZip();

  zip.file('data.json', JSON.stringify(data, null, 2));

  const imagesFolder = zip.folder('images');
  if (imagesFolder) {
    for (const image of data.images) {
      const imageData = await getImageData(image.platformRef);
      if (imageData) {
        const ext = mimeToExt(image.mime);
        imagesFolder.file(`${image.id}.${ext}`, imageData);
      }
    }
  }

  const zipBytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  return zipBytes;
}

export async function parseImportZip(
  zipBytes: Uint8Array,
): Promise<{
  data: ExportData;
  images: Map<string, Uint8Array>;
}> {
  const zip = await JSZip.loadAsync(zipBytes);

  const dataFile = zip.file('data.json');
  if (!dataFile) {
    throw new Error('Invalid backup: missing data.json');
  }

  const dataJson = await dataFile.async('string');
  const data = JSON.parse(dataJson) as ExportData;

  if (!data.version || data.version !== 1) {
    throw new Error('Invalid backup version');
  }

  const images = new Map<string, Uint8Array>();
  const imagesFolder = zip.folder('images');
  if (imagesFolder) {
    const imageFiles = imagesFolder.filter(() => true);
    for (const file of imageFiles) {
      const imageBytes = await file.async('uint8array');
      const filename = file.name.split('/').pop() || '';
      const imageId = filename.replace(/\.[^.]+$/, '');
      images.set(imageId, imageBytes);
    }
  }

  return { data, images };
}

export function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mime] || 'jpg';
}

export function extToMime(ext: string): string {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  };
  return map[ext.toLowerCase()] || 'image/jpeg';
}
