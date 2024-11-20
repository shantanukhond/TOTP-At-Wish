import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { router, Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as SQLite from 'expo-sqlite';
import * as MediaLibrary from 'expo-media-library';

const STRINGS = require('../constants/strings');
const db = SQLite.openDatabaseSync(STRINGS.DB_NAME);
SplashScreen.preventAutoHideAsync();


const createTable = async () => {
 
    const query = `
      CREATE TABLE IF NOT EXISTS totp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo TEXT,
        secret TEXT NOT NULL,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        issuer TEXT,
        user_identifier TEXT,
        algorithm TEXT DEFAULT 'SHA-1',
        digits INTEGER DEFAULT 6
      );
    `;
  
    db.execSync(query)
    console.log("Table created")
    router.push("/(main)")
  };


  const requestStoragePermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access storage is required!');
      if(status=='denied'){
        requestStoragePermission();
      }
    } else {
      console.log("Storage permission granted! in index" );    
      createTable();
    }
  };
  
  
const RootNavigation = () => {
    useEffect(()=>{
        requestStoragePermission()
    })

    
  

    return (
        <>  
            <Stack screenOptions={{headerShown:false}}/>
        </>
    )
}

export default RootNavigation