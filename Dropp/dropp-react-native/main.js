import Expo from 'expo';
import { TabNavigator, StackNavigator } from 'react-navigation';
import { MakeTextDroppScreen } from './screens/MakeTextDroppScreen';
import { MakeDroppScreen } from './screens/MakeDroppScreen';
import { MakePicDroppScreen} from './screens/MakePicDroppScreen';
import { LoginScreen } from './screens/LoginScreen';
import { CreateAccountScreen } from './screens/CreateAccountScreen';
import { FeedScreen } from './screens/FeedScreen';

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
