import React from 'react';
import {Text, View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import SearchScreen from './SearchScreen';

const StackNavigator = createStackNavigator();
export default function SearchStack() {
  return (
    <StackNavigator.Navigator>
      <StackNavigator.Screen name="Search" component={SearchScreen} options={{headerLeft: null}} />
    </StackNavigator.Navigator>
  );
}
