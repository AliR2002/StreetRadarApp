import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { useEffect } from 'react';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Settings = ({ navigation }: RouterProps) => {
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => FIREBASE_AUTH.signOut() },
      ],
      { cancelable: false }
    );
  };

      // Customize the header style when the component is loaded
      useLayoutEffect(() => {
        navigation.setOptions({
          headerStyle: {
            backgroundColor: '#1E1E1E', // Black background for the header
          },
          headerTitleStyle: {
            color: '#fff', // White text color for the header title
          },
        });
      }, [navigation]);

      

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate('Profile')}>
        <Image source={require('../../assets/Profile.png')} style={styles.buttonImage} />
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} activeOpacity={0.8} onPress={handleLogout}>
        <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', // Dark background to match login screen
    paddingTop: 0,  // Ensure no extra space at the top of the screen
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C', // Dark button background
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 15,
    width: '90%',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonImage: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  buttonText: {
    color: '#fff', // White text for better contrast
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d', // Red for emphasis
  },
  logoutText: {
    color: '#fff', // White text for better contrast
  },
});
function useLayoutEffect(effect: () => void, deps: any[]) {
  useEffect(() => {
    effect();
  }, deps);
}

