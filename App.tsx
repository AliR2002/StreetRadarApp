import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/screens/Login';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import Settings from './app/screens/Settings';
import Home from './app/screens/Home';
import Map from './app/screens/Map';
import Profile from './app/screens/Profile';
import Alerts from './app/screens/Alerts';
import * as Notifications from 'expo-notifications';
import React from 'react';
import { FIREBASE_AUTH } from './FirebaseConfig';

const Stack = createNativeStackNavigator();

const InsideStack = createNativeStackNavigator();


//navigation stack for all the screens i made
function InsideLayout() {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name='Home' component={Home} />
      <InsideStack.Screen name='Settings' component={Settings} />
      <InsideStack.Screen name='Map' component={Map} />
      <InsideStack.Screen name='Profile' component={Profile} />
      <InsideStack.Screen name='Alerts' component={Alerts} />   
      </InsideStack.Navigator>
  );
}

//main app function
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => { //check if user is logged in
      console.log('user', user); //log user
      setUser(user); //set user
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        {user ? (
          <Stack.Screen name='Inside' component={InsideLayout} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}