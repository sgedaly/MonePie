import { createDrawerNavigator, createStackNavigator } from 'react-navigation';
import HomeScreen from './screens/HomeScreen.js';
import SideMenu from './screens/SideMenu';
import Wallet from './screens/Wallet.js';
import Friends from './screens/Friends';
import AddFriends from './screens/AddFriends';
import Rules from './screens/Rules';
import FAQ from './screens/FAQ';
import Profile from './screens/Profile';
import AddPaymentMethod from './screens/AddPaymentMethod';
import Feedback from './screens/Feedback';
import Link from './components/Link';
import TransactionHistory from './screens/TransactionHistory'

const AppDrawerNavigator = new createDrawerNavigator({
    HomeScreen: {
        screen: HomeScreen,
    },
    Wallet: {
        screen: Wallet,
    },
    Friends: {
        screen: Friends,
    },
    AddFriends: {
        screen: AddFriends,
    },
    TransactionHistory: {
        screen: TransactionHistory,
    },
    Rules: {
        screen: Rules,
    },
    FAQ: {
        screen: FAQ,
    },
    Feedback: {
        screen: Feedback
    },
    AddPaymentMethod: {
        screen: AddPaymentMethod
    },
    Link: {
        screen: Link
    },
    Profile: {
        screen: Profile,
        navigationOptions: {
            header: null
        },
    },
}, {
        contentComponent: SideMenu,
    });
export default AppDrawerNavigator;