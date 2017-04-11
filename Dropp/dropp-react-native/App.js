import React from 'react';
import { Text, View, Keyboard, TextInput, StyleSheet, TouchableHighlight, Image, Button } from 'react-native';
import { ImagePicker, Location, Permissions } from 'expo';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      makeDropp: false,
      makeText: false,
      makePic: false,
			msgText: "",
			msgImg: null,
      location: null,
      errorMessage: null,
    };
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied.',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  }

  _droppbuttonPressed = () => {
    this.setState({
      makeDropp: !this.state.makeDropp,
      makeText: false,
      makePic: false
    });
  }
  _textButtonPressed = () => {
    this.setState({ makeText: !this.state.makeText });
  }
  _picButtonPressed = () => {
    this.setState({ makePic: !this.state.makePic });
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

	_sendDroppButtonPressed = () => {
    this._getLocationAsync();
		fetch("http://dropps.me/api/dropps", {
			method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
			body: JSON.stringify({
				media: "",
				text: this.state.msgText,
				location: this.state.location,
				timestamp: Math.round(Date.now() / 1000).toString(),
				user_id: "Alan's custom POST request from react-native.",
			})
		});	}

  state = {
    image: null,
  };
  render() {
    let returnView;
    let { image } = this.state;
    if (this.state.makeDropp) {
      if (this.state.makeText) {
        returnView = (
          <View>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 100}}
              onChangeText={(text) => this.setState({ msgText: text })}
							placeholder="Type your message here!"
              text ={this.state.text}
              onSubmitEditing={Keyboard.dismiss}
              keyboardType={'default'}
            />
						<Button onPress={this._sendDroppButtonPressed} title="Dropp Message"/>
            <TouchableHighlight onPress={this._droppbuttonPressed}>
              <Text style={styles.button}>
                <Text> Return </Text>
              </Text>
            </TouchableHighlight>
          </View>
        )
      }
      if (this.state.makePic) {
        returnView = (
          <View>
            <TouchableHighlight onPress={this._pickImage}>
              <Text style={styles.button}>
                <Text> Pick an Image </Text>
              </Text>
            </TouchableHighlight>
            <TouchableHighlight onPress={this._droppbuttonPressed}>
              <Text style={styles.button}>
                <Text> Return </Text>
              </Text>
            </TouchableHighlight>

            {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
          </View>
        )
      }
      if(!this.state.makePic && !this.state.makeText) {
        returnView = (
          <View>
            <TouchableHighlight onPress={this._textButtonPressed}>
              <Text style={styles.texButton}>
                <Text> Text </Text>
              </Text>
            </TouchableHighlight>
            <TouchableHighlight onPress={this._picButtonPressed}>
              <Text style={styles.picButton}>
                <Text> Picture </Text>
              </Text>
            </TouchableHighlight>
            <TouchableHighlight onPress={this._droppbuttonPressed}>
              <Text style={styles.button}>
                <Text> Return </Text>
              </Text>
            </TouchableHighlight>
          </View>
        )
      }
    }
    else {
      returnView = (
        <View>
          <TouchableHighlight onPress={this._droppbuttonPressed}>
            <Text style={styles.button}>
              <Text> Make a Dropp!!! </Text>
            </Text>
          </TouchableHighlight>
        </View>
      )
    }
    return (<View style={styles.container}>{returnView}</View>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderWidth: 1,
    padding: 25,
    borderColor: 'red'
  },
  texButton: {
    borderWidth: 1,
    padding: 25,
    borderColor: 'blue'
  },
  picButton: {
    borderWidth: 1,
    padding: 25,
    borderColor: 'purple'
  }

});
