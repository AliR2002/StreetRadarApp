import React, { useEffect, useState, useLayoutEffect } from "react";
import MapView, { Marker, MapPressEvent, Callout, Circle } from "react-native-maps";
import { View, StyleSheet, Modal, Text, TextInput, Button, ActivityIndicator, Alert, Image } from "react-native";
import * as Location from "expo-location";
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, getDocs, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

//constant variables for the map
const Map = () => {
  const [region, setRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | undefined>(undefined); //region is the area of the map that is visible to the user
  const [markers, setMarkers] = useState<{ id?: string; latitude: number; longitude: number; title?: string; description?: string; userId?: string; time?: string; imageUrl?: string; address?: string; }[]>([]);//markers are the points on the map that the user can click on
  const [loading, setLoading] = useState(true); //loading is true when the app is loading
  const [modalVisible, setModalVisible] = useState(false); //modal is the pop up that appears when the user clicks on the map
  const [selectedMarker, setSelectedMarker] = useState<{ id?: string; latitude: number; longitude: number; title?: string; description?: string; userId?: string; time?: string; imageUrl?: string; address?: string; } | null>(null); //selected marker is the marker that the user has clicked on
  const [incidentTitle, setIncidentTitle] = useState(""); //title of the incident
  const [incidentDescription, setIncidentDescription] = useState(""); //description of the incident
  const [imageUri, setImageUri] = useState<string | null>(null); //uri is the image file, uniform resource identifier
  const [incidentAddress, setAddress] = useState<string | null>(null);
  const auth = getAuth(); //get the current user from Firebase
  const navigation = useNavigation(); //navigation is used to navigate between screens
  const [lastMarkerTime, setLastMarkerTime] = useState<number | null>(null); //last marker time is the time that the user last placed a marker
  const [cooldown, setCooldown] = useState(0); //cooldown is the time that the user has to wait before placing another marker
  const cooldownDuration = 60; // Cooldown duration in seconds

  
    //the header at the very top of the screen
    useLayoutEffect(() => {
      navigation.setOptions({ //set options for the header
        headerStyle: {
          backgroundColor: '#323233', //black background
        },
        headerTitleStyle: {
          color: '#fff', // white header
        },
      });
    }, [navigation]);
    
    //useEffect is used to get the user location when the app is opened
    useEffect(() => { //fetch user location
    const requestLocationPermission = async () => { //request location permission, async means it will take some time to do
      let { status } = await Location.requestForegroundPermissionsAsync(); //request permission
      if (status !== "granted") { //if permission is not granted
        console.log("Location permission denied"); //log message
        setLoading(false); //set loading to false
        return; //return
      }
      fetchUserLocation(); //get user location
    };
    //fetch user location but zoom in to their radius
    const fetchUserLocation = async () => { //get the location of the user, async because it will take some time to find the location
      let location = await Location.getCurrentPositionAsync({}); //get the current position of the user
      const { latitude, longitude } = location.coords; //get the latitude and longitude of the user
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.001,  //zoom in 100m
        longitudeDelta: 0.001, //zoom in 100m
      });
      setLoading(false); 
    };
    requestLocationPermission(); //request permission to access location
  }, []);


  // get all markers from Firestore
  useEffect(() => { //fetch all markers from Firestore
    const fetchMarkers = async () => { //fetch all the markers from the database, which asyncs and takes some time
      //snapshot is getting the current state of the database
      const markersSnapshot = await getDocs(collection(FIREBASE_DB, 'markers')); //await pauses code execution until the markers are gotten, getDocs retrieves documents from a collection
      const markersData = markersSnapshot.docs.map(doc => {
        const data = doc.data(); 
        return {
          id: doc.id, //id of the document
          latitude: data.latitude,//latitude of the document
          longitude: data.longitude,//longitude of the document
          title: data.title,//title of the document
          description: data.description,//description of the document
          userId: data.userId, //user id of the document
          time: data.time, //time of the document
          imageUrl: data.imageUrl, //image url of the document
          address: data.address,//address of the document
          
        };
      });
      setMarkers(markersData); //set the markers to the data gotten from the database
    };

    // check for changes to markers in Firestore
    const unsubscribe = onSnapshot(collection(FIREBASE_DB, 'markers'), snapshot => { //snapshot means that it is constantly updating from my database
      const updatedMarkers = snapshot.docs.map(doc => { //map through the documents in the snapshot
        const data = doc.data();
        return {
          id: doc.id,
          latitude: data.latitude,
          longitude: data.longitude,
          title: data.title,
          description: data.description,
          userId: data.userId,
          time: data.time,
          imageUrl: data.imageUrl,
          address: data.address,
        };
      });
      setMarkers(updatedMarkers);
    });

    fetchMarkers();
    return () => unsubscribe(); //cleanup on unmount
  }, []);

  //save new marker to Firestore
  const saveMarkerToDatabase = async (marker: { latitude: number; longitude: number; title?: string; description?: string; userId?: string; time?: string; imageUrl?: string; address?: string }) => { //save marker to the database
    const newMarkerRef = await addDoc(collection(FIREBASE_DB, 'markers'), marker); //addDoc adds a new document to the collection
    return newMarkerRef.id; //return the id of the new document
  };

  //update existing marker in Firestore
  const updateMarkerInDatabase = async (markerId: string, updatedMarker: { title?: string; description?: string; time?: string; imageUrl?: string }) => { //update marker in the database
    const markerRef = doc(FIREBASE_DB, 'markers', markerId); //get the document reference
    await updateDoc(markerRef, updatedMarker); //update the document with the new data
  };

  // calculate the distance on the map, shows radius and distance for markers that can be placed
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };
  
  const handleMapPress = (event: MapPressEvent) => { //handle when the user presses on the map
    if (!region) return; //if there is no region, return
  
    if (selectedMarker) { //if there is a selected marker, close the modal
      setSelectedMarker(null);
      return;
    }
  
    const currentTime = Date.now(); //get the current time
    if (lastMarkerTime && currentTime - lastMarkerTime < cooldownDuration * 1000) { //if the last marker time is less than the cooldown duration, show an alert
      const remainingTime = Math.ceil((cooldownDuration * 1000 - (currentTime - lastMarkerTime)) / 1000); //calculate the remaining time
      Alert.alert("Cooldown Active", `You must wait ${remainingTime} seconds until you can place another marker.`); //show alert
      return;
    }

    //check if the user is within the allowed range to place a marker
    const { coordinate } = event.nativeEvent;
    const userLat = region.latitude;
    const userLon = region.longitude;
    const markerLat = coordinate.latitude;
    const markerLon = coordinate.longitude;
    const radiusLimit = 0.1; // 100m max range from user
    const minDistanceFromOthers = 0.005; // 50m minimum distance from other markers
  
    //distance check from user location
    const distanceFromUser = haversineDistance(userLat, userLon, markerLat, markerLon); // Calculate distance from user
    if (distanceFromUser > radiusLimit) { // If the distance is greater than 100m
      Alert.alert("Out of range", "You can only place markers within 100m of your location."); //print this alert
      return;
    }
  
    //distance check from other markers
    for (const marker of markers) {
      const dist = haversineDistance(marker.latitude, marker.longitude, markerLat, markerLon); //calculate distance from other markers
      if (dist < minDistanceFromOthers) { //if the distance is less than 50m
        return; //do not allow placing the marker
      }
    }
  
    //set the selected marker to the coordinates of the map
    getAddressFromCoords(coordinate.latitude, coordinate.longitude).then((address) => { //get the address from the coordinates
      setSelectedMarker({
        ...coordinate,
        title: "",
        description: "",
        userId: auth.currentUser?.uid,
        time: new Date().toLocaleString(),
        address: address, 
      });
      setAddress(address); //set the address
    });
  
    setLastMarkerTime(currentTime); //set the last marker time
    setModalVisible(true); //open the modal
  };

  //display the marker information when the user clicks on it
  interface MarkerData {
    id?: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    userId?: string;
    time?: string;
    imageUrl?: string;
    address?: string;
  }

  const handleMarkerPress = (marker: MarkerData) => { //handle when the user clicks on a marker
    if (marker.userId !== auth.currentUser?.uid) { //check if the marker belongs to the current user
      // Do nothing if the marker does not belong to the current user
      return;
    }
  
    //set the selected marker and open the modal
    setSelectedMarker({
      id: marker.id,
      latitude: marker.latitude,
      longitude: marker.longitude,
      title: marker.title || "",
      description: marker.description || "",
      imageUrl: marker.imageUrl || undefined,
      address: marker.address || "",
      userId: marker.userId,
    });
    setIncidentTitle(marker.title || "");
    setIncidentDescription(marker.description || "");
    setImageUri(marker.imageUrl || null);
    setAddress(marker.address || null);
    setModalVisible(true);
  };

  //function to get the address from latitude and longitude
  const getAddressFromCoords = async (latitude: number, longitude: number) => { //get the address from the coordinates
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude }); //reverse geocode is used to get the address from the coordinates
      if (geocode.length > 0) {
        const address = geocode[0];
        return `${address.street} ${address.city}, ${address.region}, ${address.country}`; //return the address
      }
      return "Address not available";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Address not available";
    }
  };

  
  //handle adding or editing a marker with user input
  const handleAddOrEditMarker = async () => { //handle when the user adds or edits a marker
    if (!selectedMarker || !auth.currentUser?.uid) return; //if there is no selected marker or user id, return
  
    const updatedMarker = { //update the marker with the new data
      title: incidentTitle,
      description: incidentDescription,
      time: new Date().toLocaleString(),
      imageUrl: imageUri || "",
      address: incidentAddress || "",
    };
  
    if (selectedMarker.id) { //if there is a selected marker
      //updating an existing marker
      await updateMarkerInDatabase(selectedMarker.id, updatedMarker); //update the marker in the database
      setMarkers(markers.map(marker => marker.id === selectedMarker.id ? { ...marker, ...updatedMarker } : marker //update the marker in the local state
      ));
    } else {
      //adding a new marker
      const markerId = await saveMarkerToDatabase({
        latitude: selectedMarker.latitude,
        longitude: selectedMarker.longitude,
        title: incidentTitle,
        description: incidentDescription,
        userId: auth.currentUser?.uid,
        time: updatedMarker.time,
        imageUrl: updatedMarker.imageUrl,
        address: incidentAddress || "",
      });
    
      if (markerId) { //if the marker id is not null
        setMarkers([...markers, { ...selectedMarker, id: markerId, ...updatedMarker }]); //add the new marker to the local state
      }
    }
    //close the modal
    setModalVisible(false);
    setIncidentTitle("");
    setIncidentDescription("");
    setImageUri(null); //clear the selected image
  };

  //function to delete a marker from Firestore
