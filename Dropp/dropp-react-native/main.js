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
    Modal,
} from 'react-native';

import { TabNavigator, StackNavigator } from 'react-navigation';
import { MakeTextDroppScreen } from './MakeTextDroppScreen';
import { MakeDroppScreen } from './MakeDroppScreen';
import { MakePicDroppScreen} from './MakePicDroppScreen';
import { LoginScreen } from './LoginScreen';
import { CreateAccountScreen } from './CreateAccountScreen';
import { Constants, Location, Permissions } from 'expo';

class FeedScreen extends React.Component {
constructor(props){
    super(props);
    this.state = {
            text: '',
            errorMessage: null,
            sendingMessage: false,
            dropps: null,
            modalVisible: false,
            transparent: true,
            //modal data
            modalText: null,
            modalTimeStamp: null,
            modalImage: null,
    };
    this._getDropps();
}
    
    render() {
        const { navigate } = this.props.navigation;
        var modalBackgroundStyle = { backgroundColor: this.state.transparent ? 'rgba(0, 0, 0, 0.5)' : '#f5fcff', };
        var innerContainerTransparentStyle = this.state.transparent ? {backgroundColor: '#ffff', padding: 20}: null;
        var activeButtonStyle = { backgroundColor: '#ddd' };
        return (
            <View>
                <Modal 
                    animationType = 'fade' 
                    transparent = {this.state.transparent} 
                    visible={this.state.modalVisible} 
                    supportedOrientations = {["portrait"]} 
                    onRequestClose={() => this._setModalVisible(false)}>
                    <View style={[styles.modalContainer, modalBackgroundStyle]}>
                        <View style={[styles.modalInnerContainerTop, innerContainerTransparentStyle]}>
                            <View style = {styles.photocontainer}>
                                {this.state.modalImage && <Image source = {{uri: this.state.modalImage}} style ={styles.photo}/>}
                            </View>           
                        </View>
                        <View style={[styles.modalInnerContainerBottom, innerContainerTransparentStyle]}>
                            <Text style = {styles.modaltime}>{this._msToTime(this.state.modalTimeStamp)} </Text>
                            <Text>{this.state.modalText}</Text>
                            <Button 
                                onPress={this._setModalVisible.bind(this, false)} 
                                style={styles.modalButton} 
                                title = "close"/>
                        </View>
                    </View>
                </Modal>
                <FlatList
                    data={this.state.dropps}
                    renderItem={this._renderItem}
                    onRefresh = {this._onRefresh}
                    refreshing = {false}
                />
            </View>
        );
    }

    _renderItem = ({item}) => (
    <TouchableHighlight noDefaultStyles={true} onPress={() => this._onPress(item)} underlayColor ={"lightsalmon"} activeOpacity = {10}>
        <View style = {styles.row}>
            <View style = {styles.textcontainer}>
                <Text>{item.item.text}</Text>
            </View>
            <View style = {styles.photocontainer}>
                {item.media && <Image source = {{uri: item.media}} style ={styles.photo}/>}
            </View>
        </View>
    </TouchableHighlight>
    );

    _onPress = (item) => {
        console.log("Pressed");
        //set the modal data here with item
        this.setState({modalText: item.text});
        this.setState({modalTimeStamp: item.timestamp});
        this.setState({modalImage: item.photo});
        this._setModalVisible(true);
    };

    _msToTime(s) {
        // Pad to 2 or 3 digits, default is 2
        function pad(n, z) {
            z = z || 2;
            return ('00' + n).slice(-z);
        }
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
    }

    _setModalVisible = (visible) => {
        this.setState({modalVisible: visible});
    };

    _onRefresh = () => {this._getDropps();}

    _getDropps = async() => {
        const { params } = this.props.navigation.state;
        console.log( params );

        console.log("entered getdropss");
        let{status} = await Permissions.askAsync(Permissions.LOCATION);
        if(status !== 'granted'){
            this.state({
                errorMessage: 'Permission to access location was denied',
            });
        } 

        let locData = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
        //let curLocation = locData.coords.latitude + "," + locData.coords.longitude;
        let curLocation = "33.7786396,-118.1139802";
        let curTime = locData.timestamp;

        var param = {
            location: curLocation,
            maxDistance: 1000,
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
                'Authorization': params.token,
            }),
            body: formData,
        });
        var feedList = [];
        //parsing the json object into the array
        fetch(feedRequest).then((drp) => {
            drp.json().then((droppJSON) =>{
                var dropList = droppJSON.dropps;
                //for(var d in dropList) {
                //    var post = dropList[d];
                //   console.log(d);
                //   feedList.push(post);
                //}
                //console.log(dropList);
                this.setState({dropps: dropList});
            });
        });
    }
}
const MainScreenNavigator = TabNavigator({
    Feed: { screen: FeedScreen },
    Dropp: { screen: MakeDroppScreen },
    }, {
        tabBarOptions: {
            style:{
                backgroundColor: '#ffa07a',
                opacity: 100,
            },
        },
    });

const App = StackNavigator({
    Login: { screen: LoginScreen },
    CreateAccount: { screen: CreateAccountScreen },
    Home: { screen: MainScreenNavigator },
    TextDropp: { screen: MakeTextDroppScreen },
    PicDropp: {screen: MakePicDroppScreen },
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
    borderBottomColor: '#000000'
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
  },
  modalButton: {
    marginTop: 10,
    paddingVertical: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    height: 200,
    padding: 25,
  },
  modalInnerContainerBottom: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    
    alignItems: 'center',
  },
  modalInnerContainerTop: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
  },
  modaltime: {
      fontSize: 12,
      textAlign: 'left',
  }
});

Expo.registerRootComponent(App);
