import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { logout } from '../api/supabaseClient';
import { supabase } from '../api/supabaseClient';
import { Input } from 'react-native-elements';
import Avatar from '../Components/Avatar';
import MenuButton from '../Components/MenuButton';

export default function SettingsScreen({ route }) {
  const { session } = route.params;
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  //allow avatarurl to be either string or null
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);


  useEffect(() => {
    //if a user is logged in, call getProfile
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error} = await supabase //fetch the username and pfp where id==currently user id
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', session?.user.id)
        .single();
      if (error) {
        throw error;
      }

      if (data) { //if successfully fetches, set the data to the state variables
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    avatar_url, 
  }: {
    username: string;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = { //i dont need to do this but it makes it easier to visualise
        id: session?.user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates); //upset is a mixture between update and insert
      //so if there was no pfp or avatar, it creates new entry but if already exists then it updates existing entry

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteProfilePicture() {
    try {
      setLoading(true);
      setAvatarUrl(null);
      await updateProfile({ username, avatar_url: null }); //effectively delelets pfp by setting it to null but does not delete whole entry
    } 
      catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }
    
    return (
    <View style={styles.container}>

      {/* Menu button */}
      <View style={styles.menu}>
        <MenuButton/>
      </View>

        {/* Delete profile picture button */}
        <TouchableOpacity
          onPress={deleteProfilePicture}
          disabled={loading}
          style={styles.deleteprofile}>
            <Text style={styles.logoutText}>Delete Profile Picture</Text>
        </TouchableOpacity>

      {/* Profile picture */}
      <View style ={styles.avatar}>
        <Avatar
          key={avatarUrl || 'default-key'}
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url)
            updateProfile({ username, avatar_url: url })
          }}
        />
     </View>

      {/* Username interactable */}
      <View style={styles.verticallySpaced}>
        <Input label="Username" 
        value={username || ''} 
        onChangeText={(text) => setUsername(text)} 
        onSubmitEditing={() => updateProfile({ username, avatar_url: avatarUrl })} //on enter key update profile
        />
      </View>

      {/* Email display */}
      <View style={styles.verticallySpaced}>
        <Input label="Email" 
        value={session?.user?.email} 
        //disabled so user cant change email (i'd require a smtp)
        disabled /> 
      </View>
 
      {/* Logout button */}
      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({ //my styling
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
    menu:{
      position:'absolute',
      left: 0,
      top: 15,
  },
  deleteprofile:{
    padding:10,
    borderRadius:5,
    backgroundColor:'#7e65e5',
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
        backgroundColor: '#30137c',
        borderRadius: 5,
        color: 'black',
    },
    logoutText:{
      color:'white',
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
      top:40,
      borderRadius: 100,
    },
});
