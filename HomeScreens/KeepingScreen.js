import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard, Animated, UIManager, findNodeHandle,
} from 'react-native';
import update from 'react-addons-update';
import {Image, Button, Text} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import i18n from 'i18n-js'
import MyUtils from '../utilities/MyUtils';
import Layout from '../constants/Layout';
import {CommonActions} from '@react-navigation/native';
import Colors from '../constants/Colors';

export default class KeepingScreen extends React.Component {
  constructor(props) {
    super(props);

    this.scrollOffsetY = 0;
    this.state = {
      keyboardHeight: new Animated.Value(0),
      date: '',
      title: '',
      content: '',
      disabledSave: true,
      disabledCancel: false,
      loadingSave: false,
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

    const {prevRouteName, dayCount, thisDay, diaryId, pieceId} = this.props.route.params;
    if(prevRouteName !== undefined && dayCount !== undefined && thisDay !== undefined && pieceId !== undefined) {
      this.prevRouteName = prevRouteName;
      this.dayCount = dayCount;
      this.day = thisDay;
      this.diaryId = diaryId;
      this.pieceId = pieceId;
      this.props.navigation.dispatch({...CommonActions.setParams({prevRouteName: undefined, dayCount: undefined, thisDay: undefined, pieceId: undefined}), source: this.props.route.key});
      console.log('prevRouteName =', prevRouteName);
      console.log('pieceId =', pieceId);
      if(pieceId !== null) {
        firestore().collection('pieces').doc(this.pieceId).get().then(doc => {
          if(doc.exists) {
            const piece = doc.data();
            this.setState({title: piece.title, content: piece.content});
          }
        })
      }
    } else {
      console.log('WTF?');
      this.props.navigation.goBack();
    }
  }
  componentWillUnmount() {
    this.keyboardShowListener.remove();
    this.keyboardHideListener.remove();
  }

  onPressWithoutInput = () => {
    Keyboard.dismiss();
  }

  PresentDate = (props) => {
    const {thisDay} = props;
    if(thisDay !== undefined) {
      let date=null;
      if(i18n.locale == 'ko') {
        let week = ['일', '월', '화', '수', '목', '금', '토'];
        date = thisDay[0] + '년 ' + (thisDay[1]+1) + '월 ' + thisDay[2] + '일 ' + week[thisDay[3]] + '요일';
      } else {
        //if not 'ko
      }
      return (
        <View>
          <Text style={{fontSize: Layout.defaultFontSize}}>{date}</Text>
        </View>
      )
    } else {
      return <View></View>
    }
  }

  onChangeTitle = text => {
    console.log('title =', text);
    this.setState({title: text});
  }
  onChangeContent = text => {
    this.setState({content: text, disabledSave: text.length > 0 ? false : true});
  }

  gotoPrevRoute = (dayCount, ref) => {
    this.props.navigation.navigate(this.prevRouteName, {piece: {dayCount: dayCount, ref: ref}});
  }

  onSave = async () => {
    if(this.prevRouteName !== undefined) {
      this.setState({loadingSave: true, disabledCancel: true}, async () => {
        // this.diaryId = 'PokXX01cZ8dlynePbwPN';
        console.log(`diaryId=${this.diaryId}, thisDay=${this.day}`);
        const diaryRef = firestore().collection('diaries').doc(this.diaryId);
        console.log('diaryRef =', diaryRef.path);
        let piece = {title: this.state.title, content: this.state.content, day: this.day[2], diaryRef: diaryRef, updatedAt: firestore.Timestamp.fromDate(new Date(this.day[0], this.day[1], this.day[2]))};
        let calendarChecker = await (async function findCalendarChecker(ref, month, day) {
          return new Promise(resolve => {
            firestore().collection('calendarCheckers').where('diary', '==', ref).where('month', '==', month) .get().then(querySnapshot => {
              let calendarCheckersDocRef = null;
              querySnapshot.forEach(doc => {
                calendarCheckersDocRef = doc.ref;
              })
              if(calendarCheckersDocRef === null) {
                firestore().collection('calendarCheckers').add({diary: ref, month: month}).then(docRef => {
                  resolve({docRef: docRef, type: 'add'});
                }).catch(error => {
                  console.error('Error add document: ', error);
                  resolve(null);
                })
              } else {
                resolve({docRef: calendarCheckersDocRef, type: 'update'});
              }
            })
          })
        }(diaryRef, this.day[1]+1, this.day[2]));
        console.log('calendarChecker =', calendarChecker.docRef);

        function addPiece(gotoPrevRoute) {
          firestore().collection('pieces').add(piece).then(docRef => {
            console.log('add piece docId =', docRef.id);
            calendarChecker.docRef.update({'checkedDays': firestore.FieldValue.arrayUnion({day: piece.day, ref: docRef.id})}).then(() => {
              console.log("Document successfully updated!");
              gotoPrevRoute(piece.day, docRef.id);
            }).catch(error => {console.error("Error updating document: ", error)});
          }).catch(error => {console.error('Error adding document: ', error)});
        }

        if(calendarChecker !== null) {
          piece.calendarCheckerRef = calendarChecker.docRef;
          if(calendarChecker.type == 'add') {
            addPiece(this.gotoPrevRoute);
          } else if(calendarChecker.type == 'update') {
            console.log('piece =', piece);
            if(this.pieceId !== null) {
              firestore().collection('pieces').doc(this.pieceId).update({title: piece.title, content: piece.content, updatedAt: piece.updatedAt}).then(() => {
                console.log("Document successfully updated!");
                this.gotoPrevRoute(piece.day, this.pieceId);
              }).catch(error => {console.error("Error updating document: ", error)})
            } else {
              firestore().collection('pieces').where('calendarCheckerRef', '==', calendarChecker.docRef).where('day', '==', piece.day).get().then(querySnapshot => {
                if(querySnapshot.size <= 0) {
                  addPiece(this.gotoPrevRoute);
                } else {
                  let pieceDoc = null;
                  querySnapshot.forEach(doc => {
                    console.log('doc data =', doc.data());
                    pieceDoc = doc;
                  })
                  if(pieceDoc !== null) {
                    pieceDoc.update({title: piece.title, content: piece.content, updatedAt: piece.updatedAt}).then(() => {
                      console.log("Document successfully updated!");
                      this.gotoPrevRoute(piece.day, pieceDoc.id);
                    }).catch(error => {console.error("Error updating document: ", error)})
                  }
                }
              })
            }
          }
        }
      });
    } else {
      this.props.navigation.goBack();
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={this.onPressWithoutInput.bind(this)}>
        <View style={{flex: 1}}>
          <ScrollView style={{width: '100%'}} ref={ref => this.scrollview = ref} onScroll={event => {this.scrollOffsetY = event.nativeEvent.contentOffset.y}}>
            <View style={{flex: 1, alignItems: 'center', marginTop: 20}}>
              <this.PresentDate thisDay={this.day} />
              <View style={{...styles.textAreaContainer, width: Layout.window.width-40}} onLayout={event => this.layoutTitle = event.nativeEvent.layout} >
                <TextInput
                  style={{...styles.textArea, height: 40}}
                  underlineColorAndroid="transparent"
                  placeholder={i18n.t('inputTitle')}
                  placeholderTextColor="grey"
                  numberOfLines={1}
                  maxLength={128}
                  onFocus={() => this.focusedInput = this.layoutTitle}
                  value={this.state.title}
                  onChangeText={text => this.onChangeTitle(text)}
                />
              </View>
              <View style={{...styles.textAreaContainer, width: Layout.window.width-40}} onLayout={event => this.layoutContent = event.nativeEvent.layout} >
                <TextInput
                  style={{...styles.textArea, height: Layout.window.height*0.4}}
                  underlineColorAndroid="transparent"
                  placeholder={i18n.t('inputContent')}
                  placeholderTextColor="grey"
                  numberOfLines={10}
                  multiline={true}
                  maxLength={1024}
                  onFocus={() => {this.focusedInput = this.layoutContent}}
                  value={this.state.content}
                  onChangeText={text => this.onChangeContent(text)}
                />
              </View>
              <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <Button type='solid' title={i18n.t('Cancel')} containerStyle={styles.buttonStyle} buttonStyle={{backgroundColor: 'dimgray'}} disabled={this.state.disabledCancel} onPress={() => {this.props.navigation.goBack()}} />
                <Button type='solid' title={i18n.t('Save')} containerStyle={styles.buttonStyle} buttonStyle={{backgroundColor: '#4BB543'}} disabled={this.state.disabledSave} loading={this.state.loadingSave} onPress={this.onSave.bind(this)} />
              </View>
              <Animated.View style={{height:this.state.keyboardHeight, backgroundColor: 'lightgray'}}>
              </Animated.View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  elementStyle: {
    paddingHorizontal: Layout.defaultPaddingHorizontal, width: '100%', marginTop: 10
  },
  buttonStyle: {
    paddingHorizontal: Layout.defaultPaddingHorizontal, width: '50%', marginTop: 10
  },
  textAreaContainer: {
    borderColor: 'lightgray',
    borderWidth: 1,
    borderRadius: 5,
    // padding: 5,
    paddingHorizontal: 7,
    marginVertical: 10
  },
  textArea: {
    justifyContent: "flex-start",
    fontSize: Layout.defaultFontSize,
  }
});

