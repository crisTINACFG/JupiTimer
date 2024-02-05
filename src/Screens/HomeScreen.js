import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Stopwatch from '../Components/Stopwatch';
import SettingsScreen from './settingsScreen';

export default function HomeScreen() {
    const [settingsToggle, setSettingsToggle] = useState(false);

    const handleToggleSettings = () => {
        setSettingsToggle(!settingsToggle);
      };

    return (
        <View style={styles.container}>
            <Stopwatch />
            
            <TouchableOpacity onPress={handleToggleSettings} style={styles.settingsButton}>
                <Text>Settings</Text>
            </TouchableOpacity>

            {settingsToggle && (<SettingsScreen onToggleSettings = {handleToggleSettings}/>)}
            {/*If settingsToggle is true then render settingsScreen*/}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
      settingsButton: {
        position: 'absolute', 
        top: 4,            
        right: 2,          
        padding: 7, 
        backgroundColor:'pink',  
        borderRadius: 5,      
      },
});