import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Sheets scope
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({
  prompt: 'consent'
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache access token with localStorage persistence
let cachedAccessToken: string | null = (() => {
  try {
    return localStorage.getItem('hunter_google_sheets_token');
  } catch {
    return null;
  }
})();
let currentUser: User | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need to be refreshed through explicit sign-in if expired
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      try {
        localStorage.removeItem('hunter_google_sheets_token');
      } catch { /* ignore */ }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Sheets access token from Google sign-in.');
    }

    cachedAccessToken = credential.accessToken;
    try {
      localStorage.setItem('hunter_google_sheets_token', credential.accessToken);
    } catch { /* ignore */ }
    currentUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  currentUser = null;
};