const deleteMarkerFromDatabase = async (markerId: string) => { //delete the marker from the database
  const markerRef = doc(FIREBASE_DB, 'markers', markerId); //get the document reference
  await deleteDoc(markerRef); //delete the document
};

  //function to pick an image
  const pickImage = async () => { //pick an image from the gallery
    let result = await ImagePicker.launchImageLibraryAsync({ //launch the image library
      mediaTypes: ImagePicker.MediaTypeOptions.Images, //only images
      allowsEditing: true, //allow editing
      aspect: [4, 3], //aspect ratio
      quality: 1, //quality of the image
    });

    if (!result.canceled) { //if the user did not cancel
      if (result.assets && result.assets.length > 0) {   //if there are assets
        setImageUri(result.assets[0].uri);  //set the image uri
      }
    }
  };

  return (
    <View style={styles.container}> 
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
          zoomEnabled={true}
        >
          {region && (
            <>
              <Marker
                coordinate={{
                  latitude: region.latitude,
                  longitude: region.longitude,
                }}
                title="You are here"
                pinColor="blue"
              />
              {/* circle around the user's location of the radius */}
              <Circle
                center={{
                  latitude: region.latitude,
                  longitude: region.longitude,
                }}
                radius={100} // 100 meters
                strokeWidth={2}
                strokeColor="blue"
                fillColor="rgba(0, 0, 255, 0.2)"
              />
            </>
          )}

          {/* render existing markers */}
          {markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              onPress={() => handleMarkerPress(marker)}
            >
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{marker.title || "No Title"}</Text>
                  <Text style={styles.calloutDescription}>{marker.description || "No Description"}</Text>
                  <Text style={styles.calloutTime}>{marker.time || "No Time"}</Text>
                  <Text style={styles.calloutAddress}>{marker.address || "No Address"}</Text>
                  {marker.imageUrl && (
                    <Image source={{ uri: marker.imageUrl }} style={styles.calloutImage} />
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

{modalVisible && selectedMarker?.userId === auth.currentUser?.uid && (
  <Modal
    animationType="fade"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => setModalVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        {/* editable Fields */}
        <TextInput
          style={styles.input}
          value={incidentTitle}
          onChangeText={setIncidentTitle}
          placeholder="Edit Title"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={incidentDescription}
          onChangeText={setIncidentDescription}
          placeholder="Edit Description"
          placeholderTextColor="#aaa"
          multiline
        />
        <Button title="Pick Image" onPress={pickImage} />
        {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
        <Button title="Save Changes" onPress={handleAddOrEditMarker} />


        {/* delete Button */}
        <Button
          title="Delete"
          onPress={async () => {
            if (selectedMarker?.id) {
              await deleteMarkerFromDatabase(selectedMarker.id); //delete from Firestore
              setMarkers(markers.filter(marker => marker.id !== selectedMarker.id)); //update local state
              setModalVisible(false); //close the modal
            }
          }}
          color="#FF0000" //red color for delete button
        />
        
        {/* close Button */}
        <Button title="Close" onPress={() => setModalVisible(false)} color="#FF6347" /> {/* red colour for close button */}
      </View>
    </View>
  </Modal>
)}

    </View>
  );
}

//styles for the map
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%", 
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  calloutContainer: {
    padding: 10,
    alignItems: "center",
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  calloutTime: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    textAlign: "center",
  },
  calloutDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    textAlign: "center",
  },
  calloutAddress: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    textAlign: "center",
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    width: "100%", 
  },
  textArea: {
    height: 80, 
    textAlignVertical: "top", 
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  image: {
    width: 150,
    height: 150,
  },
  modalDescription: {
    fontSize: 16,
    color: "#333",
    marginVertical: 10,
    textAlign: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  modalImage: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  calloutImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
  }
});


export default Map;

