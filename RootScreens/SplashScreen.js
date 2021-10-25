import React from 'react';
import {Text, View, Image, TouchableOpacity} from 'react-native';

export default class SplashScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFinished: false
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({isFinished: true}, () => {
        this.props.navigation.navigate('SignIn');
      })
    }, 2500);
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity onPress={() => this.props.navigation.navigate('SignUp')}>
          <Image source={require('../resources/splash.jpg')}/>
        </TouchableOpacity>
      </View>
    );
  }
}
