import { Platform, ToastAndroid } from "react-native";
import Snackbar from 'react-native-snackbar';

export const showToast = (message:string) => {
    if (Platform.OS != 'android') {
        // When uncommented this is trowing TypeError: Cannot read property 'LENGTH_LONG' of null
        // Snackbar.show({
        //     text: message,
        //     duration: Snackbar.LENGTH_SHORT,
        // });
    } else {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    }
}