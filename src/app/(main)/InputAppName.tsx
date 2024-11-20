import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import { Text } from "react-native";

export default function InputAppName() {

const  item  =  useLocalSearchParams().data
const app_data = JSON.parse(JSON.stringify(item))


  return (
    <>
      <Text>Please Enter App Name: {app_data}</Text>
    </>
  );
}
