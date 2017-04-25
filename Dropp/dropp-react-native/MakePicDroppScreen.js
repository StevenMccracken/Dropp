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
    Image
} from 'react-native';
import { ImagePicker } from 'expo';

export class MakePicDroppScreen extends React.Component {
    constructor(props){
        super(props);
    }

    _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
        });
        if (!result.cancelled) {
            this.setState({ image: result.uri });
        }
    }
    _takePic = async () => {
        let result1 = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
        });
        if(!result1.cancelled) {
            this.setState({ image: result1.uri });
        }
    }

    state = {
        image: null,
    };

    render() {
        let { image } = this.state;
        return (
            <View>
            <Button title = "Pick an Image" onPress= {this._pickImage}/>

            <Button title = "take an Image" onPress={this._takePic}/>
            
            {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
          </View>
        );    
    }
}


//{image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}