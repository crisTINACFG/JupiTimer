import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, TouchableOpacity, Text} from 'react-native'
import { supabase } from './supabaseClient'
import { Button, Input } from 'react-native-elements'
import { TOUCHABLE_STATE } from 'react-native-gesture-handler/lib/typescript/components/touchables/GenericTouchable'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { data: { session }, error, } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', size:20, name: 'envelope', color: '#30137c' }} 
          onChangeText={(text) => setEmail(text)}
          value={email}
          style={styles.inputs}
          placeholder="Email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', size:27, name: 'lock', color: '#30137c' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          style={styles.inputs}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.button, styles.login]}>

        <TouchableOpacity onPress={() => signInWithEmail()}>
          <Text style={[styles.whiteText, styles.centerText]}>Log in</Text>
        </TouchableOpacity>

      </View>

      <View style={[styles.verticallySpaced, styles.button, styles.register]}>
        <TouchableOpacity onPress={() => signUpWithEmail()}>
          <Text style={[styles.whiteText, styles.centerText]}>Register</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flex: 1,
    backgroundColor: '#eeeafa',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  inputs:{
    fontWeight:'bold',
    fontSize: 18,
    color:'#30137c',
  },
  button:{
    borderRadius:10,
    paddingTop: 15,

    borderWidth: 1,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
  },
  whiteText: {
    color:'#eeeafa',
    fontWeight:'bold',
    fontSize: 16,
  },
  centerText:{
    position:'relative',
    textAlign:'center',
    bottom:5,
  },
  login:{
    backgroundColor:'#30137c',
  },
  register:{
    backgroundColor:'#7e65e5',
  },
  mt20: {
    marginTop: 200,
  }
})