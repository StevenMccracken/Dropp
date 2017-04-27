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
    FlatList,
    TouchableHighlight,
    Image,
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
                <FlatList
                    data={[{title: 'asfasfasjkfhkasdhfjlkashdflkbhalkhalshasdlgsdfgjlksdfhgldfhglkjefhglsdfhlgksdjfhglk', image:'https://facebook.github.io/react/img/logo_og.png', key: 'a'}, 
                        {title: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' , image: 'https://facebook.github.io/react/img/logo_og.png', key: 'b'},
                         {title: 'hello2' , image: 'https://facebook.github.io/react/img/logo_og.png',  key: 'c'},
                          {title: 'hello2' , image:' ', key: 'd'},
                           {title: 'hello2' , image:' ', key: 'e'},
                            {title: 'hello2' , image:' ', key: 'f'},
                             {title: 'hello2' , image: 'https://facebook.github.io/react/img/logo_og.png', key: 'g'},
                              {title: 'hello2' , image:' ', key: 'h'},
                               {title: 'hello2' , image:' ', key: 'i'},
                                {title: 'hello2' , image:' ', key: 'j'},
                                 {title: 'hello2' , image:' ', key: 'k'},
                                  {title: 'hello2' , image:' ', key: 'l'},
                                   {title: 'hello2' , image:' ', key: 'm'},
                                    {title: 'hello2' , image:' ', key: 'n'},
                                     {title: 'hello2' , image:' ', key: 'o'},
                                      {title: 'hello2' , image:' ', key: 'p'},]}
                    renderItem={this._renderItem}
                />
            </View>
        );
    }
    _renderItem = ({item}) => (
    <TouchableHighlight noDefaultStyles={true} onPress={() => this._onPress(item)}>
        <View style = {styles.row}>
            <View style = {styles.textcontainer}>
                <Text>{item.title}</Text>
            </View>
            <View style = {styles.photocontainer}>
                {item.image && <Image source = {{uri: item.image}} style ={styles.photo}/>}
            </View>
        </View>
    </TouchableHighlight>
    );
}

const MainScreenNavigator = TabNavigator({
    Feed: { screen: FeedScreen },
    Dropp: { screen: MakeDroppScreen },
}, /*{
        navigationOptions: {
            title: "My Chats",
        },
    }*/
);

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
  row: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    padding: 25,
    borderBottomColor: '#E4E4E4'
  },
  dropptext:{
      flex: 2,
      flexDirection: 'row',
      padding: 10
  },
  textcontainer: {
      flex: 2
  },
  photocontainer:{
      flex: 1,
      justifyContent: 'center',
      alignItems:'center',
      width: 120,
      height: 120,
  },
  photo: {
      width: 120,
      height: 120,
  }
});

Expo.registerRootComponent(App);
