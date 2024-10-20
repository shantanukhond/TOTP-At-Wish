import React from 'react';
import { View, Text, StyleSheet } from 'react-native'

interface TOTP_URI {
    type: string;
    account: string;
    secret: string;
    issuer?: string;
    algorithm?: string;
    digits?: number;
    period?: number;
}

export default TOTP_URI