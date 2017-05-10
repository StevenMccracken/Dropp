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
    TouchableHighlight,
} from 'react-native';
import { Constants, ImagePicker, Location, Permissions } from 'expo';
import * as HelperFunctions from '../HelperFunctions';
import { NavigationActions } from 'react-navigation';

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
            timestamp: Math.floor(currentTime / 1000), //convert from ms to seconds
            text: this.state.text,
            media: this.state.image ? 'true': 'false',
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
                if (!responseObj.droppId) {
                    console.log(responseObj);
                    this.setState({errorMessage: 'Sorry, we couldn\'t make a Dropp for you at the moment.'});
                    setTimeout(() => {this.setState({ sendingMessage: false})}, 2000);
                } else {
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
                            this.setState({errorMessage: null});
                            setTimeout(() => {
                                this.setState({ sendingMessage: false});
                                //route back to main screen
                                const resetAction = NavigationActions.reset({
                                index: 0,
                                actions: [
                                    NavigationActions.init({ routeName: 'Home', params: { token: params.token, updateNeeded: true }})
                                ]
                                });
                                this.props.navigation.dispatch(resetAction);
                            }, 2000);
                        }).catch((error) => {
                            console.log(error);
                            this.setState({errorMessage: 'Sorry, we couldn\'t send the picture bundled with your Dropp.'});
                            setTimeout(() => {this.setState({ sendingMessage: false})}, 2000);
                        });
                    } else {
                        setTimeout(() => {
                            this.setState({ sendingMessage: false});
                            //route back to main screen
                            const resetAction = NavigationActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.init({ routeName: 'Home', params: { token: params.token, updateNeeded: true }})
                            ]
                            });
                            this.props.navigation.dispatch(resetAction);
                        }, 2000);
                    }
                }

            });            
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
            <View style = {styles.container}>
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.sendingMessage}
                    onRequestClose={() => {
                        //prevent users from cancelling the modal
                        console.log("Not allowed to close modal.");
                        }}
                    >
                    <View style = {[styles.modalContainer, modalBackgroundStyle]}>
                        <View style={[styles.innerContainer, innerContainerTransparentStyle]}>
                            {this.state.errorMessage && <Text>{this.state.errorMessage}</Text> || <Text>Dropping your message..</Text>}
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.uploadingPicture}
                    supportedOrientations = {["portrait"]} 
                    onRequestClose={() => {
                        this.setState({ uploadingPicture: false });
                        console.log("Cancelled image upload.");
                        }}
                    >
                    <View style = {[styles.modalContainer, modalBackgroundStyle]}>
                        <View style={[styles.innerContainer, innerContainerTransparentStyle]}>
                            <Button title="Camera" onPress={this._takePic}/>
                            <View style={{marginTop: 10}}/>
                            <Button title="Library" onPress={this._pickImage}/> 
                        </View>
                    </View>
                </Modal>
                <View>
                    <View style = {{
                        borderBottomColor: '#000000',
                        borderBottomWidth: 1,
                        }}>
                        <TextInput
                            style={{height: 100, borderColor: 'gray', borderWidth: 1, fontSize: 20, alignSelf: 'stretch', textAlignVertical: 'top'}}
                            onChangeText={(text) => this.setState({ text })}
                            value = {this.state.text}
                            multiline = {true}
                            numberOfLines = {4}
                            onSubmitEditing={Keyboard.dismiss}
                            keyboardType={'default'}
                        />
                        </View>
                    <TouchableHighlight onPress={() => {this.setState({ uploadingPicture: true })}}>
                        {image ? <Image source={{ uri: image }} style={styles.imageContainer} /> :
                            <Image source={require('../defaultPhoto.png')} style={styles.imageContainer} /> }
                    </TouchableHighlight>
                </View>       
            </View>
        );
    }
}

var styles = StyleSheet.create( {
    container: {
        alignItems: 'stretch',
        flex: 1,
    },
    innerContainer: {
        borderRadius: 10,
        alignItems: 'center',
    },
    imageContainer: {
        marginTop: 15,
        width: 300, 
        height: 300, 
        alignSelf: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        height: 250,
        padding: 25,
    },
});