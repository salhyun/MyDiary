import React from 'react';
import {Animated, findNodeHandle, Keyboard, Platform, ScrollView, Text, UIManager, View, Alert, ToastAndroid} from 'react-native';
import auth from '@react-native-firebase/auth';
import Layout from '../constants/Layout';
import {Input, Button} from 'react-native-elements';
import i18n from 'i18n-js'
import MyUtils from '../utilities/MyUtils';

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

export default class ForgotPasswordScreen extends React.Component {
  constructor(props) {
    super(props);

    this.scrollOffsetY = 0;
    this.state = {
      keyboardHeight: new Animated.Value(0),
      loadingPasswordReset: false,
      email: ''
    }
  }
  keyboardShow = (event) => {
    if(this.props.navigation.isFocused()) {//아직 뒤에서 돌고 있는 Screen이 메시지를 받기 때문에 막아줘야함.
      const keyboardHeight = event.endCoordinates.height;
      UIManager.measure(findNodeHandle(this.scrollview), (x, y, widht, height) => {
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
  }
  componentWillUnmount() {
    this.keyboardShowListener.remove();
    this.keyboardHideListener.remove();
  }

  onChangeEmail = (text) => {
    this.setState({
      email: text,
      errorMessage: ''
    })
  }

  notifyMessage = (msg) => {
    if(Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else if(Platform.OS === 'ios') {
      Alert.alert(msg);
    }
  }

  sendPasswordReset = () => {
    this.setState({loadingPasswordReset: true}, () => {
      if(MyUtils.checkEmailStyle(this.state.email) === false) {
        this.setState({errorMessage: i18n.t('NotInEmailFormat'), loadingPasswordReset: false});
      } else {
        auth().sendPasswordResetEmail(this.state.email)
          .then(() => {
            console.log('Password reset email sent');
            this.notifyMessage(i18n.t('ResetEMailSentSuccessfully'));
            this.setState({loadingPasswordReset: false});
          }).catch(error => {
          console.log('Error occurred. Inspect error :', error);
          this.setState({errorMessage: error, loadingPasswordReset: false});
        })
      }
    })
  }

  render() {
    return(
      <View style={{flex: 1}}>
        <ScrollView ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
          <View style={{marginTop: 10, marginHorizontal: 20}} onLayout={event => this.layoutEmail = event.nativeEvent.layout}>
            <Input onChangeText={(text) => {this.onChangeEmail(text)}} value={this.state.email} leftIcon={{type: 'feather', name: 'user', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' keyboardType='email-address' autoCapitalize='none' onFocus={() => this.focusedInput = this.layoutEmail} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder={i18n.t('inputYourEmail')} />
          </View>
          <View style={{marginTop: 20, marginHorizontal: 20}}>
            <ErrorMessageView message={this.state.errorMessage} />
          </View>
          <View style={{marginTop: 5, marginHorizontal: 20}}>
            <Button type='solid' title={i18n.t('SendPasswordResetEmail')} buttonStyle={{backgroundColor: '#4BB543'}} disabled={this.state.loadingPasswordReset} loading={this.state.loadingPasswordReset} onPress={this.sendPasswordReset} />
          </View>
        </ScrollView>
      </View>
    );
  }
}
