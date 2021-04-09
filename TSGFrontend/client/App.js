import React from 'react';
import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
//import MyApp from './MyApp.js';
import AuthPage from './authentication/AuthPage.js';
import DrawerNavigator from './DrawerNavigator';
import ProfNav from './ProfileNavigator';
import GameStackNavigator from './GamesStackNavigator';
import WalletNavigator from './WalletNavigator';
import { Font } from 'expo';
import { setCustomText } from 'react-native-global-props';

// const customTextProps = {
//   style: {
//     fontFamily: 'Montserrat-SemiBold'
//   }
// }

export default class App extends React.Component {
  constructor(props) {
    super(props);
    console.disableYellowBox = true;
    this.state = {
      user: ''
    }
  }

  render() {
    return (
      <AppNavigator />
    );
  }
}

const AppStack = DrawerNavigator;
const GameStack = GameStackNavigator;
const ProfileStack = ProfNav;
const WalletStack = WalletNavigator;
const AuthStack = createStackNavigator({

  LoginScreen: {
    screen: AuthPage,
    navigationOptions: {
      header: null
    },
  },
});

const AppNavigator = createAppContainer(createSwitchNavigator(
  {
    //AuthLoading: AuthLoadingScreen,
    Games: GameStack,
    ProfileNav: ProfileStack,
    WalletNav: WalletStack,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'Auth',
  }
));
