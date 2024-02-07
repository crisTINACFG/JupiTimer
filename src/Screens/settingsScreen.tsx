// SettingsScreen.js
import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Button, Input } from 'react-native-elements'
import { logout } from '../api/supabaseClient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../api/supabaseClient'
import { Session } from '@supabase/supabase-js'

export default function settingsScreen({ onToggleSettings, session }: { onToggleSettings: () => void; session: Session }) {

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
        <View style = {styles.container}>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input label="Email" value={session?.user?.email} disabled />
            </View>

            <View style={styles.verticallySpaced}>
                <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
            </View>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                title={loading ? 'Loading ...' : 'Update'}
                onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
                disabled={loading}
                />
            </View>

            <View style={styles.container}>
                {/* Exit button */}
                <TouchableOpacity onPress={onToggleSettings} style={styles.settingsButton}>
                    <Icon name="cog" size={24} color="#000" /> 
                </TouchableOpacity>

                {/* Logout button */}
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Text>Logout</Text>
                </TouchableOpacity>
            </View>
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
        position: 'absolute',
        bottom:20,
        left:20,
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
