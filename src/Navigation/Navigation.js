import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, ActivityIndicator } from 'react-native';

import HomeScreen from "../Screens/HomeScreen.js";

const Stack = createStackNavigator();

export default function Home() {
    const [isLoading, setLoading] = useState(true);
    const [isValidUser, setValidUser] = useState(false);

    useEffect(() => {
        // Simulate loading process and user validation (replace with your actual logic)
        setTimeout(() => {
            // Here you would typically check if the user is valid
            setValidUser(true); // Set this based on actual user validation
            setLoading(false); // Set loading to false once done
        }, 3000); // Example delay of 3 seconds
    }, []);

    if (isLoading) {
        // Show loading screen while loading
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text>Loading...</Text>
            </View>
        );
    }

    // After loading, choose between AuthScreens and AppScreens based on user validity
    return (
        <NavigationContainer>
            {isValidUser ? <AppScreens /> : <AuthScreens />}
        </NavigationContainer>
    );
};

function AppScreens() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
        </Stack.Navigator>
    );
};

function AuthScreens() {
    // Replace with your actual authentication screens
    return (
        <Stack.Navigator>
            <Stack.Screen name="AuthScreen" component={DummyAuthScreen} />
        </Stack.Navigator>
    );
};

// Dummy authentication screen for demonstration
function DummyAuthScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Authentication Screen</Text>
        </View>
    );
}