import * as FileSystem from 'expo-file-system';

export const getFileSize = async (uri: string): Promise<number> => {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) return 0;
  return fileInfo.exists ? fileInfo.size || 0 : 0;
}; 