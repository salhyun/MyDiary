import React from 'react';
import {Text, View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import SettingScreen from './SettingScreen';

const StackNavigator = createStackNavigator();
export default function SettingStack() {
  return (
    <StackNavigator.Navigator>
      <StackNavigator.Screen name="Setting" component={SettingScreen} options={{headerLeft: null}} />
    </StackNavigator.Navigator>
  );
}
