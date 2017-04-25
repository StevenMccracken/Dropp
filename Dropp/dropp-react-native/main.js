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
import { TabNavigator, StackNavigator } from 'react-navigation';


class FeedScreen extends React.Component {
    render() {
        const { navigate } = this.props.navigation;
        return (
            <View>
                <Text>PLACEHOLDER for list of dropps near area.</Text>
            </View>
        );
    }
}

class MakeDroppScreen extends React.Component {
    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <Button 
                    onPress={() => navigate('TextDropp')}
                    title="Make a Text Post"
                />
            </View>
        );    }
}

const MainScreenNavigator = TabNavigator({
    Feed: { screen: FeedScreen },
    Dropp: { screen: MakeDroppScreen },
}, /*{
        navigationOptions: {
            title: "My Chats",
        },
    }*/);

class MakeTextDroppScreen extends React.Component {
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
            <Button title="return" onPress={this._droppbuttonPressed}/>
            </View>
        );
    }
}

const App = StackNavigator({
    Home: { screen: MainScreenNavigator },
    TextDropp: { screen: MakeTextDroppScreen },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

Expo.registerRootComponent(App);
