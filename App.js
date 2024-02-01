import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/Screens/HomeScreen.js';
import LoginScreen from './src/Screens/loginScreen.js';
import SignUpScreen from './src/Screens/signupScreen.js';
import { supabase } from './src/api/supabaseClient'; 
const Stack = createStackNavigator();

export default function App() {
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
            setAuthenticated(session ? true : false);
        });
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {authenticated ? (
                    <Stack.Screen name="Home" component={HomeScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};