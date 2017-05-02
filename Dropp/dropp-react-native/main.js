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
import { Constants, Location, Permissions } from 'expo';

class FeedScreen extends React.Component {
constructor(props){
    super(props);
    this.state = {
            text: '',
            errorMessage: null,
            sendingMessage: false,
            dropps: null,
    };
    this._getDropps();
}
    
    render() {
        const { navigate } = this.props.navigation;

        return (
            <View>
                <FlatList
                    data={this.state.dropps}
                    renderItem={this._renderItem}
                />
            </View>
        );
    }
    _renderItem = ({item}) => (
    <TouchableHighlight noDefaultStyles={true} onPress={() => this._onPress(item)}>
        <View style = {styles.row}>
            <View style = {styles.textcontainer}>
                <Text>{item.text}</Text>
            </View>
            <View style = {styles.photocontainer}>
                {item.image && <Image source = {{uri: item.image}} style ={styles.photo}/>}
            </View>
        </View>
    </TouchableHighlight>
    );

    _getDropps = async() =>{
        console.log("entered getdropss");
        let{status} = await Permissions.askAsync(Permissions.LOCATION);
        if(status !== 'granted'){
            this.state({
                errorMessage: 'Permission to access location was denied',
            });
        } 

    let locData = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    //let curLocation = locData.coords.latitude + "," + locData.coords.longitude;
    let curLocation = "69.0,69.0";
    let curTime = locData.timestamp;

    var param = {
        location: curLocation,
        maxDistance: 15,
    };

    var formData = [];
    for(var i in param){
        var encodeKey = encodeURIComponent(i);
        var encodeValue = encodeURIComponent(param[i]);
        formData.push(encodeKey + "=" + encodeValue);
    }
    formData = formData.join("&");

    var feedRequest = new Request('https://dropps.me/location/dropps', {
        method: 'POST',
        headers: new Headers( {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvZWwiLCJkZXRhaWxzIjp7ImVtYWlsIjoiam9lbEBmYWtlbWFpbC5jb20ifSwiaWF0IjoxNDkzNzAzODgxLCJleHAiOjE0OTYyOTU4ODF9.Saz5GHRtpD0SXRED2RsLg71IBelwiUNgK0Sd8nMmXCU',
        }),
        body: formData,
    });
    var feedList = [];
    //console.log(feedRequest);
    fetch(feedRequest).then((drp) => {
        //console.log(dropps);
        drp.json().then((droppJSON) =>{
            //console.log(droppJSON);
            var dropList = droppJSON.dropps;
            //feedList.push(JSON.stringify(dropList));
            for(var d in dropList) {
                //feedList.push(JSON.stringify(d));
                //console.log(d);
                //console.log(dropList[d]);
                var post = dropList[d];
                feedList.push({d, post});
                console.log(feedList);
            }
            this.setState({dropps: feedList});
        });
    });
    }
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
