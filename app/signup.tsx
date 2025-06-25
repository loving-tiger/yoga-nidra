import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '@/services/SupabaseService';
import { useTheme } from '@/components/ThemeContext';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const { colors, themeColor } = useTheme();
  const { session } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect to index page if logged in
  useEffect(() => {
    if (session) {
      router.replace('/');
    }
  }, [session, router]);

  const handleAuth = async () => {
    setError('');
    setSuccess('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Account created! You are now signed in.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Signed in!');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: themeColor }]}>
        {mode === 'signup' ? 'Create Account' : 'Sign In'}
      </Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mode === 'signup' && { backgroundColor: themeColor + '22' },
          ]}
          onPress={() => setMode('signup')}
        >
          <Text style={[styles.toggleText, { color: themeColor }]}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mode === 'signin' && { backgroundColor: themeColor + '22' },
          ]}
          onPress={() => setMode('signin')}
        >
          <Text style={[styles.toggleText, { color: themeColor }]}>Sign In</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: themeColor }]}
        placeholder="Email"
        placeholderTextColor={colors.text + '99'}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: themeColor }]}
        placeholder="Password"
        placeholderTextColor={colors.text + '99'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeColor }]}
        onPress={handleAuth}
        activeOpacity={0.85}
      >
        <Text style={[styles.buttonText, { color: colors.buttonText }]}>
          {mode === 'signup' ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 32,
    letterSpacing: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0000',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    fontSize: 17,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  error: {
    color: '#B91C1C',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  success: {
    color: '#059669',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
});
