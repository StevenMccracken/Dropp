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
import * as ClientUtil from './ClientUtilities';

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
        console.log("Sending parameters: ");
        console.log(params);
        console.log("End of parameters");

        var formData = ClientUtil.makeFormData(params);
        
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
                console.log(responseObj);
                if (responseObj.success) {
                    console.log("returned success");
                    console.log(responseObj.success.token);
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
                        [ {text: 'Ok', onPress: () => console.log('ok pressed')}, ],
                        { cancelable: true }
                    );
                    console.log(responseObj.error.message);
                }
            });
        });
    }

    _sendAccountRequest = async () => {
        //create a post request
        var params = {
            username: this.state.username,
            password: this.state.password,
            email: this.state.email,
        };
        console.log("Sending parameters: ");
        console.log(params);
        console.log("End of parameters");

        var formData = [];
        for (var k in params) {
            var encodedKey = encodeURIComponent(k);
            var encodedValue = encodeURIComponent(params[k]);
            formData.push(encodedKey + "=" + encodedValue);
        }
        formData = formData.join("&");
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
                console.log(responseObj);
                if (responseObj.error) { //error occurred when making an account.
                    Alert.alert(
                        'Account Creation Error',
                        responseObj.error.message,
                        [ {text: 'Ok', onPress: () => console.log('ok pressed')}, ],
                        { cancelable: true }
                    );
                } else { //we successfully made a user!
                    Alert.alert(
                        'Account Creation Successful',
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
            <ScrollView style={{padding: 20}}>
                <Text 
                    style={{fontSize: 27}}>
                    Make an Account
                </Text>
                <TextInput 
                    placeholder='Username'
                    onChangeText={(username) => this.setState({ username })}
                    value = {this.state.username}
                />
                <TextInput 
                    placeholder='Password' 
                    onChangeText={(password) => this.setState({ password })}
                    value = {this.state.password}
                />
                <TextInput 
                    placeholder='Email' 
                    onChangeText={(email) => this.setState({ email })}
                    value = {this.state.email}
                />
                <View style={{margin:7}} />
                <Button 
                        onPress={this._sendAccountRequest}
                        title="Start Dropping!"
                    />
                <Text>{textErrorMessage}</Text>
            </ScrollView>
        )
    }
}