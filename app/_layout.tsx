import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import { ThemeProvider } from '@/components/ThemeContext';
import SignUpScreen from './signup'; // adjust path if needed
import { VoiceProvider } from '@/components/VoiceContext';

function RootLayoutNav() {
  const { session, loading } = useAuth();

  if (loading) {
    // Optionally show a splash/loading screen
    return null;
  }

  if (!session) {
    // Not logged in: show sign-up
    return <SignUpScreen />;
  }

  // Logged in: show the main app (Stack, Tabs, etc.)
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <VoiceProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </VoiceProvider>
  );
}