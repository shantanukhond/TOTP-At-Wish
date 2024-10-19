import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Redirect, Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as SQLite from 'expo-sqlite';
const STRINGS = require('../constants/strings');

SplashScreen.preventAutoHideAsync();
const db = SQLite.openDatabaseSync(STRINGS.DB_NAME);

const createTable = () => {
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
  };

const RootNavigation = () => {
    useEffect(()=>{
        createTable()
        SplashScreen.hideAsync();
    })

    

    return (
        <>  
            <Stack screenOptions={{headerShown:false}}/>
            <Redirect href={"/(main)"}/>
        </>
    )
}

export default RootNavigation