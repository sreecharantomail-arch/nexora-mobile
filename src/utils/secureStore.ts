import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function saveToken(key: string, value: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getToken(key: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }
  return await SecureStore.getItemAsync(key);
}

export async function deleteToken(key: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}