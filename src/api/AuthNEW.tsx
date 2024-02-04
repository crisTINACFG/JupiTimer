import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { supabase } from './supabaseClient';
import { Button, Input } from 'react-native-elements';

export default function Auth() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [SignUp, setSignUp] = useState(true);

    return(
        <View style={styles.container}>
        <Input
          label="Email"
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
        />
        <Button/>
        <Button/>
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