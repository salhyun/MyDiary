import React from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard, Animated, UIManager, findNodeHandle, NativeModules,
} from 'react-native';
import {Button, Image, Input} from 'react-native-elements';
import Layout from '../constants/Layout'
import Colors from '../constants/Colors'
import auth from '@react-native-firebase/auth';
import i18n from 'i18n-js'
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

const ErrorMessageView = (props) => {
  const {message} = props;
  if(typeof message === 'string' && message.length > 0) {
    return (
      <Text style={{fontSize: Layout.defaultFontSize, color: 'tomato'}}>{message}</Text>
    )
  } else {
    return (
      <View></View>
    )
  }
}

export default class SignInScreen extends React.Component {
  constructor(props) {
    super(props);

    this.scrollOffsetY = 0;
    this.state={
      keyboardHeight: new Animated.Value(0),
      email: '',
      password: '',
      errorMessage: '',
      loadingScreen: true,
      loadingSignIn: false
    }
  }

  keyboardShow = (event) => {
    if(this.props.navigation.isFocused()) {//아직 뒤에서 돌고 있는 Screen이 메시지를 받기 때문에 막아줘야함.
      const keyboardHeight = event.endCoordinates.height;
      UIManager.measure(findNodeHandle(this.scrollview), (x, y, width, height) => {
        let keyboardTopOffsetY = height - keyboardHeight;
        if((this.focusedInput.y+this.focusedInput.height) > keyboardTopOffsetY) {
          Animated.timing(this.state.keyboardHeight, {toValue: keyboardHeight, duration: 0, delay: 0}).start();
          setTimeout(() => {
            this.scrollview.scrollTo({y: (this.focusedInput.y+this.focusedInput.height) - keyboardTopOffsetY, animated: true})
          }, 100);
        }
      })
    }
  }
  keyboardHide = () => {
    if(this.props.navigation.isFocused()) {//아직 뒤에서 돌고 있는 Screen이 메시지를 받기 때문에 막아줘야함.
      Animated.timing(this.state.keyboardHeight, {toValue: 0, duration: 250, delay: 0}).start();
    }
  }

  componentDidMount() {
    this.keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',//안드로이드 keyboardWillShow 지원안함.
      this.keyboardShow,
    );
    this.keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',//안드로이드 keyboardWillHide 지원안함.
      this.keyboardHide,
    );

    auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('login');
        console.log(`email: ${user.email}, uid: ${user.uid}`);
        console.log(user.emailVerified);
        if(user.emailVerified) {
          console.log('onAuthStateChanged emailVerified');
          this.setState({email: user.email}, () => {
            this.props.navigation.navigate('Home');
          })
        } else {
          console.log('doesnt Verificated');
        }
      } else {
        // User is signed out.
        console.log('logout');
      }
      if(this.state.loadingScreen) {
        this.setState({loadingScreen: false});
      }
    });
  }

  componentWillUnmount() {
    this.keyboardShowListener.remove();
    this.keyboardHideListener.remove();
  }

  onChangeEmail = (text) => {
    this.setState({
      email: text, errorMessage: ''
    })
  }
  onChangePassword = (text) => {
    this.setState({
      password: text, errorMessage: ''
    })
  }

  SignIn = () => {
    this.setState({loadingSignIn: true}, () => {
      auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(auth => {
        console.log('SignIn successfully!!');
        this.setState({loadingSignIn: false}, () => {
          if(auth.user.emailVerified) {
            this.props.navigation.navigate('BottomNavigator');
          } else {
            this.setState({errorMessage: i18n.t('EmailNotVerified')})
          }
        })
      }).catch(error => {
        this.setState({errorMessage: i18n.t('InvalidEmailOrPassword'), loadingSignIn: false})
      })
    })
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ScrollView style={{width: '100%'}} ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
          <View style={{...styles.elementStyle, marginTop: '20%', alignItems: 'center'}}>
            <Image source={require('../resources/diaryicon.png')} style={{width: 200, height: 200}} resizeMode='contain' containerStyle={{marginBottom: 50}} PlaceholderContent={<ActivityIndicator/>}/>
          </View>
          <View style={styles.elementStyle} onLayout={event => this.layoutEmail = event.nativeEvent.layout}>
            <Input placeholder={i18n.t('inputYourEmail')} leftIcon={{type: 'feather', name: 'user', color: 'dimgray'}} inputContainerStyle={{borderBottomWidth: 0.25}} onFocus={() => this.focusedInput = this.layoutEmail}
                   autoCapitalize='none' clearButtonMode='while-editing' keyboardType='email-address'
                   value={this.state.email} onChangeText={(text => {this.onChangeEmail(text)})}
            />
          </View>
          <View style={{...styles.elementStyle, marginTop: 0}} onLayout={event => this.layoutPassword = event.nativeEvent.layout}>
            <Input placeholder={i18n.t('inputPassword')} leftIcon={{type: 'feather', name: 'lock', color: 'dimgray'}} inputContainerStyle={{borderBottomWidth: 0.25}} onFocus={() => this.focusedInput = this.layoutPassword}
                   autoCapitalize='none' secureTextEntry={true} clearButtonMode='while-editing'
                   value={this.state.password} onChangeText={(text => {this.onChangePassword(text)})}
            />
          </View>
          <View style={{...styles.elementStyle, marginTop: 0}}>
            <ErrorMessageView message={this.state.errorMessage} />
          </View>
          <Button type='solid' title={i18n.t('SignIn')} containerStyle={styles.buttonStyle}
                  disabled={this.state.loadingSignIn} loading={this.state.loadingSignIn} onPress={this.SignIn}
          />
          <Button type='solid' title={i18n.t('SignUp')} containerStyle={styles.buttonStyle} buttonStyle={{backgroundColor: '#4BB543'}}
                  onPress={() => this.props.navigation.navigate('SignUp')}
          />
          <View style={{...styles.elementStyle, marginTop: 30, alignItems: 'flex-end'}}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ForgotPasswordScreen')}>
              <Text style={{color: Colors.tintColor, fontSize: Layout.defaultFontSize}}>{i18n.t('PasswordReset')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{marginTop: 10}} onPress={() => this.props.navigation.navigate('ResendVerificationEmail')}>
              <Text style={{color: Colors.tintColor, fontSize: Layout.defaultFontSize}}>{i18n.t('ResendEmailVerification')}</Text>
            </TouchableOpacity>
          </View>
          <Animated.View style={{height:this.state.keyboardHeight}}/>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  elementStyle: {
    paddingHorizontal: Layout.defaultPaddingHorizontal, width: '100%', marginTop: 10
  },
  buttonStyle: {
    paddingHorizontal: Layout.defaultPaddingHorizontal, width: '100%', marginTop: 10
  }
});
