import React from 'react';
import {Text, View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import DiaryScreen from './DiaryScreen';
import KeepingScreen from './KeepingScreen';
import i18n from 'i18n-js';

const StackNavigator = createStackNavigator();
export default function HomeStack() {
  return (
    <StackNavigator.Navigator>
      <StackNavigator.Screen name="Home" component={HomeScreen} options={{headerLeft: null}} />
      <StackNavigator.Screen name="Diary" component={DiaryScreen} options={{title: i18n.t('Diary')}} />
      <StackNavigator.Screen name="Keeping" component={KeepingScreen} options={{title: i18n.t('Keeping')}} />
    </StackNavigator.Navigator>
  );
}
