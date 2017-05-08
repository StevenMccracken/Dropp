import Expo from 'expo';
import React from 'react';
import {
    Button,
    Image,
    Modal,
    View,
    AppRegistry,
    Text,
    TextInput,
    Keyboard,
    StyleSheet,
    Platform,
} from 'react-native';
import { Constants, ImagePicker, Location, Permissions } from 'expo';
import * as HelperFunctions from '../HelperFunctions';


export class MakeDroppScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            text: '',
            image: null,
            errorMessage: null,
            uploadingPicture: false,
            sendingMessage: false,
        };

    };

    static navigationOptions = ({ navigation }) => ({
        title: `Create a Dropp`,
        headerRight: <Button title="Send" onPress={navigation.state.params.sendDropp}/>
    });

    componentWillMount() {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        }
        this.props.navigation.setParams({ sendDropp: this._sendDropp });
    }
    
    _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
        });
        if (!result.cancelled) {
            this.setState({ image: result.uri });
        }
        this.setState({ uploadingPicture: false });
    }
    _takePic = async () => {
        let result1 = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
        });
        if(!result1.cancelled) {
            this.setState({ image: result1.uri });
        }
        this.setState({ uploadingPicture: false });
    }

    _sendDropp = async () => {
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

        var formData = HelperFunctions.makeFormData(param);
        var request = new Request('https://dropps.me/dropps', {
            method: 'POST',
            headers: new Headers( {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': params.token,
            }),
            body: formData,
        });
        //send an HTTP request to upload the text content
        fetch(request).then((response) => {
            response.json().then((responseObj) => {
                if (!responseObj.ok) {
                    console.log(responseObj);
                }
                console.log(responseObj);
                //upon success, get the droppID and send another POST request to the server if we have an image
                if (this.state.image) {
                    const image = {
                        uri: this.state.image,
                        type: 'image/jpeg',
                        name: 'image.jpg',
                    };

                    const imageBody = new FormData();
                    imageBody.append('droppId', responseObj.droppId);
                    imageBody.append('image', image);
                    var request2 = new Request('https://dropps.me/dropps/' + responseObj.droppId + '/image', {
                        method: 'POST',
                        headers: new Headers( {
                            'Authorization': params.token,
                            'Content-type': 'multipart/form-data',
                        }),
                        body: imageBody,
                    });

                    fetch(request2).then((response) => {
                        console.log(response);
                        response.json().then((responseObj) => {
                            console.log(responseObj);
                        })
                    })
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
        let { image } = this.state;

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
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.uploadingPicture}
                    onRequestClose={() => {
                        this.setState({ uploadingPicture: false });
                        console.log("Cancelled image upload.");
                        }}
                    >
                    <View style = {[styles.container, modalBackgroundStyle]}>
                        <View style={[styles.innerContainer, innerContainerTransparentStyle]}>
                            <Button title="Camera" onPress={this._takePic}/> 
                            <Button title="Library" onPress={this._pickImage}/> 
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
                    {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
                    <Button title="Attach image" onPress={() => {this.setState({ uploadingPicture: true })}}/> 
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