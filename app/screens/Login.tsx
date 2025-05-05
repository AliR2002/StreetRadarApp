import { View, Text, StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


//constant variables that cant be changed
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); 
    const auth = FIREBASE_AUTH;


    const signIn = async () => { //sign in function
        setLoading(true); //loading circle
        try {
            const response = await signInWithEmailAndPassword(auth, email, password); //sign in with email and password
            console.log(response); //log response
        } catch (error: any) {
            console.log(error);
            alert('Sign in failed: ' + error.message); //alert sign in failed
        } finally {
            setLoading(false); //stop loading circle
        }
    };

    const signUp = async () => { //sign up function
        if (!termsAccepted) {
            alert('You must accept the Terms & Conditions to sign up.'); //alert if terms not accepted
            return; //stop execution if terms are not accepted
        }

        setLoading(true); //loading circle
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password); //create user with email and password
            console.log(response);
            alert('Sign up successful!');
        } catch (error: any) {
            console.log(error);
            alert('Sign up failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} />
            </View>
            
            <View style={styles.header}>
                <Text style={styles.motto}>Never Feel Lost — Stay Informed, Stay Secure.</Text>
            </View>


            <KeyboardAvoidingView behavior="padding" style={styles.form}>
                <TextInput
                    value={email}
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                />
                <TextInput
                    secureTextEntry
                    value={password}
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    autoCapitalize="none"
                    onChangeText={setPassword}
                />
                {loading ? (
                    <ActivityIndicator size="large" color="#fffffff" /> //loading circle when logging in
                ) : (
                    <>
                        <TouchableOpacity onPress={signIn} style={styles.button}>
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={signUp} style={[styles.button, styles.signupButton]}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>Do you accept our Terms of Service?</Text>
                    <TouchableOpacity
                        onPress={() => setTermsAccepted(!termsAccepted)}
                        style={[styles.button, { backgroundColor: termsAccepted ? '#3bb037' : '#C70039' }]} // change colour based on yes or no 
                    >
                        <Text style={styles.buttonText}>{termsAccepted ? 'Yes' : 'No'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.linkButton}>
                        <Text style={styles.termsLink}>View Terms of Service</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView contentContainerStyle={styles.modalScroll}>
                            <Text style={styles.termsTextHeader}>Terms of Service</Text> 
                            <Text style={styles.termsContent}>
                            StreetRadar – Terms of Service & Privacy Policy
                            Effective Date: 19/03/2025

                            Welcome to StreetRadar, a community-based app for real-time incident awareness. By creating an account or using the app, you agree to the following Terms of Service and acknowledge our Privacy Policy.

                            1. Terms of Service
                            1.1 User Accounts
                            To use StreetRadar features, users must register with accurate information. You are responsible for maintaining the confidentiality of your login details and for all activity under your account.

                            1.2 User-Generated Content
                            You may upload incident reports, photos, and location data. By submitting content, you grant StreetRadar a non-exclusive, royalty-free license to display and use it for the app’s functionality.

                            You must not upload content that:

                            Violates laws or regulations.

                            Contains hate speech, explicit material, or harassment.

                            Is false or misleading (e.g. fake crime reports).

                            Infringes on the rights of others.

                            StreetRadar may remove any content at its discretion.

                            1.3 Prohibited Uses
                            You agree not to:

                            Upload false or harmful data.

                            Impersonate others or mislead users.

                            Use the app for illegal surveillance or harassment.

                            Attempt to access or modify data you don’t own.

                            1.4 Reporting Crimes
                            StreetRadar is not a replacement for official reporting. Serious incidents should be reported directly to law enforcement. The app simply helps raise community awareness.

                            1.5 Accuracy of Information
                            We cannot guarantee that all user-submitted content is accurate or verified. Use the app as a community insight tool, not as an official source of crime data.

                            1.6 Account Termination
                            We reserve the right to suspend or delete accounts that violate these Terms. You may also delete your account at any time by contacting us.

                            1.7 Changes to Terms
                            We may update these Terms. Continued use after updates indicates your agreement to the new version.

                            1.8 Disclaimers & Limitations
                            StreetRadar is provided "as is." We do not guarantee it will always be available, error-free, or secure. We are not liable for indirect or consequential damages from use of the app.

                            1.9 Governing Law
                            These Terms are governed by UK law. Legal disputes will be resolved in the courts of the United Kingdom.
                            2. Privacy Policy
                            StreetRadar is committed to protecting your privacy and data.

                            2.1 Information We Collect
                            We collect:

                            Account data (email, username).

                            Location data (when reporting incidents).

                            User-uploaded content (images, markers, descriptions).

                            2.2 How We Use Your Data
                            Your data is used to:

                            Display reports on the map.

                            Notify users of nearby incidents.

                            Securely authenticate your account.

                            We do not sell or share personal data with advertisers.

                            2.3 Data Storage
                            Your data is stored securely using Firebase, which complies with strict cloud security standards. Only verified users can upload content, and each user can manage or delete their own markers.

                            2.4 Your Rights
                            You may:

                            Request deletion of your account and data.

                            Contact us about data concerns at streetradar@gmail.com.

                            2.5 Location Permissions
                            We only access your location while using the app (for placing markers) and with your permission. You can disable location services in your device settings at any time.

                            2.6 Security
                            We use Firebase Authentication to ensure that accounts are secure and protected from spam, bots, and abuse.

                            By registering or using StreetRadar, you confirm that you have read, understood, and agreed to these Terms of Service and Privacy Policy.

                            📩 Contact: streetradar@gmail.com

                            </Text>
                        </ScrollView>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Login;

//stylesheet design and stuff

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E', //dark background
        padding: 10,
    },
    header: {
        alignItems: 'center', //center the logo
        marginBottom: 10, //space between logo and form
    },
    motto: {
        fontSize: 16,   
        color: '#555',  //subtle grey to fit the theme
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
    },    
    logo: { //logo image size
        width: 600,
        height: 300,
    },
    form: {
        width: '100%',
    },
    input: {
        width: '100%',
        height: 50,
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#2C2C2C',
        color: 'white',
        fontSize: 16,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#6f7996', //red login button
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
        elevation: 3,
    },
    signupButton: {
        backgroundColor: '#6f7996', //green sign up button
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    termsContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    termsText: {
        color: 'white',
        fontSize: 15,
    },
    linkButton: {
        marginTop: 10,
    },
    termsLink: {
        color: '#4A90E2',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', //dark overlay
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%', //decreased width to make it smaller
        maxHeight: '80%', //limit height to prevent excessive scroll
    },
    modalScroll: {
        paddingBottom: 20,
    },
    termsTextHeader: {
        fontSize: 20, //adjusted size
        fontWeight: 'bold',
        marginBottom: 10,
    },
    termsContent: {
        fontSize: 15, 
        color: 'black',
        lineHeight: 20, //gap between lines
    },
    closeButton: {
        backgroundColor: '#C70039',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
});
