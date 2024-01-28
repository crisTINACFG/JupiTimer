import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { supabase } from '../api/supabaseClient';

export default function SignUpScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user_id, setUserId] = useState(''); // Add user_id state

    const handleSignUp = async () => {
        const { user, error } = await supabase.auth.signUp({ email, password });
        if (error) alert(error.message);
        if (user) {
            // After signup, update the user_id in the database
            const { error: dbError } = await supabase
                .from('Users')
                .upsert([{ email, user_id }], { returning: 'minimal' });

            if (dbError) {
                alert('Database error saving new user.');
            } else {
                navigation.replace('Home');
            }
        }
    };

    return (
        <View>
            <TextInput
                placeholder="Username" // Add input for user_id
                onChangeText={setUserId}
                value={user_id}
            />
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
