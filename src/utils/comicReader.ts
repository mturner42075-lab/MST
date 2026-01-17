import JSZip from 'jszip';

export interface ComicPage {
  index: number;
  url: string;
  name: string;
}

/**
 * Reads a CBZ (Comic Book ZIP) file and extracts images
 */
export async function readCBZ(file: File): Promise<ComicPage[]> {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    const pages: ComicPage[] = [];

    // Get all image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const imageFiles = Object.keys(zipContent.files)
      .filter(filename => {
        const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
        return imageExtensions.includes(ext) && !filename.startsWith('__MACOSX');
      })
      .sort(); // Natural alphabetical sort

    // Extract each image
    for (let i = 0; i < imageFiles.length; i++) {
      const filename = imageFiles[i];
      const file = zipContent.files[filename];

      if (!file.dir) {
        const blob = await file.async('blob');
        const url = URL.createObjectURL(blob);

        pages.push({
          index: i,
          url,
          name: filename,
        });
      }
    }

    return pages;
  } catch (error) {
    console.error('Error reading CBZ file:', error);
    throw new Error('Failed to read comic file. Make sure it\'s a valid CBZ file.');
  }
}

/**
 * Converts a file to base64 for storage
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts base64 back to a File object
 */
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/zip';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * Cleanup function to revoke object URLs
 */
export function cleanupPages(pages: ComicPage[]): void {
  pages.forEach(page => URL.revokeObjectURL(page.url));
}
