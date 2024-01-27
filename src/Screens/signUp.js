import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { supabase } from '../api/supabaseClient';

export default function SignUpScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        const { user, error } = await supabase.auth.signUp({ email, password });
        if (error) alert(error.message);
        if (user) navigation.replace('Home');
    };

    return (
        <View>
            <TextInput 
                placeholder="Email" 
                onChangeText={setEmail} 
                value={email}
            />
            <TextInput 
                placeholder="Password" 
                onChangeText={setPassword} 
                value={password} 
                secureTextEntry
            />
            <Button title="Sign Up" onPress={handleSignUp} />
            <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
        </View>
    );
}
