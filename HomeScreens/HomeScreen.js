import React from 'react';
import {View, ScrollView, TouchableOpacity, Platform} from 'react-native';
import update from 'react-addons-update';
import {Image, Button, Text} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import MyUtils from '../utilities/MyUtils';

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      diaries: []
    }
  }

  componentDidMount() {
    auth().onAuthStateChanged(user => {
      if(user) {
        console.log('signed in user =', user.uid);
        firestore().collection('diaries').where('uid', '==', user.uid).get().then(querySnapshot => {
          let diaries = new Array();
          querySnapshot.forEach(doc => {
            let data = doc.data();
            diaries.push({title: data.title, cover: data.cover, docId: doc.id, year: data.year});
          })
          this.setState({diaries: update(this.state.diaries, {$push: diaries})});
        }).catch(error => {
          console.error("Error query data: ", error);
        })
      } else {
        console.log('not SignIn state');
        this.props.navigation.navigate('SignIn');
      }
    })
  }
  componentWillUnmount() {
  }
  toDiary = (index) => {
    this.props.navigation.navigate('Diary', {diary: this.state.diaries[index]});
  }
  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ScrollView>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly', flexWrap: 'wrap', width: '100%'}}>
            {this.state.diaries.map((diary, index) => {
              return (
                <View key={index}>
                  <TouchableOpacity style={{alignItems: 'center', margin: 5}} onPress={this.toDiary.bind(this, index)}>
                    <Image style={{width: 150, height: 200}} resizeMode='cover' source={{uri: diary.cover}}/>
                    <Text style={{marginTop: 4, fontSize: 20}}>{diary.title + '(' + diary.year + ')'}</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        </ScrollView>
      </View>
    );
  }
}
