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
    //when the component mounts, this fetches the current session,
    //if theres a session available, it updates the 'session' with the fetched data
    supabase.auth.getSession().then(({ data: { session } }) => {

      setSession(session);
    });
    //sets up real-time listener for auth state changes (login/out, session refresh)
    supabase.auth.onAuthStateChange((_event, session) => {

      setSession(session);
    });
    //useEffect(() => { ... }, []); the empty [] ensures effect runs onlu after initial render
  }, []);

  // 'session && session.user' way to determine if a user is currently authenticated
  return session && session.user ? <HomeScreen /> : <View><Auth/></View>;
}
