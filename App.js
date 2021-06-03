// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-community/async-storage';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, Text, View, TextInput, LogBox, Button } from 'react-native';
import firebase from 'firebase';
import 'firebase/firestore';
import { GiftedChat } from 'react-native-gifted-chat';

const firebaseConfig = {
  apiKey: "AIzaSyB-ttWYyAbLM2qoWu0lD6M7fFJGtbrvJhQ",
  authDomain: "quick-messenger-75cec.firebaseapp.com",
  projectId: "quick-messenger-75cec",
  storageBucket: "quick-messenger-75cec.appspot.com",
  messagingSenderId: "309033993409",
  appId: "1:309033993409:web:3f3e4085517eac185b4040"
};
// Initialize Firebase
if(firebase.apps.length ===0){
  firebase.initializeApp(firebaseConfig);
}

// LogBox.ignoreWarnings(['Setting a timer for a long period of time']);


const db = firebase.firestore()
const chatRef = db.collection('chats')


export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState([])

  useEffect(() => {
    readUser();

    const unSubscribe = chatRef.onSnapshot((querySnapShot) => {
      const messageFireStore = querySnapShot.docChanges().filter(({type}) => type == 'added')
                                  .map(({doc}) => {
                                    const message = doc.data()
                                    return {...message, createdAt: message.create.toDate()}
                                  })
                                  .sort((a, b) => b.createdAt.getItem() - a.createdAt.getItem())
    setMessage(messageFireStore)
    })
    
  }, [])

  async function readUser(){
      const user = await AsyncStorage.getItem('user');
      if(user){
        setUser(JSON.parse(user))
      }
  }

  async function handlePress() {
    const _id = Math.random().toString(36).substring(7)
    const user = { _id, name }
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setUser(user)
}

async function handleSend(messages) {
  const writes = messages.map((m) => chatRef.add(n))
  await Promise.all(writes)
}

  if (!user) {
    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />
            <Button onPress={handlePress} title="Enter the chat" />
        </View>
    )
}

  return <GiftedChat messages={message} user={user} onSend={handleSend} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'gray',
},
});
