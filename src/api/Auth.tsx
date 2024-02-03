import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { supabase } from './supabaseClient';
import { Button, Input } from 'react-native-elements';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // Updated to camelCase
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isDisplayNameScreen, setIsDisplayNameScreen] = useState(false); // Updated to camelCase

  async function signInWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else if (data && data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('displayName') // Updated to match your table column name
        .eq('id', data.user.id);

      if (profileError) {
        Alert.alert(profileError.message);
      } else if (!profileData || profileData.length === 0 || !profileData[0].displayName) {
        setIsDisplayNameScreen(true);
      }
    }
    setLoading(false);
  }

  async function updateDisplayName() { // Updated to camelCase
    setLoading(true);
    const user = supabase.auth.user();

    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        displayName: displayName, // Updated to match your table column name
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

  async function signUpWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('Please check your inbox for email verification!');
      setIsDisplayNameScreen(true);
    }
    setLoading(false);
  }

  function toggleAuthState() {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setDisplayName(''); // Clear display name when toggling auth state
  }

  if (isDisplayNameScreen) {
    return (
      <View style={styles.container}>
        <Input
          label="Display Name"
          onChangeText={setDisplayName} // Updated to camelCase
          value={displayName} // Updated to camelCase
          placeholder="Enter your display name"
          autoCapitalize='none'
        />
        <Button title="Set Display Name" disabled={loading} onPress={updateDisplayName} /> 
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      {isSignUp ? (
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
          <Button title="Already have an account?" type="clear" onPress={toggleAuthState} />
        </View>
      ) : (
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
          <Button title="Create account" type="clear" onPress={toggleAuthState} />
        </View>
      )}
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
})
