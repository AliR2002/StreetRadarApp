import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, StyleSheet, Modal, Text, TextInput, Button, ActivityIndicator, Alert, TouchableOpacity, ScrollView, Image } from "react-native";
import { collection, getDocs, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FIREBASE_DB } from '../../FirebaseConfig';


//alerts component to display and manage alerts
const Alerts = ({ navigation }: any) => {
  const [alerts, setAlerts] = useState<{ 
    id?: string; 
    title?: string; 
    description?: string; 
    body?: string;
    time?: string; 
    userId?: string;
    address?: string; 
    image?: string | null; 
  }[]>([]);
  
  const [loading, setLoading] = useState(true); //loading state for alerts
  const [modalVisible, setModalVisible] = useState(false); //modal visibility state
  const [selectedAlert, setSelectedAlert] = useState<{ id?: string; title?: string; description?: string; body?: string; time?: string; userId?: string } | null>(null); //state for selected alert
  const [alertTitle, setAlertTitle] = useState(""); //state for alert title
  const [alertDescription, setAlertDescription] = useState(""); //state for alert description
  const auth = getAuth();

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

  //fetch markers and convert to alerts
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(FIREBASE_DB, 'markers'), orderBy('time', 'desc')), //order markers by latest time
      snapshot => {  //fetch markers from Firestore
        const markerAlerts = snapshot.docs.map(doc => { 
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Marker Alert",
            description: data.description || "No description",
            body: data.body || "No Body Available",
            image: data.imageUrl || null, 
            time: data.time,
            userId: data.userId,
            address: data.address || "No Address",
          };
        });
        setAlerts(markerAlerts);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);
  
  
  //save new alert to Firestore
  const saveAlertToDatabase = async (alert: { title?: string; description?: string; body?: string; userId?: string }) => {
    const newAlertRef = await addDoc(collection(FIREBASE_DB, 'alerts'), alert);
    return newAlertRef.id;
  };

  //update existing alert in Firestore
  const updateAlertInDatabase = async (alertId: string, updatedAlert: { title?: string; description?: string; body?: string }) => {
    const alertRef = doc(FIREBASE_DB, 'alerts', alertId);
    await updateDoc(alertRef, updatedAlert);
  };

  //handle adding or editing an alert with user input
  const handleAddOrEditAlert = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

  
  const updatedAlert = { //create an object with the alert data
      title: alertTitle, //title of the alert
      description: alertDescription, //description of the alert
    };

    if (selectedAlert) {
      if (selectedAlert.id) {
        await updateAlertInDatabase(selectedAlert.id, updatedAlert); // update existing alert
        setAlerts(alerts.map(alert =>
          alert.id === selectedAlert.id ? { ...alert, title: alertTitle, description: alertDescription } : alert //update the alert in the list
        ));
      }
    } else {
      const alertId = await saveAlertToDatabase({ //save new alert
        ...updatedAlert,
        userId,
      });

      if (alertId) {
        setAlerts([...alerts, { id: alertId, ...updatedAlert }]); //add new alert to list
      }
    }

    setModalVisible(false);
    setAlertTitle("");
    setAlertDescription("");
  };

  return (
    <ScrollView style={styles.container}> 
      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      ) : (
        <View style={styles.alertsList}>
          {alerts.map((alert, index) => (
            <TouchableOpacity key={alert.id || index} style={styles.alertItem} onPress={() => setSelectedAlert(alert)}>
            <Text style={styles.alertTitle}>{alert.title || `Alert ${index + 1}`}</Text>
            <Text style={styles.alertBody}>{alert.description || "No Description"}</Text>
            <Text style={styles.alertTime}>{alert.time || "No Time"}</Text>
            <Text style={styles.alertAddress}>{alert.address || "No Address"}</Text>
            {alert.image && (
              <Image
                source={{ uri: alert.image }}
                style={styles.alertImage}
                resizeMode="cover"
              />
            )}
              </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{selectedAlert?.id ? "Edit Alert" : "Add Alert"}</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#bbb"
            value={alertTitle}
            onChangeText={setAlertTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor="#bbb"
            value={alertDescription}
            onChangeText={setAlertDescription}
          />
          <Button title={selectedAlert?.id ? "Update Alert" : "Add Alert"} onPress={handleAddOrEditAlert} /> 
          {selectedAlert?.id && selectedAlert.userId === auth.currentUser?.uid }
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', //dark background
  },
  alertsList: {
    marginTop: 20,
  },
  alertItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444', //darker border color
  },
  alertTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff", //white text color for contrast
  },
  alertBody: {
    fontSize: 14,
    marginTop: 4,
    color: "#bbb", 
  },
  alertTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  modalView: {
    margin: 20,
    backgroundColor: "#333", 
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: "#fff", 
  },
  input: {
    height: 40,
    borderColor: "#555", 
    borderWidth: 1,
    marginBottom: 15,
    width: "100%",
    paddingHorizontal: 10,
    color: "#fff", 
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  alertAddress: {
    fontSize: 12, // Font size for the address
    color: "#aaa", // Light gray color for the address
    marginTop: 10, // Margin to separate from the body
  },
  alertImage: {
    width: 100, 
    height: 100, 
    marginTop: 10, 
    borderRadius: 10, 
  },
});

export default Alerts;
