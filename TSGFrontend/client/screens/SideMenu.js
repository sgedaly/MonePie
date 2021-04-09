import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, AsyncStorage } from 'react-native';
import { SimpleLineIcons, MaterialIcons } from '@expo/vector-icons';
import { Avatar } from 'react-native-elements';
import firestore from '../firestore.js';

class SideMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //user: this.props.navigation.state.params.user,
      //user: 'test_uwoyptg_user@tfbnw.net',
      userName: '',
      picture: 'https://i.stack.imgur.com/l60Hf.png'
    }
  }
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('user');
    console.log(userToken)
    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    this.setState({
      user: userToken
    })
  };

  async componentDidMount() {
    var that = this;
    that.setState({
      userFirst: "",
      userLast: "",
      user: '',
    })
    await this._bootstrapAsync()
    try {
      firestore.collection("Users").doc(that.state.user)
        .onSnapshot(function (doc) {
          name = doc.data()['firstName'] + " " + doc.data()['lastName'];
          userFirst = doc.data()['firstName'],
            userLast = doc.data()['lastName'],
            picture = doc.data()['photoURL']
          that.setState({
            userFirst: userFirst.charAt(0).toUpperCase() + userFirst.slice(1),
            userLast: userLast.charAt(0).toUpperCase() + userLast.slice(1),
            picture: picture,
          })
        })
    } catch (error) {
      that.setState({
        userFirst: "",
        userLast: "",
        picture: ""
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Avatar
              large
              rounded
              source={{ uri: this.state.picture }}
              activeOpacity={0.7}
            />
          </View>
          <Text style={styles.nameText}>
            {this.state.userFirst + " " + this.state.userLast}
          </Text>
          <Text style={{
            fontSize: 14,
            paddingBottom: 20,
            fontFamily: 'Avenir'
          }}>
            {this.state.user}
          </Text>
          <TouchableOpacity style={{ paddingBottom: 30 }} onPress={() => this.props.navigation.navigate('EditProfile', { user: this.state.user })}>
            <SimpleLineIcons name='pencil' color='#3cb371' size={20} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen', { user: this.state.user })} style={styles.sectionHeadingStyle}>
            <SimpleLineIcons name='home' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>Savings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionHeadingStyle} onPress={() => this.props.navigation.navigate('Wallet', { user: this.state.user })}>
            <SimpleLineIcons name='wallet' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionHeadingStyle} onPress={() => this.props.navigation.navigate('TransactionHistory', { user: this.state.user })}>
            <SimpleLineIcons name='layers' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Link', { user: this.state.user })} style={styles.sectionHeadingStyle}>
            <SimpleLineIcons name='link' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>Link Bank Account</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.sectionHeadingStyle}>
            <SimpleLineIcons name='trophy' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionHeadingStyle}>
            <SimpleLineIcons name='people' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionHeadingStyle}>
            <SimpleLineIcons name='bell' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>Notifications</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.sectionHeadingStyle} onPress={() => this.props.navigation.navigate('Rules', { user: this.state.user })}>
            <SimpleLineIcons name='list' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>Rules</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionHeadingStyle} onPress={() => this.props.navigation.navigate('FAQ', { user: this.state.user })}>
            <SimpleLineIcons name='question' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionHeadingStyle} onPress={() => this.props.navigation.navigate('Feedback', { user: this.state.user })}>
            <SimpleLineIcons name='social-dropbox' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>Leave us Feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionHeadingStyle} onPress={() => this.props.navigation.navigate('Auth')}>
            <SimpleLineIcons name='logout' color='#3cb371' size={28} />
            <Text style={styles.navItemStyle}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.footerContainer}>
          <Text style={styles.helpLinkText}>Copyright © 2018 by Saving Games, Inc. All rights reserved.</Text>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1
  },
  navItemStyle: {
    paddingLeft: 20,
    fontFamily: 'Avenir'
  },
  navSectionStyle: {
    backgroundColor: 'lightgrey'
  },
  sectionHeadingStyle: {
    paddingTop: 20,
    paddingLeft: 8,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  footerContainer: {
    padding: 20,
  },
  helpLinkText: {
    fontSize: 10,
    color: '#D3D3D3',
    fontFamily: 'Avenir'
  },
  nameText: {
    fontSize: 20,
    paddingTop: 15,
    fontFamily: 'Avenir'
  },
  profileContainer: {
    alignItems: 'center',
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 0.26
  },
  avatar: {
    paddingTop: 30
  }
});

SideMenu.propTypes = {
  navigation: PropTypes.object
};

export default SideMenu;
