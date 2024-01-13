import React from 'react';
import { View, StyleSheet } from 'react-native';
import Stopwatch from "../Components/Stopwatch";

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Stopwatch />
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
});
