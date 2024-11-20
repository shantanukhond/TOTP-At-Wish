import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Redirect, router, Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

const STRINGS = require('../constants/strings');
SplashScreen.preventAutoHideAsync();

const RootNavigation = () => {
    useEffect(()=>{
        
    })

    return (
        <>  
            <Stack screenOptions={{headerShown:false}}/>
        </>
    )
}

export default RootNavigation