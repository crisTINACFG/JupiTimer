import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { supabase } from './src/api/supabaseClient';
import Auth from './src/api/Auth';
import HomeScreen from './src/Screens/HomeScreen';
import { View } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { logout } from './src/api/supabaseClient';


export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    logout();
  }, []);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {

      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {

      setSession(session);
    });
  }, []);

  // Render the HomeScreen if there is a session, otherwise render the Auth component
  return session && session.user ? <HomeScreen /> : <View><Auth /></View>;
}
