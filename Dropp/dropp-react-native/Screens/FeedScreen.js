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
    };
    this._getDropps();
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
                            <View style = {styles.photocontainer}>
                                {this.state.modalImage && <Image source = {{uri: this.state.modalImage}} style ={styles.photo}/>}
                            </View>           
                        </View>
                        <View style={[styles.modalInnerContainerBottom, innerContainerTransparentStyleBot]}>
                            <Text fontSize = '12'>{this.state.modalText}</Text>
                            <View style = {styles.modalButton}>
                                <Button 
                                    onPress={this._setModalVisible.bind(this, false)} 
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
                    buttonColor="rgba(23,76,60,1)"
                    onPress={() => { navigate('MakeDropp', { token : params.token })}}
                />
            </View>
        );
    }

    _renderItem = ({item}) => {
        const { params } = this.props.navigation.state;
        console.log(item);
        var imageuri = null;
        if (item.post.media === "true"){
                var feedRequest = new Request("https://dropps.me/dropps/" + item.d + "/image", {
                    method: 'GET',
                    headers: new Headers( {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': params.token,
                        'Platform': 'Android',
                    }),
                });
                fetch(feedRequest)
                .then((response) => {
                    imageuri = response;
                });
        }
        return(
            <TouchableHighlight noDefaultStyles={true} onPress={() => this._onPressDropp(item, imageuri)} underlayColor ={"lightsalmon"} activeOpacity = {10}>
                <View style = {styles.row}>
                    <View style = {styles.textcontainer}>
                        <Text>{item.post.username}</Text>
                        <Text>{item.post.text}</Text>
                    </View>
                    <View style = {styles.photocontainer}>
                        {item.post.media === "true" && imageuri && <Image source = {{uri: imageuri }} style ={styles.photo}/>}
                    </View>
                </View>
            </TouchableHighlight>
        )};
    
    _onPressDropp = (item, imageuri) => {
        console.log(item.post.media);
        //set the modal data here with item
        this.setState({modalText: item.post.text});
        this.setState({modalImage: imageuri});
        this._setModalVisible(true);
    };

    _setModalVisible = (visible) => {
        this.setState({modalVisible: visible});
    };

    _onRefresh = () => {this._getDropps();}

    _getDropps = async() => {
        const { params } = this.props.navigation.state;
        console.log( params );

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
                for(var d in dropList) {
                    var post = dropList[d];
                    feedList.push({d,post});
                }
                this.setState({dropps: feedList});
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
    flexWrap: 'wrap',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    padding: 5,
    borderBottomColor: '#000000'
  },
  textcontainer: {
      flex: 2,
      marginLeft: 30,
  },
  photocontainer:{
      flex: 1,
      //justifyContent: 'center',
      alignItems:'flex-end',
      width: 60,
      height: 60,
  },
  photo: {
      width: 120,
      height: 120,
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
