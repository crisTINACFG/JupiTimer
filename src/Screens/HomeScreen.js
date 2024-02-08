import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Stopwatch from '../Components/Stopwatch';
import SettingsScreen from './settingsScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function HomeScreen({ session }) {
    const [settingsToggle, setSettingsToggle] = useState(false);

    const handleToggleSettings = () => {
        setSettingsToggle(!settingsToggle);
      };

    return (
        <View style={styles.container}>
            <Stopwatch />
            
            <TouchableOpacity onPress={handleToggleSettings} style={styles.settingsButton}>
                <Icon name="cog" size={24} color="#000" /> 
            </TouchableOpacity>

            {settingsToggle && (<SettingsScreen session={session} onToggleSettings = {handleToggleSettings}/>)}
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
        borderRadius: 5,      
      },
});