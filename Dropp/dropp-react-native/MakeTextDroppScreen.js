import Expo from 'expo';
import React from 'react';
import {
    Button,
    Modal,
    View,
    AppRegistry,
    Text,
    TextInput,
    Keyboard,
    StyleSheet,
    Platform,
} from 'react-native';
import { Constants, Location, Permissions } from 'expo';

export class MakeTextDroppScreen extends React.Component {
    /*static navigationOptions = ({ navigation }) => ({
        title: `Chat with ${navigation.state.params.user}`,
    });*/
    constructor(props){
        super(props);
        this.state = {
            text: '',
            errorMessage: null,
            sendingMessage: false,
        };

    };

    componentWillMount() {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        }
    }
    

    _sendTextMessage = async () => {
        const { params } = this.props.navigation.state;

        this.setState({ sendingMessage: true });

        
        //get location
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let realWorldData = await Location.getCurrentPositionAsync({enableHighAccuracy : true});
        let currentCoordinates = realWorldData.coords.latitude + ", " + realWorldData.coords.longitude;
        let currentTime = realWorldData.timestamp;
        //create a post request
        var param = {
            location: currentCoordinates,
            timestamp: currentTime,
            text: this.state.text,
            media: 'false',
        };

        var formData = [];
        for (var k in param) {
            var encodedKey = encodeURIComponent(k);
            var encodedValue = encodeURIComponent(param[k]);
            formData.push(encodedKey + "=" + encodedValue);
        }
        formData = formData.join("&");
        var request = new Request('https://dropps.me/dropps', {
            method: 'POST',
            headers: new Headers( {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': params.token,
            }),
            body: formData,
        });
        fetch(request).then((response) => {
            response.json().then((responseObj) => {
                if (!responseObj.ok) {
                    console.log(responseObj);
                }
            });

            //if no errors, set timeout to be 2 seconds, so modal doesn't close immediately.
            setTimeout(() => {this.setState({ sendingMessage: false})}, 2000);
            
        });
        
    }

    render() {
        var modalBackgroundStyle = {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        };
        var innerContainerTransparentStyle = {
            backgroundColor: '#fff', padding: 20,
        };

        return (
            <View>
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.sendingMessage}
                    onRequestClose={() => {
                        alert("Something went wrong, you might have not dropped a message.");
                        }}
                    >
                    <View style = {[styles.container, modalBackgroundStyle]}>
                        <View style={[styles.innerContainer, innerContainerTransparentStyle]}>
                            <Text> Dropping message... </Text>
                        </View>
                    </View>
                </Modal>
                <View style = {[modalBackgroundStyle]}>
                    <TextInput
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                        onChangeText={(text) => this.setState({ text })}
                        value = {this.state.text}
                        multiline = {true}
                        numberOfLines = {4}
                        onSubmitEditing={Keyboard.dismiss}
                        keyboardType={'default'}
                    />
                    <Button title="Send Dropp" onPress={this._sendTextMessage}/> 
                </View>       
            </View>
        );
    }
}

var styles = StyleSheet.create( {
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    innerContainer: {
        borderRadius: 10,
        alignItems: 'center',
    },
});