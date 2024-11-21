import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { NavigationContainer } from '@react-navigation/native';

SplashScreen.preventAutoHideAsync();

const RootNavigation = () => {
    useEffect(() => {
        SplashScreen.hideAsync();
    })

    return (
        <Stack>
            <Stack.Screen name='index' options={{
                title: "TOTP At Wish"
            }} />

             <Stack.Screen
                name="QrCodeScannerCam"
                options={{
                    presentation: 'modal',
                    title:"Scan TOTP QR code"
                }}
            />
            <Stack.Screen
                name="InputAppName"
                options={{
                    presentation: 'modal',
                    title:"Scan TOTP QR code"
                }}
            />
        </Stack >
        // </NavigationContainer>
    )
}

export default RootNavigation