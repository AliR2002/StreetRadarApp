import React, { useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Home = ({ navigation }: RouterProps) => {
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
      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate('Map')}>
        <Image source={require('../../assets/Map.png')} style={styles.buttonImage} />
        <Text style={styles.buttonText}>Map</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate('Alerts')}>
        <Image source={require('../../assets/Alerts.png')} style={styles.buttonImage} />
        <Text style={styles.buttonText}>Alerts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate('Settings')}>
        <Image source={require('../../assets/Settings.png')} style={styles.buttonImage} />
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { //container style
    flex: 1,
    justifyContent: 'center', // Center the content
    alignItems: 'center', // Center horizontally
    backgroundColor: '#1E1E1E', // Black background
    paddingTop: 0, 
    paddingHorizontal: 20,
  },
  button: { //button style
    flexDirection: 'row',
    alignItems: 'center', 
    backgroundColor: '#2C2C2C', // Dark button background
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 15,
    width: '100%',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 10, // Shadow on Android
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonImage: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
