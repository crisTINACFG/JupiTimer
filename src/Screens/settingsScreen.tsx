// SettingsScreen.js
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert  } from 'react-native';
import { logout } from '../api/supabaseClient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useState, useEffect } from 'react'
import { supabase } from '../api/supabaseClient'
import { Button, Input } from 'react-native-elements'
import { Session } from '@supabase/supabase-js'
import Avatar from '../Components/Avatar';
import { SaveAlt } from '@mui/icons-material';

export default function settingsScreen({ session ,onToggleSettings }) {
    
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    useEffect(() => {
      if (session) getProfile()
    }, [session])

    async function getProfile() {
      try {
        setLoading(true)
        if (!session?.user) throw new Error('No user on the session!')

        const { data, error, status } = await supabase
          .from('profiles')
          .select(`username, avatar_url`)
          .eq('id', session?.user.id)
          .single()
        if (error && status !== 406) {
          throw error
        }

        if (data) {
          setUsername(data.username)
          setAvatarUrl(data.avatar_url)
        }
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    async function updateProfile({
      username,
      avatar_url,
    }: {
      username: string
      avatar_url: string
    }) {
      try {
        setLoading(true)
        if (!session?.user) throw new Error('No user on the session!')

        const updates = {
          id: session?.user.id,
          username,
          avatar_url,
          updated_at: new Date(),
        }

        const { error } = await supabase.from('profiles').upsert(updates)

        if (error) {
          throw error
        }
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message)
        }
      } finally {
        setLoading(false)
      }
    }
    return (
    <View style={styles.container}>

      <View style ={styles.avatar}>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url)
            updateProfile({ username, avatar_url: url })
          }}
        />
     </View>
      
      <View style={styles.verticallySpaced}>
        <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
      </View>

      <View style={styles.verticallySpaced}>
        <Input label="Email" value={session?.user?.email} disabled />
      </View>

      <View style={styles.verticallySpaced}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>
  
      {/* Exit button */}
      <TouchableOpacity onPress={onToggleSettings} style={styles.settingsButton}>
          <Icon name="cog" size={24} color="#000" /> 
      </TouchableOpacity>

      {/* Logout button */}
      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsButton: {
        position: 'absolute', 
        top: 4,            
        right: 2,          
        padding: 7, 
        borderRadius: 5,      
      },
    logoutButton: {
        padding: 10,
        backgroundColor: 'pink',
        borderRadius: 5,
        color: 'black',
    },
    verticallySpaced: {
      paddingTop: 4,
      paddingBottom: 4,
      alignSelf: 'stretch',
    },
    mt20: {
      marginTop: 20,
    },
    avatar: {
      position: 'absolute', 
      top:10,
      left:10,
      borderRadius: 100,
    },
});
