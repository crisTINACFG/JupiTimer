//you do not need to mark this, i used reference from supabases examples here
//https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native?auth-store=secure-store

import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { StyleSheet, View, Alert, Image, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

export default function Avatar({ url, size = 150, onUpload }) {
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const avatarSize = { height: size, width: size };
  
    useEffect(() => {
      if (url) downloadImage(url);
    }, [url]);

    async function downloadImage(path) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);

            if (error) {
                throw error;
            }

            const fr = new FileReader();
            fr.readAsDataURL(data);
            fr.onload = () => setAvatarUrl(fr.result);
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error downloading image: ', error.message);
            }
        }
    }

    async function uploadAvatar() {
        try {
            setUploading(true);

            launchImageLibrary({
                mediaType: 'photo',
                quality: 1,
            }, async (response) => {
                if (response.didCancel || !response.assets) {
                    setUploading(false);
                    return;
                }

                const image = response.assets[0];

                if (!image.uri) {
                    throw new Error('No image uri!');
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
            <TouchableOpacity onPress={uploadAvatar} disabled={uploading}>
                {avatarUrl ? (
                    <Image
                        source={{ uri: avatarUrl }}
                        accessibilityLabel="Avatar"
                        style={[avatarSize, styles.avatar, styles.image]}
                    />
                ) : (
                    <View style={[avatarSize, styles.avatar, styles.noImage]} />
                )}
            </TouchableOpacity>
        </View>
    );
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
        borderRadius: 100,
    },
});
