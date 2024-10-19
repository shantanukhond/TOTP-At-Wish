import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync();

const RootNavigation = () => {
    useEffect(() => {
        SplashScreen.hideAsync();
    })

    return (
        <Stack>
             <Stack.Screen
                name="qrScannerModal"
                options={{
                    presentation: 'modal',
                    title:"Scan TOTP QR code"
                }}
            />
        </Stack >
    )
}

export default RootNavigation