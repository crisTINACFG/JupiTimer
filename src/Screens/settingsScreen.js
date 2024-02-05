// SettingsScreen.js
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { logout } from '../api/supabaseClient';

export default function settingsScreen({ onToggleSettings }) {
    return (
        <View style={styles.container}>
            {/* Exit button */}
            <TouchableOpacity onPress={onToggleSettings} style={styles.exitButton}>
                <Text>X</Text>
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
    exitButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
    },
    logoutButton: {
        padding: 10,
        backgroundColor: 'pink',
        borderRadius: 5,
    },
});
