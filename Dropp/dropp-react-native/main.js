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
