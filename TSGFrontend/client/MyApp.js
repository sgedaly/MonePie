import React from 'react';
import {createDrawerNavigator} from 'react-navigation';
import HomeScreen from './HomeScreen.js';
import MenuBar from './MenuBar.js';

export const MyApp = createDrawerNavigator({
    Home:{
      screen: HomeScreen
    },
    Menu:{
      screen: MenuBar
    }
  })