/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar, Button,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './RootScreens/SplashScreen';
import SignUpScreen from './RootScreens/SignUpScreen';
import SignInScreen from './RootScreens/SignInScreen';
import ResendEmailVerificationScreen from './RootScreens/ResendVerificationEmailScreen';
import ForgotPasswordScreen from './RootScreens/ForgotPasswordScreen';
import BottomTabNavigator from './AppNavigator';
import i18n from 'i18n-js'
import Language from './constants/Language';

Language();
const StackNavigator = createStackNavigator();

function RootStack() {
  return (
    <StackNavigator.Navigator>
      <StackNavigator.Screen name="Splash" component={SplashScreen} options={{headerShown:false}} />
      <StackNavigator.Screen name="SignUp" component={SignUpScreen} options={{title: i18n.t('SignUp')}} />
      <StackNavigator.Screen name="SignIn" component={SignInScreen} options={{headerLeft: null, title: i18n.t('SignIn')}} />
      <StackNavigator.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{title: i18n.t('PasswordReset')}} />
      <StackNavigator.Screen name="ResendVerificationEmail" component={ResendEmailVerificationScreen} options={{title: i18n.t('ResendEmailVerification')}} />
      <StackNavigator.Screen name="BottomNavigator" component={BottomTabNavigator} options={{headerShown:false}} />
    </StackNavigator.Navigator>
  );
}

const App: () => React$Node = () => {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
};
export default App;

// const App: () => React$Node = () => {
//   return (
//     <>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView>
//         <ScrollView
//           contentInsetAdjustmentBehavior="automatic"
//           style={styles.scrollView}>
//           <Header />
//           {global.HermesInternal == null ? null : (
//             <View style={styles.engine}>
//               <Text style={styles.footer}>Engine: Hermes</Text>
//             </View>
//           )}
//           <View style={styles.body}>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Step One</Text>
//               <Text style={styles.sectionDescription}>
//                 Edit <Text style={styles.highlight}>App.js</Text> to change this
//                 screen and then come back to see your edits.
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>See Your Changes</Text>
//               <Text style={styles.sectionDescription}>
//                 <ReloadInstructions />
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Debug</Text>
//               <Text style={styles.sectionDescription}>
//                 <DebugInstructions />
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Learn More</Text>
//               <Text style={styles.sectionDescription}>
//                 Read the docs to discover what to do next:
//               </Text>
//             </View>
//             <LearnMoreLinks />
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Faces Places</Text>
//               <Text style={styles.sectionDescription}>globe</Text>
//             </View>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   scrollView: {
//     backgroundColor: Colors.lighter,
//   },
//   engine: {
//     position: 'absolute',
//     right: 0,
//   },
//   body: {
//     backgroundColor: Colors.white,
//   },
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: Colors.black,
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//     color: Colors.dark,
//   },
//   highlight: {
//     fontWeight: '700',
//   },
//   footer: {
//     color: Colors.dark,
//     fontSize: 12,
//     fontWeight: '600',
//     padding: 4,
//     paddingRight: 12,
//     textAlign: 'right',
//   },
// });


