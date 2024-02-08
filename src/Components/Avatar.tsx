import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { StyleSheet, View, Alert, Image, Button, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker'; // Import from react-native-image-picker

interface Props {
  size: number;
  url: string | null;
  onUpload: (filePath: string) => void;
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const avatarSize = { height: size, width: size };
  
    useEffect(() => {
      if (url) downloadImage(url);
    }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)

      if (error) {
        throw error
      }

      const fr = new FileReader()
      fr.readAsDataURL(data)
      fr.onload = () => {
        setAvatarUrl(fr.result as string)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message)
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true);

      // Use launchImageLibrary from react-native-image-picker
      launchImageLibrary({
        mediaType: 'photo', // Restrict to only images
        quality: 1,
      }, async (response) => {
        if (response.didCancel || !response.assets) {
          console.log('User cancelled image picker.');
          setUploading(false);
          return;
        }

        const image = response.assets[0];
        console.log('Got image', image);

        if (!image.uri) {
          throw new Error('No image uri!'); // Realistically, this should never happen, but just in case...
        }

        const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

        const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
        const path = `${Date.now()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, arraybuffer, {
            contentType: image.type ?? 'image/jpeg',
          });

        if (uploadError) {
          throw uploadError;
        }

        onUpload(data.path);
        setUploading(false);
      });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
      setUploading(false);
    }
  } 

  return (
    <View>
      {avatarUrl ? (
        <TouchableOpacity onPress={uploadAvatar}
        disabled={uploading}>
            <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
        />
        </TouchableOpacity>
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]} />
      )}
      
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 100,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  image: {
    objectFit: 'cover',
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgb(200, 200, 200)',
    borderRadius: 5,
  },
})