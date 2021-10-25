import React from 'react';
import {Animated, findNodeHandle, Keyboard, ScrollView, Text, UIManager, View} from 'react-native';
import auth from '@react-native-firebase/auth';
import Layout from '../constants/Layout';
import {Input, Button} from 'react-native-elements';
import MyUtils from '../utilities/MyUtils';
import i18n from 'i18n-js'

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

export default class ResendEmailVerificationScreen extends React.Component {
  static navigationOptions = {
    title: '이메일 인증 보내기'
  };
  constructor(props) {
    super(props);

    this.scrollOffsetY = 0;
    this.state = {
      keyboardHeight: new Animated.Value(0),
      email: '',
      password: '',
      errorMessage: '',
      loadingSendVerificationEmail: false
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
  onChangePassword = (text) => {
    this.setState({
      password: text,
      errorMessage: ''
    })
  }
  onPressSendEmailVerification = () => {
    this.setState({loadingSendVerificationEmail: true}, () => {
      auth().signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(auth => {
          console.log('success login!!');
          if(auth.user.emailVerified) {
            this.setState({errorMessage: i18n.t('AlreadyVerified'), loadingSendVerificationEmail: false});
          } else {
            console.log(auth.user)
            auth.user.sendEmailVerification().then(() => {
              console.log('sentEmailVerification');
              this.setState({errorMessage: i18n.t('SentEmailVerification'), loadingSendVerificationEmail: false});
            }).catch(error => {
              console.error("Error sendEmailVerification: ", error);
              this.setState({errorMessage: error, loadingSendVerificationEmail: false});
            })
          }
        })
        .catch((error) => {
          console.log('error code = ' + error.code + ', message = ' + error.message);
          this.setState({errorMessage: i18n.t('InvalidEmailOrPassword'), loadingSendVerificationEmail: false});
        });
    })
  }

  render() {
    return(
      <View style={{flex: 1, marginTop: 30}}>
        <ScrollView ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
          <View style={{marginTop: 10, marginHorizontal: 20}} onLayout={event => this.layoutEmail = event.nativeEvent.layout}>
            <Input onChangeText={(text) => {this.onChangeEmail(text)}} value={this.state.email} leftIcon={{type: 'feather', name: 'user', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' keyboardType='email-address' autoCapitalize='none' onFocus={() => this.focusedInput = this.layoutEmail} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder={i18n.t('inputYourEmail')} />
          </View>
          <View style={{marginTop: 10, marginHorizontal: 20}} onLayout={event => this.layoutPassword = event.nativeEvent.layout}>
            <Input onChangeText={(text) => {this.onChangePassword(text)}} value={this.state.password} secureTextEntry={true} leftIcon={{type: 'feather', name: 'lock', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' autoCapitalize='none' onFocus={() => this.focusedInput = this.layoutPassword} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder={i18n.t('inputPassword')} />
          </View>
          <View style={{marginTop: 20, marginHorizontal: 20}}>
            <ErrorMessageView message={this.state.errorMessage} />
          </View>
          <View style={{marginTop: 5, marginHorizontal: 20}}>
            <Button type='solid' title={i18n.t('ResendEmailVerification')} loading={this.state.loadingSendVerificationEmail} disabled={this.state.loadingSendVerificationEmail} onPress={this.onPressSendEmailVerification} />
          </View>
          <Animated.View style={{height:this.state.keyboardHeight}}/>
        </ScrollView>
      </View>
    );
  }
}
