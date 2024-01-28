import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { supabase } from '../api/supabaseClient'; 

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const { user, error } = await supabase.auth.signIn({ email, password });
        if (error) alert(error.message);
        if (user) navigation.replace('Home');
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