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
import { Constants, Location, Permissions } from 'expo';
import ActionButton from 'react-native-action-button';

export class FeedScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {
                text: '',
                errorMessage: null,
                sendingMessage: false,
                dropps: [],
                modalVisible: false,
                transparent: true,
                //modal data
                modalText: null,
                modalImage: null,
                droppIDToDataURI: {},
        };
        this._getDropps();
    }

    static navigationOptions = ({ navigation }) => ({
        title: `Nearby Dropps`,
    });    

    componentWillReceiveProps(nextProps) {
        console.log(nextProps.navigation.state.params);
        if (nextProps.navigation.state.params.updateNeeded === true) {
            this._getDropps();
        }
    }
    
    render() {
        const { navigate } = this.props.navigation;
        const { params } = this.props.navigation.state;

        var modalBackgroundStyle = { backgroundColor: this.state.transparent ? 'rgba(0, 0, 0, 0.5)' : '#f5fcff', };
        var innerContainerTransparentStyleTop = this.state.transparent ? {backgroundColor: '#ffff', padding: 20, height: 325}: null;
        var innerContainerTransparentStyleBot = this.state.transparent ? {backgroundColor: '#ffff', padding: 20, height: 150}: null;
        var activeButtonStyle = { backgroundColor: '#ddd' };
        
        return (
            <View style={[styles.container]}>
                <Modal 
                    animationType = 'fade' 
                    transparent = {this.state.transparent} 
                    visible={this.state.modalVisible} 
                    supportedOrientations = {["portrait"]} 
                    onRequestClose={() => this._setModalVisible(false)}>
                    <View style={[styles.modalContainer, modalBackgroundStyle]}>
                        <View style={[styles.modalInnerContainerTop, innerContainerTransparentStyleTop]}>
                            {this.state.modalImage && <Image source = {{uri: this.state.modalImage}}
                                style = {{width: 400, height: 400,}} 
                                resizeMode = {Image.resizeMode.contain}/>}
                        </View>
                        <View style={[styles.modalInnerContainerBottom, innerContainerTransparentStyleBot]}>
                            <Text fontSize = '12'>{this.state.modalText}</Text>
                            <View style = {styles.modalButton}>
                                <Button 
                                    onPress={this._setModalVisible.bind(this, false)}
                                    color='#cc2444' 
                                    title = "close"/>
                            </View>
                        </View>
                    </View>
                </Modal>
                <FlatList
                    data={this.state.dropps}
                    renderItem={this._renderItem}
                    onRefresh = {this._onRefresh}
                    refreshing = {false}
                    keyExtractor = {item => item.d}
                />
                <ActionButton 
                    buttonColor='#cc2444'
                    onPress={() => { navigate('MakeDropp', { token : params.token })}}
                />
            </View>
        );
    }

    _renderItem = ({item}) => {
        const { params } = this.props.navigation.state;
        return(
            <TouchableHighlight noDefaultStyles={true} onPress={() => this._onPressDropp(item, this.state.droppIDToDataURI[item.d])} underlayColor ={"lightsalmon"} activeOpacity = {10}>
                <View style = {styles.row}>
                    <View style = {styles.textcontainer}>
                        <Text style = {{fontWeight: 'bold'}}>{item.post.username}</Text>
                        <Text>{item.post.text}</Text>
                    </View>
                    <View style = {styles.photocontainer}>
                        {item.post.media && <Image source = {{uri: this.state.droppIDToDataURI[item.d] }} 
                            style = {styles.photo} 
                            resizeMode = {Image.resizeMode.contain}/>}
                    </View>
                </View>
            </TouchableHighlight>
        )};
    
    _onPressDropp = (item, imageuri) => {
        //set the modal data here with item
        this.setState({modalText: item.post.text});
        this.setState({modalImage: imageuri});
        this._setModalVisible(true);
    };

    _setModalVisible = (visible) => {
        this.setState({modalVisible: visible});
    };

    _onRefresh = () => {
        this._getDropps();
    }

    _getDropps = async() => {
        const { params } = this.props.navigation.state;

        let{status} = await Permissions.askAsync(Permissions.LOCATION);
        if(status !== 'granted'){
            this.state({
                errorMessage: 'Permission to access location was denied',
            });
        } 

        let locData = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
        let curLocation = locData.coords.latitude + "," + locData.coords.longitude;
        //let curLocation = "33.7786396,-118.1139802";
        let curTime = locData.timestamp;

        var param = {
            location: curLocation,
            maxDistance: 100,
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
                for(var d in dropList) {
                    var post = dropList[d];
                    feedList.push({d,post});
                }
                feedList.reverse();
                this.setState({dropps: feedList});
                for(let i = 0; i < feedList.length; i++){
                    let dropp = feedList[i];
                    console.log(dropp.d);
                    if (dropp.post.media) {
                        console.log("https://dropps.me/dropps/" + dropp.d + "/image");
                        var feedRequest = new Request("https://dropps.me/dropps/" + dropp.d + "/image", {
                            method: 'GET',
                            headers: new Headers( {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Authorization': params.token,
                                'Platform': 'React-Native',
                            }),
                        });
                        fetch(feedRequest)
                        .then((response) => {
                            var newMapping = this.state.droppIDToDataURI;
                            newMapping[dropp.d] = response._bodyInit;
                            this.setState({droppIDToDataURI: newMapping});
                        }).catch((error) => {
                            console.log(error);
                        });
                    }
                }
            });
        });
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    padding: 5,
    borderBottomColor: '#cc2444'
  },
  textcontainer: {
      marginLeft: 30,
  },
  photocontainer:{
    margin: 5,
    width: 60,
    height: 60,
    alignItems: 'flex-end',
    backgroundColor: '#555555',
  },
  photo: {
    width: 60,
    height: 60,
  },
  modalButton: {
    marginTop: 10,
    height: 30,
    width: 70,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    height: 250,
    padding: 5,
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
