import { Share } from 'react-native';

export async function shareWithImage(
  text: string,
  fileUri: string,
): Promise<void> {
  const uri = fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;

  await Share.share({
    message: text,
    url: uri,
  });
}
