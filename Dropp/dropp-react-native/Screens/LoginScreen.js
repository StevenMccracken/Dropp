import React, { Component } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    View,
    Button,
    Alert,
    StyleSheet,
} from 'react-native';
import { Constants } from 'expo';
import { NavigationActions } from 'react-navigation';
import * as HelperFunctions from '../HelperFunctions';

export class LoginScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            errorMessage: null,
            sendingMessage: false,
        };
    };

    _tryLogin = async () => {
        this.setState({ sendingMessage: true });
        //create a post request
        var params = {
            username: this.state.username,
            password: this.state.password,
        };

        var formData = HelperFunctions.makeFormData(params);

        var request = new Request('https://dropps.me/authenticate', {
            method: 'POST',
            headers: new Headers( {
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            body: formData,
        });

        const { navigate } = this.props.navigation;
        fetch(request).then((response) => {
            //convert to JSON
            response.json().then((responseObj) => {
                if (responseObj.success) {
                    this.setState({ errorMessage: null })
                    const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.init({ routeName: 'Home', params: { token: responseObj.success.token }})
                    ]
                    });
                    this.props.navigation.dispatch(resetAction);
                } else {
                    Alert.alert(
                        'Login Error',
                        responseObj.error.message,
                        [ {text: 'Ok'}, ],
                        { cancelable: true }
                    );
                }
            }).catch((error) => {
                console.log("Couldn't connect to server.");
            });
            
        });
        
    }

    render() {
        let textErrorMessage = this.state.errorMessage ? this.state.errorMessage : ' ';
        const { navigate } = this.props.navigation;
        return (
            <View style={[styles.container]}>
                <Text 
                    style={{fontSize: 27, color: '#cc2444'}}>
                    Login to Dropp
                </Text>
                <TextInput 
                    placeholder='Username'
                    onChangeText={(username) => this.setState({ username })}
                    value = {this.state.username}
                    style = {styles.loginText}
                    underlineColorAndroid={'#cc2444'}
                />
                <TextInput 
                    placeholder='Password' 
                    onChangeText={(password) => this.setState({ password })}
                    value = {this.state.password}
                    style = {styles.loginText}
                    secureTextEntry = {true}
                    underlineColorAndroid={'#cc2444'}
                />  
                <View style={[{margin:15}]} />
                <View style = {styles.button}>
                <Button 
                        onPress={this._tryLogin}
                        title="Log in"
                        color='#cc2444'
                    />
                <View style={{margin:5}} />
                <Button 
                        onPress={() => navigate('CreateAccount')}
                        title="Make an account"
                        color='#cc2444'
                    />
                <Text>{textErrorMessage}</Text>
                </View>
            </View>
            )
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText:{
    height: 50,
    width: 150,
  },
  button:{
    height: 75,
    width: 150,
    alignItems: 'center',
  }
});
