import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { supabase } from './supabaseClient';
import { Button, Input } from 'react-native-elements';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isDisplayNameScreen, setIsDisplayNameScreen] = useState(false);
  const [userConfirmed, setUserConfirmed] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setUserConfirmed(true);
        checkDisplayName(session.user);
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  }, [isSignUp]);

  async function handleAuthAction() {
    setLoading(true);
    const action = isSignUp ? supabase.auth.signUp : supabase.auth.signIn;
    const { data, error } = await action({ email, password });

    if (error) {
      Alert.alert(error.message);
    } else if (data?.user && isSignUp && !userConfirmed) {
      Alert.alert('Please check your email to confirm your account.');
      await checkDisplayName(data.user);
    }
    setLoading(false);
  }

  async function checkDisplayName(user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('displayName')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      Alert.alert(error.message);
    } else if (!profile) {
      setIsDisplayNameScreen(true);
    } else {
      setIsDisplayNameScreen(false);
    }
  }

  async function updateDisplayName() {
    setLoading(true);
    const user = supabase.auth.user();

    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        displayName,
      });

      if (error) {
        Alert.alert(error.message);
      } else {
        Alert.alert('Display name set successfully!');
        setIsDisplayNameScreen(false);
      }
    } else {
      Alert.alert('No user is signed in.');
    }
    setLoading(false);
  }

  function toggleAuthState() {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setDisplayName('');
    setUserConfirmed(false);
  }

  if (isDisplayNameScreen) {
    return (
      <View style={styles.container}>
        <Input
          label="Display Name"
          onChangeText={setDisplayName}
          value={displayName}
          placeholder="Enter your display name"
          autoCapitalize="none"
        />
        <Button title="Set Display Name" disabled={loading} onPress={updateDisplayName} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        leftIcon={{ type: 'font-awesome', name: 'envelope' }}
        onChangeText={setEmail}
        value={email}
        placeholder="email@address.com"
        autoCapitalize="none"
      />
      <Input
        label="Password"
        leftIcon={{ type: 'font-awesome', name: 'lock' }}
        onChangeText={setPassword}
        value={password}
        secureTextEntry={true}
        placeholder="Password"
        autoCapitalize="none"
      />
      <Button
        title={isSignUp ? "Sign Up" : "Sign In"}
        disabled={loading}
        onPress={handleAuthAction}
      />
      <Button
        title={isSignUp ? "Already have an account?" : "Create account"}
        type="clear"
        onPress={toggleAuthState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
