import Expo from 'expo';
import React from 'react';
import {
    Button,
    View,
    AppRegistry,
    Text,
    TextInput,
    Keyboard,
    StyleSheet,
} from 'react-native';

export class MakeTextDroppScreen extends React.Component {
    /*static navigationOptions = ({ navigation }) => ({
        title: `Chat with ${navigation.state.params.user}`,
    });*/
    constructor(props){
        super(props);
        this.state = {text: ''};
    }
    render() {
        // The screen's current route is passed in to props.navigation.state:
        //const { params } = this.props.navigation.state;
        return (
            <View>
                <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 50 }}
              onChangeText={(text) => this.setState({ text })}
              text = {this.state.text}
              onSubmitEditing={Keyboard.dismiss}
              keyboardType={'default'}
            />
            <Button title="Send Dropp" onPress={this._sendTextMessage}/>
            </View>
        );
    }
}