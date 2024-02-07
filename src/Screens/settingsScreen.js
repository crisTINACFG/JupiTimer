// SettingsScreen.js
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { logout } from '../api/supabaseClient';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function settingsScreen({ onToggleSettings }) {
    return (
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
});
