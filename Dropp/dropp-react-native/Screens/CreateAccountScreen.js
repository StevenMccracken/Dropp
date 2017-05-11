import React, { Component } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    View,
    Button
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import * as HelperFunctions from '../HelperFunctions';

export class CreateAccountScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            email: '',
        };

    };

    _tryLogin = async () => {
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
            });
        });
    }

    _sendAccountRequest = async () => {
        //create a post request
        var param = {
            username: this.state.username,
            password: this.state.password,
            email: this.state.email,
        };

        var formData = ClientUtil.makeFormData(param);

        var request = new Request('https://dropps.me/users', {
            method: 'POST',
            headers: new Headers( {
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            body: formData,
        });
        fetch(request).then((response) => {
            //convert to JSON
            response.json().then((responseObj) => {
                if (responseObj.error) { //error occurred when making an account.
                    Alert.alert(
                        'Account Creation Error',
                        responseObj.error.message,
                        [ {text: 'Ok'}, ],
                        { cancelable: true }
                    );
                } else { //we successfully made a user!
                    Alert.alert(
                        'Account Creation Successful!',
                        'Click \'Ok\' to go into Dropp.',
                        [ {text: 'Ok', onPress: this._tryLogin}, ],
                        { cancelable: false }
                    );                    
                }
            });
            
        });
        
    }

    render() {
        let textErrorMessage = this.state.errorMessage ? this.state.errorMessage : ' ';
        return (
            <View style={{
                    flex: 1,
                    padding: 20,
                    height: 25,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <Text 
                    style={{fontSize: 27, color: '#cc2444'}}>
                    Make an Account
                </Text>
                <TextInput 
                    placeholder='Username'
                    onChangeText={(username) => this.setState({ username })}
                    value = {this.state.username}
                    style = {{
                        height: 50,
                        width: 150,
                    }}
                    underlineColorAndroid={'#cc2444'}
                />
                <TextInput 
                    placeholder='Password' 
                    onChangeText={(password) => this.setState({ password })}
                    value = {this.state.password}
                    style = {{
                        height: 50,
                        width: 150,
                    }}
                    underlineColorAndroid={'#cc2444'}
                />
                <TextInput 
                    placeholder='Email' 
                    onChangeText={(email) => this.setState({ email })}
                    value = {this.state.email}
                    style = {{
                        height: 50,
                        width: 150,
                    }}
                    underlineColorAndroid={'#cc2444'}
                />
                <View style={{margin:7}} />
                <Button 
                        onPress={this._sendAccountRequest}
                        title="Start Dropping!"
                        color='#cc2444'
                    />
                <Text>{textErrorMessage}</Text>
            </View>
        )
    }
}