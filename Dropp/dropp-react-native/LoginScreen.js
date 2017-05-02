import React, { Component } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    View,
    Button
} from 'react-native';
import { NavigationActions } from 'react-navigation'

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

        const { navigate } = this.props.navigation;
        fetch(request).then((response) => {
            //convert to JSON
            response.json().then((responseObj) => {
                console.log(responseObj);
                if (responseObj.success) {
                    this.setState({ errorMessage: null })
                    console.log("returned success");
                    console.log(responseObj.success.token);
                    const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'Home', params: { token: responseObj.success.token }})
                    ]
                    });
                    this.props.navigation.dispatch(resetAction);
                    //navigate('Home', { token: responseObj.success.token });
                } else {
                    this.setState({ errorMessage: responseObj.error.message })
                    console.log(responseObj.error.message);
                }
                //route to Dropp Feed with our token!
            });

            //if no errors, set timeout to be 2 seconds, so modal doesn't close immediately.
            
        });
        
    }

    render() {
        let textErrorMessage = this.state.errorMessage ? this.state.errorMessage : ' ';
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
                    onChangeText={(password) => this.setState({ password })}
                    value = {this.state.password}
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
                <Text>{textErrorMessage}</Text>
            </ScrollView>
            )
    }
}