import { View, Text, Alert, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React, { useState } from 'react';
import { NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateEmail, sendEmailVerification } from 'firebase/auth';
import { useEffect } from 'react';


interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Profile = ({ navigation }: any) => {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const user = FIREBASE_AUTH.currentUser;

      //customise the header style when the component is loaded
      useLayoutEffect(() => {
        navigation.setOptions({
          headerStyle: {
            backgroundColor: '#323233', //black background for the header
          },
          headerTitleStyle: {
            color: '#fff', //white text color for the header title
          },
        });
      }, [navigation]);

  //function to handle user account deletion
  const deleteUserAccount = async () => { //function to delete user account
    if (user) {
      try {
        await user.delete(); //delete the user account
        Alert.alert('Account deleted', 'Your account has been deleted successfully.'); //success message
        navigation.navigate('Settings'); //go to the settings screen after deletion
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          Alert.alert('Error', 'Please re-login and try again.');
        } else {
          Alert.alert('Error', error.message);
        }
      }
    }
  };

  //confirm account deletion
  const confirmDeleteAccount = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => setConfirmVisible(false), style: 'cancel' },
        { text: 'Delete', onPress: deleteUserAccount, style: 'destructive' },
      ],
      { cancelable: false }
    );
  };

  //function to handle password change
  const changePassword = async () => {
    if (user) {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword); //make a credential using the current password
      try {
        await reauthenticateWithCredential(user, credential); //reauthenticate the user
        await updatePassword(user, newPassword); //update the password
        Alert.alert('Password changed', 'Your password has been changed successfully.'); //show success message
        setPasswordModalVisible(false); //close the modal
        setNewPassword(''); //clear the new password field
        setCurrentPassword(''); //clear the current password field
      } catch (error: any) { //if there are any errors then show the error message
        Alert.alert('Error', error.message);
      }
    }
  };

  //function to handle email change
  const changeEmail = async () => { 
    if (user) {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      try {
        await reauthenticateWithCredential(user, credential);
        await sendEmailVerification(user);
        Alert.alert('Verification email sent', 'Please verify your new email address and then try updating it again.');
        setEmailModalVisible(false);
        setNewEmail('');
        setCurrentPassword('');
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
  };

  //this component is used to create buttons with an icon and text
  const CustomButton = ({ title, onPress, color, icon }: { title: string; onPress: () => void; color: string; icon?: any }) => (
      <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
        {icon && <Image source={icon} style={styles.buttonImage} />}
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    );

  function useLayoutEffect(effect: () => void, deps: any[]) {
    useEffect(() => {
      effect();
    }, deps);
  }
  

  return (
    <View style={styles.container}>


      <Image source={require('../../assets/logo.png')} style={styles.logo} />


      {user && <Text style={styles.emailText}>Email: {user.email}</Text>}
      <CustomButton
        title="Change Email"
        onPress={() => setEmailModalVisible(true)} //open the email modal
        color="#2C2C2C"
        icon={require('../../assets/Email.png')}
      />
      <CustomButton
        title="Change Password"
        onPress={() => setPasswordModalVisible(true)} //open the password modal
        color="#2C2C2C"
        icon={require('../../assets/Password.png')}
      />     
      <CustomButton 
        title="Delete Account" 
        onPress={confirmDeleteAccount}  //open the delete account modal
        color="#ff4d4d" 
        icon={require('../../assets/Delete.png')} 
        />

      {passwordModalVisible && (
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Change Password</Text>
          <TextInput style={styles.input} placeholder="Current Password" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
          <TextInput style={styles.input} placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <View style={styles.buttonContainer}>
          <CustomButton title="Save" onPress={changePassword} color="#27ae60" />
          <CustomButton title="Cancel" onPress={() => setPasswordModalVisible(false)} color="#95a5a6" />
        </View>

        </View>
      )}

      {emailModalVisible && (
        <View style={styles.modalView}>
          <Image source={require('../../assets/Email.png')} style={styles.buttonImage} />
          <Text style={styles.modalText}>Change Email</Text>
          <TextInput style={styles.input} placeholder="Current Password" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
          <TextInput style={styles.input} placeholder="New Email" value={newEmail} onChangeText={setNewEmail} />
          <View style={styles.buttonContainer}>
          <CustomButton title="Save" onPress={changeEmail} color="#27ae60" />
          <CustomButton title="Cancel" onPress={() => setEmailModalVisible(false)} color="#95a5a6" />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', // Dark background to match login screen
    paddingTop: 0,  // Ensure no extra space at the top of the screen
    paddingHorizontal: 20,
  },
  emailText: { 
    fontSize: 25, 
    marginBottom: 20,
     fontWeight: 'bold', 
     color: 'white' 
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
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  modalView: {
    margin: 20,
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",  //content is centered
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },  
  buttonContainer: {
    flexDirection: "row", //arrange buttons horizontally
    justifyContent: "space-between", //ensure space between them
    width: "100%", //take full width of the modal
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 30,
    paddingBottom: 10,
    
  },  
  modalText: { 
    marginBottom: 15, 
    textAlign: "center", 
    fontWeight: 'bold', 
    fontSize: 18, 
    color: '#fff' 
  },
  input: {
    height: 40,
    borderColor: "gray", 
    borderWidth: 1,
    marginBottom: 10,
    width: 200,
    paddingHorizontal: 10,
    borderRadius: 50,
    color: '#fff', //white text inside inputs
  },
  buttonImage: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  logo: {
    width: 600,
    height: 150,
    marginTop: 10,
  },
});

export default Profile;
