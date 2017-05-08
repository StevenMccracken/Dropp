import Expo from 'expo';
import { TabNavigator, StackNavigator } from 'react-navigation';
import { MakeTextDroppScreen } from './Screens/MakeTextDroppScreen';
import { MakeDroppScreen } from './Screens/MakeDroppScreen';
import { MakePicDroppScreen} from './Screens/MakePicDroppScreen';
import { LoginScreen } from './Screens/LoginScreen';
import { CreateAccountScreen } from './Screens/CreateAccountScreen';
import { FeedScreen } from './Screens/FeedScreen';

const App = StackNavigator({
    Login: { screen: LoginScreen },
    CreateAccount: { screen: CreateAccountScreen },
    Home: { screen: FeedScreen },
    MakeDropp: { screen: MakeDroppScreen },
});

Expo.registerRootComponent(App);
