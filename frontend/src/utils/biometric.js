import { Capacitor } from '@capacitor/core';
import { AccessControl, NativeBiometric } from '@capgo/capacitor-native-biometric';

export const BIOMETRIC_SERVER = 'com.borhsdata.app';
const BIOMETRIC_ACCOUNT_KEY = 'borhs_biometric_account_id';

export const getUserAccountId = (user) => String(user?._id || user?.id || '');

export function getBiometricAccountId() {
  return localStorage.getItem(BIOMETRIC_ACCOUNT_KEY) || '';
}

export async function clearBiometricCredentials() {
  if (Capacitor.isNativePlatform()) {
    await NativeBiometric.deleteCredentials({ server: BIOMETRIC_SERVER }).catch(() => {});
  }
  localStorage.removeItem(BIOMETRIC_ACCOUNT_KEY);
}

export async function invalidateBiometricsForDifferentAccount(user) {
  if (!Capacitor.isNativePlatform()) return false;

  const saved = await NativeBiometric.isCredentialsSaved({ server: BIOMETRIC_SERVER });
  if (!saved.isSaved) {
    localStorage.removeItem(BIOMETRIC_ACCOUNT_KEY);
    return false;
  }

  const accountId = getUserAccountId(user);
  const biometricAccountId = getBiometricAccountId();
  if (!accountId || biometricAccountId !== accountId) {
    await clearBiometricCredentials();
    return true;
  }
  return false;
}

export async function activateBiometricsForAccount({ user, identifier, password }) {
  const accountId = getUserAccountId(user);
  if (!accountId) throw new Error('The account could not be identified.');

  await NativeBiometric.setCredentials({
    username: identifier,
    password,
    server: BIOMETRIC_SERVER,
    accessControl: AccessControl.BIOMETRY_CURRENT_SET,
  });
  localStorage.setItem(BIOMETRIC_ACCOUNT_KEY, accountId);
}

