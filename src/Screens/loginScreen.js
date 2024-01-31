import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { supabase } from '../api/supabaseClient';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            console.log('Attempting to log in with:', email, password);
            const { user, error } = await supabase.auth.signIn({ email, password });

            if (error) {
                console.error('Login error:', error);
                throw error;
            }

            console.log('Login successful, user:', user);
            if (user) navigation.replace('Home');
        } catch (error) {
            console.error('Login exception:', error);
            alert(error.message);
        }
    }; 

    return (
        <View>
            <TextInput placeholder="Email" onChangeText={setEmail} value={email} />
            <TextInput placeholder="Password" onChangeText={setPassword} value={password} secureTextEntry />
            <Button title="Login" onPress={handleLogin} />
            <Button title="Go to Signup" onPress={() => navigation.navigate('SignUp')} />
        </View>
    );
}

console.log('Supabase client:', supabase);
console.log('Supabase auth:', supabase.auth);
