import Expo from 'expo';
import { TabNavigator, StackNavigator } from 'react-navigation';
import { MakeTextDroppScreen } from './Screens/MakeTextDroppScreen';
import { MakeDroppScreen } from './Screens/MakeDroppScreen';
import { MakePicDroppScreen} from './Screens/MakePicDroppScreen';
import { LoginScreen } from './Screens/LoginScreen';
import { CreateAccountScreen } from './Screens/CreateAccountScreen';
import { FeedScreen } from './Screens/FeedScreen';

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

Expo.registerRootComponent(App);
