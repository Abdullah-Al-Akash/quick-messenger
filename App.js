// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useCallback } from 'react';
// import AsyncStorage from '@react-native-community/async-storage';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, Text, View, TextInput, LogBox, Button,  } from 'react-native';
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
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

// YellowBox.ignoreWarnings(['Setting a timer for a long period of time'])

const db = firebase.firestore()
const chatsRef = db.collection('chats')

export default function App() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
      readUser()
      const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
          const messagesFirestore = querySnapshot
              .docChanges()
              .filter(({ type }) => type === 'added')
              .map(({ doc }) => {
                  const message = doc.data()
                  //createdAt is firebase.firestore.Timestamp instance
                  //https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp
                  return { ...message, createdAt: message.createdAt.toDate() }
              })
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          appendMessages(messagesFirestore)
      })
      return () => unsubscribe()
  }, [])

  const appendMessages = useCallback(
      (messages) => {
          setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
      },
      [messages]
  )

  async function readUser() {
      const user = await AsyncStorage.getItem('user')
      if (user) {
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
      const writes = messages.map((m) => chatsRef.add(m))
      await Promise.all(writes)
  }

  if (!user) {
      return (
          <View style={styles.container}>
              <View>
                <Text>Welcome to</Text>
                 <Text style={styles.welcome}> Quick Message </Text></View>
              <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />
              <Button onPress={handlePress} title="Enter the chat" />
          </View>
      )
  }
  return <GiftedChat messages={messages} user={user} onSend={handleSend} />
}

const styles = StyleSheet.create({
  welcome:{
    color: 'salmon',
    fontWeight: 'bold',
  },
  container: {
      flex: 1,
      backgroundColor: '#6DD5FA',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
  },
  input: {
      height: 50,
      width: '100%',
      borderWidth: 1,
      padding: 15,
      marginBottom: 20,
      borderColor: 'gray',
  },
})
