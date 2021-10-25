import React from 'react';
import {
  Animated,
  findNodeHandle,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Input, Button, Text} from 'react-native-elements';
import MyUtils from '../utilities/MyUtils';
import Layout from '../constants/Layout';
import Colors from '../constants/Colors';
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

export default class SignUpScreen extends React.Component {
  constructor(prop) {
    super(prop);

    this.scrollOffsetY = 0;
    this.state = {
      keyboardHeight: new Animated.Value(0),
      email: '',
      password: '',
      confirmPassword: '',
      nickName: '',
      errorMessages: {email: '', password: '', confirmPassword: ''},
      signupErrorMessage: '',
      loadingSignup: false,
      createdAccount: false
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
  }
  componentWillUnmount() {
    this.keyboardShowListener.remove();
    this.keyboardHideListener.remove();
  }

  onChangeEmail = (text) => {
    this.setState({
      email: text
    })
  }
  onChangePassword = (text) => {
    this.setState({
      password: text
    })
  }
  onChangeConfirmPassword = (text) => {
    this.setState({
      confirmPassword: text
    })
  }
  onChangeNickName = (text) => {
    this.setState({
      nickName: text
    })
  }

  createDiary = (uid) => {
    let defaultCover = '/images/d0e7a4b34c1b6c17545ea763bef34a08.jpg';
    storage().ref(defaultCover).getDownloadURL().then(downloadUrl => {
      console.log('storage downloadUrl =', downloadUrl);
      let now = new Date();
      let diary = {title: '다이어리', cover: downloadUrl, uid: uid, year: now.getFullYear()};
      firestore().collection('diaries').add(diary).then(docRef => {
        console.log('add diary docId =', docRef.id);
      }).catch(error => {
        console.error("Error adding document: ", error);
      })
    });
  }

  onPressSignup = () => {
    this.setState({signupErrorMessage: '', loadingSignup: true}, () => {
      let errorCount=0;
      let errorMessages = {email: '', password: '', confirmPassword: ''}
      if(MyUtils.checkEmailStyle(this.state.email) === false) {
        errorMessages.email = i18n.t('NotInEmailFormat');
        errorCount++;
      }
      if(this.state.password.length < 6) {
        errorMessages.password = i18n.t('AtLeast6Digits');
        errorCount++;
      }
      if(this.state.password !== this.state.confirmPassword) {
        errorMessages.confirmPassword = i18n.t('PasswordDoNotMatch');
        errorCount++;
      }
      console.log('errorMessages =', errorMessages);
      if(errorCount > 0) {
        this.setState({errorMessages: errorMessages, loadingSignup: false});
      } else {
        console.log('into signup');
        auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(auth => {
            console.log('create User successfully');
            auth.user.sendEmailVerification().then(() => {
              let defaultCover = '/images/d0e7a4b34c1b6c17545ea763bef34a08.jpg';
              storage().ref(defaultCover).getDownloadURL().then(downloadUrl => {
                console.log('storage downloadUrl =', downloadUrl);
                let now = new Date();
                let diary = {title: '다이어리' + now.getFullYear(), cover: downloadUrl, uid: auth.user.uid};
                firestore().collection('diaries').add(diary).then(docRef => {
                  console.log('add diary docId =', docRef.id);
                  this.setState({loadingSignup: false, createdAccount: true});
                }).catch(error => {
                  console.error("Error adding document: ", error);
                })
              });
            })
          })
          .catch((error) => {
            console.log('error code = ' + error.code + ', message = ' + error.message);
            this.setState({signupErrorMessage: i18n.t('AlreadyHaveAccount'), loadingSignup: false});
          });
      }
    });
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        {
          this.state.createdAccount ?
            <View style={{backgroundColor: 'white', padding: 20, borderRadius: 5, ...styles.shadow}}>
              <Text style={{textAlign: 'center', fontSize: 24, color: '#555', marginBottom: 20}}>{i18n.t('SingUpSuccessMessage')}</Text>
              <Button type='solid' title={i18n.t('gotoSignIn')} onPress={() => {this.props.navigation.navigate('SignIn')}} />
            </View>
            :
            <ScrollView style={{width: '100%'}} ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
              <View style={Layout.elementStyle} onLayout={event => this.layoutEmail = event.nativeEvent.layout}>
                <Input placeholder={i18n.t('inputYourEmail')} leftIcon={{type: 'feather', name: 'user', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} onFocus={() => this.focusedInput = this.layoutEmail} inputContainerStyle={{borderBottomWidth: 0.25}}
                       autoCapitalize='none' clearButtonMode='while-editing' keyboardType='email-address' errorMessage={this.state.errorMessages.email}
                       value={this.state.email} onChangeText={(text => {this.onChangeEmail(text)})}
                />
              </View>
              <View style={Layout.elementStyle} onLayout={event => this.layoutPassword = event.nativeEvent.layout}>
                <Input onChangeText={(text) => {this.onChangePassword(text)}} value={this.state.password} secureTextEntry={true} leftIcon={{type: 'feather', name: 'lock', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' onFocus={() => this.focusedInput = this.layoutPassword} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder={i18n.t('inputPassword')} errorMessage={this.state.errorMessages.password} />
              </View>
              <View style={Layout.elementStyle} onLayout={event => this.layoutConfirmPassword = event.nativeEvent.layout}>
                <Input onChangeText={(text) => {this.onChangeConfirmPassword(text)}} value={this.state.confirmPassword} secureTextEntry={true} leftIcon={{type: 'feather', name: 'lock', color: 'dimgray'}} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' onFocus={() => this.focusedInput = this.layoutConfirmPassword} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder={i18n.t('inputPasswordAgain')} errorMessage={this.state.errorMessages.confirmPassword} />
              </View>
              <View style={Layout.elementStyle} onLayout={event => this.layoutNickname = event.nativeEvent.layout}>
                <Input onChangeText={(text) => {this.onChangeNickName(text)}} value={this.state.nickName} label={i18n.t('nickName')} leftIconContainerStyle={{marginLeft: 0, marginRight: 10}} clearButtonMode='while-editing' onFocus={() => this.focusedInput = this.layoutNickname} inputContainerStyle={{borderBottomWidth: 0.25}} placeholder={i18n.t('inputYourNickname')} />
              </View>
              <View style={{marginTop: 30}}>
                <View style={{marginTop: 0, marginHorizontal: 30}}>
                  <ErrorMessageView message={this.state.signupErrorMessage} />
                </View>
                <View style={{...Layout.elementStyle, marginTop: 5}}>
                  <Button type='solid' title={i18n.t('SignUp')} buttonStyle={{backgroundColor: '#4BB543'}} disabled={this.state.loadingSignup} loading={this.state.loadingSignup} onPress={this.onPressSignup} />
                </View>
              </View>
              <Animated.View style={{height:this.state.keyboardHeight}}/>
            </ScrollView>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000", shadowOffset: {width: 0,height: 2,}, shadowOpacity: 0.23, shadowRadius: 2.62, elevation: 4
  }
});

