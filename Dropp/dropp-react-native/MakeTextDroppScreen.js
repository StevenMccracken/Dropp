import React from 'react';
import {
    Button,
    Modal,
    View,
    Text,
    TextInput,
    Keyboard,
    StyleSheet,
    Platform,
} from 'react-native';
import { Constants, Location, Permissions } from 'expo';

export class MakeTextDroppScreen extends React.Component {
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
        } else {
            /*
            async () => {
                let { status } = await Permissions.askAsync(Permissions.LOCATION);
                if (status !== 'granted') {
                    this.setState({
                        errorMessage: 'Permission to access location was denied',
                    });
                }
            }
            */
        }    
    }
    

    _sendTextMessage = () => {
        this.setState({ sendingMessage: true });
        //wait to get location before sending.
        
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
                    animationType={"none"}
                    transparent={true}
                    visible={this.state.sendingMessage}
                    onRequestClose={() => {
                        alert("Something went wrong, you might have not dropped a message.");
                        }}
                    >
                    <View style = {[styles.container, modalBackgroundStyle]}>
                        <View style={[styles.innerContainer, innerContainerTransparentStyle]}>
                            <Text> Dropping message... </Text>
                            <Button title="Cancel" onPress={() => this.setState({sendingMessage: false})}/> 
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