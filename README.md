A React Native app that lets users place, edit, and delete incident markers on a live map. 
Each marker includes a title, description, timestamp, photo, and automatically generated address. All data is synced through Firebase Firestore.

Features

- Live map with user location using Expo Location

- Place markers within 100m of your location

- 50m minimum distance between markers (to prevent spam)

- 60-second cooldown between marker placements

- Edit/delete your own markers

- Reverse geocoding to get the address

- Realtime updates using Firestore onSnapshot()

- Image uploads with Expo Image Picker

Tech Stack

- React Native / Expo

- Firebase Firestore & Authentication

- React Native Maps

How It Works 

- On launch, the app asks for location permission and centers the map on the user.

- Firestore loads all markers and keeps them updated in real time.

- When the user taps the map:

- Distance from user + cooldown is checked

- Address is fetched

- A modal allows adding title, description, and a photo

- Users can only edit/delete their own markers.

Run the App
npm install
npx expo start
