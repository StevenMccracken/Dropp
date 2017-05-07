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
export class MakeDroppScreen extends React.Component {
    render() {
        const { navigate } = this.props.navigation;
        const { params } = this.props.navigation.state;
        return (
            <View style={styles.container}>
                <Button 
                    onPress={() => navigate('TextDropp', { token : params.token })}
                    title="Make a Text Post"
                />
                <Button onPress={() => navigate('PicDropp', { token : params.token })} 
                    title = "Make a Picture post"
                />
            </View>
        );    
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});