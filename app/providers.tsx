// Client-side providers: Firebase Auth context and theme provider.
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider } from "next-themes";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Toaster } from "@/components/ui/sonner";
import { syncUserProfile } from "@/lib/user-profile";

// Auth context shape.
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInAsGuest: async () => {},
  signOutUser: async () => {},
});

// Hook to access auth state from any client component.
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider that listens to Firebase auth state changes.
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to auth state on mount.
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      // Firebase not configured — skip auth.
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

       if (firebaseUser) {
         // Fire-and-forget profile sync; errors are logged in the helper.
         void syncUserProfile(firebaseUser);
       }
    });
    return unsubscribe;
  }, []);

  // Google sign-in via popup.
  async function signInWithGoogle() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  // Anonymous guest sign-in.
  async function signInAsGuest() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signInAnonymously(auth);
  }

  // Sign out the current user.
  async function signOutUser() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInAsGuest, signOutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Root providers wrapper — wraps auth + theme + toast.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        {children}
        <Toaster richColors position="bottom-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
