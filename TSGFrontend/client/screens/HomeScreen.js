import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  AsyncStorage,
  View
} from 'react-native';
import { Header } from 'react-native-elements';
import { Container, Spinner, Card, CardItem } from 'native-base';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import GameCard from '../components/GameCard.js';
import firestore from '../firestore.js';
import { Permissions, Notifications } from 'expo';
import Emoji from 'react-native-emoji';
const roundedEdge = 8;


export default class HomeScreen extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      gamesList: [],
      compList: <Text>TSG</Text>,
      bankSetUp: false,
      isReady: false,
      bankComp: <View></View>//<Card style={{
      //   alignItems: 'center',
      //   justifyContent: 'center',
      //   marginRight: 10,
      //   marginLeft: 10,
      //   borderRadius: roundedEdge,
      //   height: 60
      // }}>
      //   <Spinner color='#3cb371ff' />
      // </Card>
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

  async componentWillMount() {
    await Expo.Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    });
    this.setState({ isReady: true })
  }

  async componentDidMount() {
    this._isMounted = true;
    compList = <Spinner color='white' />
    this.setState({
      compList: compList
    })
    this.registerForPushNotifications();
    await this._bootstrapAsync()
    try {
      var that = this;
      firestore.collection("Users").doc(that.state.user)
        .onSnapshot(function (doc) {
          gamesList1 = doc.data()['activeGames'];
          console.log(gamesList1)
          gamesList = [...Object.keys(gamesList1)]
          //Get account name and number, get balance from plaid and show it.
          bankAccount = doc.data()['bankAccount'];
          var bankComp = <TouchableOpacity style={{ paddingBottom: 30 }} onPress={() => that.props.navigation.navigate('Link', { user: that.state.user })}>
            <Card style={styles.cardStyle}>
              <CardItem style={{ borderTopLeftRadius: roundedEdge, borderBottomLeftRadius: roundedEdge, backgroundColor: 'white' }}>
                <SimpleLineIcons name='link' color='#3cb371' size={28} />
              </CardItem>
              <CardItem style={{ backgroundColor: 'white' }}>
                <Text style={{ fontSize: 16, color: '#3cb371', fontFamily: 'Avenir' }}>Link Bank Account</Text>
              </CardItem>
              <CardItem style={{ borderTopRightRadius: roundedEdge, borderBottomRightRadius: roundedEdge, backgroundColor: 'white' }}>
              </CardItem>
            </Card>
          </TouchableOpacity>
          if (bankAccount != null) {
            bankAccountName = bankAccount['name'];
            bankAccount4Last = bankAccount['last4'];
            bankName = bankAccount['bank'];
            bankAccountBalance = 100;
            bankComp = <Card style={{
              flexDirection: 'row',
              alignItems: 'stretch',
              marginRight: 20,
              marginLeft: 20,
              borderRadius: roundedEdge,
              marginBottom: 30,
              backgroundColor: 'white'
            }}>
              <CardItem style={styles.iconSectionStyle}>
                <Emoji name="bank" style={{ fontSize: 40 }} />
              </CardItem>
              <CardItem style={{ flex: 3.5, justifyContent: 'flex-start', flexDirection: 'column', backgroundColor: 'white' }}>
                {/* <View style={{ justifyContent: 'flex-start', flexDirection: 'column' }}> */}
                {/* <Text style={{ fontSize: 30, fontFamily: 'Avenir', alignSelf: 'stretch', color: 'black' }}>${bankAccountBalance.toFixed(2)}</Text> */}
                <Text style={{ color: 'grey', fontFamily: 'Avenir' }}>{bankName + ' - ' + bankAccountName + " " + bankAccount4Last}</Text>
                {/* </View> */}
              </CardItem>
              <CardItem style={{
                flex: 1.9,
                borderTopRightRadius: roundedEdge,
                borderBottomRightRadius: roundedEdge,
                backgroundColor: 'white'
              }}>
                <TouchableOpacity onPress={() => that.props.navigation.navigate('Link', { user: that.state.user })}>
                  <Text style={styles.greenText}>CHANGE</Text>
                </TouchableOpacity>
              </CardItem>
            </Card>
          }
          bsu = doc.data()['paymentInfo'] == null;
          compList = gamesList.map((g) =>
            <TouchableOpacity onPress={() => that.props.navigation.navigate('GameRoomTest', { icon: "arrow-left", game: g, user: that.state.user, moneyInGame: gamesList1[g], canJoin: bankAccount != null })}>
              <GameCard key={g} game={g} user={that.state.user} moneyInGame={gamesList1[g]} />
            </TouchableOpacity>
          )
          if (gamesList.length == 0) {
            compList =
              <View style={{ paddingVertical: 100 }}>
                <Text style={{ fontSize: 25, color: 'grey', fontFamily: 'Avenir', marginHorizontal: 20, textAlign: 'center' }}>You can find all your games here.</Text>
              </View>
          }
          if (that._isMounted) {
            that.setState({
              gamesList: gamesList,
              compList: compList,
              bankSetUp: bsu,
              bankComp: bankComp,
              canJoin: bankAccount != null
            })
          }
        }, function (error) {
          that.setState({
            compList: <Text style={styles.errorStyle}>Error Loading Games</Text>
          })
        }
        )
    } catch (error) {
      console.log("error" + error)
      this.setState({
        compList: <Text style={styles.errorStyle}>Error Loading Games</Text>
      })
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  registerForPushNotifications = async () => {
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = status;

    if (status !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      let finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    let token = await Notifications.getExpoPushTokenAsync();
    firestore.collection("Users").doc(this.state.user).update({
      notificationsToken: token
    })
  }

  render() {
    if (!this.state.isReady) {
      return <Expo.AppLoading />;
    }
    return (
      <Container style={styles.outContainer}>
        <Header
          leftComponent={<TouchableOpacity style={styles.icons}>
            <Ionicons name='md-menu' color='white' size={30} onPress={() => this.props.navigation.toggleDrawer()} />
          </TouchableOpacity>}
          centerComponent={<Text style={styles.navItemStyle}>Savings</Text>}
          rightComponent={<TouchableOpacity style={styles.icons}>
            <Ionicons name='md-add' color='white' size={30} onPress={() => this.props.navigation.navigate('JoinPublicGame', { user: this.state.user, canJoin: this.state.canJoin })} />
          </TouchableOpacity>}
          outerContainerStyles={{ backgroundColor: '#3cb371', height: 88, marginBottom: 5 }}
        />
        <ScrollView>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('JoinPublicGame', { user: this.state.user, canJoin: this.state.canJoin })}>
            <Card style={styles.cardStyle}>
              <CardItem style={{ borderTopLeftRadius: roundedEdge, borderBottomLeftRadius: roundedEdge, backgroundColor: 'white' }}>
                <Ionicons name='md-add' color='#3cb371' size={30} />
              </CardItem>
              <CardItem style={{ backgroundColor: 'white' }}>
                <Text style={{ fontSize: 16, color: '#3cb371', fontFamily: 'Avenir' }}>Join a new game</Text>
              </CardItem>
              <CardItem style={styles.iconSectionStyle2}>
              </CardItem>
            </Card>
          </TouchableOpacity>
          {this.state.bankComp}
          <Text style={{
            fontSize: 18, color: 'black', fontFamily: 'Avenir', fontWeight: 'bold', marginLeft: 20
          }}>
            Games
        </Text>
          {this.state.compList}
        </ScrollView>
      </Container >
    );
  }
}

const styles = StyleSheet.create({
  outContainer: {
    backgroundColor: 'white',
  },
  greenText: {
    color: '#3cb371',
    fontSize: 12,
    paddingLeft: 15,
    fontFamily: 'Avenir'
  },
  icons: {
    marginLeft: 0,
    marginBottom: 0
  },
  navItemStyle: {
    fontSize: 18,
    fontFamily: 'Avenir',
    color: 'white'
  },
  errorStyle: {
    fontSize: 18,
    color: 'white',
    marginLeft: 100
  },
  cardStyle: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginRight: 20,
    marginLeft: 20,
    borderRadius: roundedEdge,
    backgroundColor: 'white'
  },
  iconSectionStyle: {
    flex: 1.3,
    borderTopLeftRadius: roundedEdge,
    borderBottomLeftRadius: roundedEdge,
    backgroundColor: 'white'
  },
  iconSectionStyle2: {
    flex: 1.6,
    borderTopRightRadius: roundedEdge,
    borderBottomRightRadius: roundedEdge,
    backgroundColor: 'white'
  },
});
