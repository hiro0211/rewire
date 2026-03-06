import * as Sharing from 'expo-sharing';

export async function shareImageFile(fileUri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }

  const uri = fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;

  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    UTI: 'public.png',
  });
}
