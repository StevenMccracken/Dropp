import React, { Component } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    View,
    Button
} from 'react-native';

export class CreateAccountScreen extends React.Component {


    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            errorMessage: null,
            sendingMessage: false,
        };

    };

    _sendLoginCredentials = async () => {
        this.setState({ sendingMessage: true });

        //create a post request
        var params = {
            username: this.state.username,
            password: this.state.password,
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
        var request = new Request('https://dropps.me/authenticate', {
            method: 'POST',
            headers: new Headers( {
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            body: formData,
        });
        fetch(request).then((response) => {
            //convert to JSON
            response.json().then((responseObj) => console.log(responseObj));

            //if no errors, set timeout to be 2 seconds, so modal doesn't close immediately.
            //setTimeout(() => {this.setState({ sendingMessage: false})}, 2000);
            
        });
        
    }

    render() {
        return (
            <ScrollView style={{padding: 20}}>
                <Text 
                    style={{fontSize: 27}}>
                    Login
                </Text>
                <TextInput 
                    placeholder='Username'
                    onChangeText={(username) => this.setState({ username })}
                    value = {this.state.username}
                />
                <TextInput 
                    placeholder='Password' 
                    onChangeText={(username) => this.setState({ username })}
                    value = {this.state.username}
                />
                <View style={{margin:7}} />
                <Button 
                        onPress={this._sendLoginCredentials}
                        title="Submit"
                    />
                <Button 
                        onPress={this.props.onLoginPress}
                        title="Create Account"
                    />
                </ScrollView>
            )
    }
}