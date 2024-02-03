import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import Stopwatch from '../Components/Stopwatch';
import { logout } from '../api/supabaseClient';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Stopwatch />
            <Pressable onPress={logout} style={styles.logoutButton}>
                 <Text>Logout</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // Ensure the background color matches across screens
    },
    logoutButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'red', // Choose a suitable color
        borderRadius: 5,
      },
      
});