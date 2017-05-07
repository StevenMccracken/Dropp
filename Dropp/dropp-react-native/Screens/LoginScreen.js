import React, { Component } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    View,
    Button
} from 'react-native';
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
            });
            
        });
        
    }

    render() {
        let textErrorMessage = this.state.errorMessage ? this.state.errorMessage : ' ';
        const { navigate } = this.props.navigation;
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
                        onPress={this._tryLogin}
                        title="Log in"
                    />
                <Button 
                        onPress={() => navigate('CreateAccount')}
                        title="Make an account"
                    />
                <Text>{textErrorMessage}</Text>
            </ScrollView>
            )
    }
}