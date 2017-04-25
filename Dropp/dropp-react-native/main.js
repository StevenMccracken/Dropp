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
import { MakeTextDroppScreen } from './MakeTextDroppScreen';
import { MakeDroppScreen } from './MakeDroppScreen';
import { MakePicDroppScreen} from './MakePicDroppScreen';

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

const MainScreenNavigator = TabNavigator({
    Feed: { screen: FeedScreen },
    Dropp: { screen: MakeDroppScreen },
}, /*{
        navigationOptions: {
            title: "My Chats",
        },
    }*/);

const App = StackNavigator({
    Home: { screen: MainScreenNavigator },
    TextDropp: { screen: MakeTextDroppScreen },
    PicDropp: {screen: MakePicDroppScreen},
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
