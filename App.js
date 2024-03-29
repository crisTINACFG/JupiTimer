import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { supabase } from './src/api/supabaseClient';
import Auth from './src/api/Auth';

import HomeScreen from './src/Screens/HomeScreen';
import Leaderboard from './src/Screens/LeaderboardScreen';
import SettingsScreen from './src/Screens/SettingsScreen';
import StatisticsScreen from './src/Screens/StatisticsScreen';

const Drawer = createDrawerNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    //when the component mounts, this fetches the current session,
    //if theres a session available, it updates it with the fetched data
    supabase.auth.getSession().then(({ data: { session } }) => {

      setSession(session);
    });
    //sets up real time listener for changes (login/out, session refresh)
    supabase.auth.onAuthStateChange((_event, session) => {

      setSession(session);
    });
    //the empty [] ensures effect runs onlu after first render
  }, []);

  function AuthenticatedApp() {
    return (
      <NavigationContainer>

        <Drawer.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            width: 150,
          },
        }}
          >
          <Drawer.Screen name="Home" component={HomeScreen} initialParams={{ session: session }} />
          <Drawer.Screen name="Statistics" component={StatisticsScreen} initialParams={{ session: session }} />
          <Drawer.Screen name="Leaderboard" component={Leaderboard} initialParams={{ session: session }} />
          <Drawer.Screen name="Settings" component={SettingsScreen} initialParams={{ session: session }} />

        </Drawer.Navigator>
        
      </NavigationContainer>
    );
  }

  if (session && session.user) {
    return <AuthenticatedApp />;
  } else {
    return <Auth />;
  }
}