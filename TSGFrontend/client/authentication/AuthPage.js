import React, { Component } from 'react';
import { Container, Content, Form, Item, Input, Label } from 'native-base';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  AsyncStorage,
  Image,
  Text,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { SocialIcon, Button, Header } from 'react-native-elements';
import Firebase from '../firebase_setup.js';
import firestore from '../firestore.js';
import * as firebase from 'firebase';
import { Asset, ImageManipulator, Font } from 'expo';
import { SimpleLineIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';


class TitleText extends React.Component {
  render() {
    return (
      <Text style={{ fontSize: 18, color: 'black', fontFamily: 'Avenir', fontWeight: 'bold' }}>
        {this.props.label}
      </Text>
    )
  }
}

export default class AuthPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      page: '1',
      first: '',
      last: '',
      email: '',
      password: '',
      loggedIn: false,
      user: '',
      signingUp: false,
      loggingIn: false,
      fontLoaded: false,
      progress: new Animated.Value(0),
      loading: false
    }
  }

  componentDidMount() {
    Animated.loop(Animated.timing(this.state.progress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
    })).start()
  }
  ////////// TEMPORAL TEST to make payment

  goLogIn = () => {
    this.setState({
      page: '2',
    });
  }

  goStart = () => {
    this.setState({
      page: '1',
      loading: false,
      progress: new Animated.Value(0),
    });
  }
  goSignUp = () => {
    this.setState({
      page: '3',
    });
  }
  authFb = async (signingUp) => {
    const {
      type,
      token,
      expires,
      permissions,
      declinedPermissions } = await Expo.Facebook.logInWithReadPermissionsAsync
        ('243630163000534', { permissions: ['public_profile', 'user_friends', 'user_birthday', 'email'] });

    if (type == 'success') {
      const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,birthday,email,friends,picture.type(large)`);
      const info = await response.json()
      console.log(info)
      const credential = firebase.auth.FacebookAuthProvider.credential(token)
      Firebase.auth().signInAndRetrieveDataWithCredential(credential).then(async user => {
        console.log('hello')
        console.log(user)
        first = ''
        last = ''
        entireName = info.name.split(' ');
        if (entireName.length == 1) {
          first = entireName[0]
        } else if (entireName.length == 2) {
          first = entireName[0]
          last = entireName[1]
        } else if (entireName.length == 3) {
          first = entireName[0] + entireName[1]
          last = entireName[2]
        } else if (entireName.length == 4) {
          first = entireName[0] + entireName[1]
          last = entireName[2] + entireName[3]
        } else {
          first = entireName[0]
          last = entireName[1]
        }
        email = info.email
        photoURL = info.picture.data.url
        fbId = info.id
        friends = info.friends.data
        this.createNewUser(first, last, email, photoURL, fbId, friends, signingUp);
        await AsyncStorage.setItem('user', email);
        this.props.navigation.navigate('App', { user: email })
      })
        .catch((error) => {
          alert(error)
          return;
        });
    }
  }
  signUpForm = () => {
    this.setState({
      page: '4',
    });
  }
  logInForm = () => {
    this.setState({
      page: '5',
    });
  }

  signUpUser = (first, last, email, password) => {
    try {
      var f = first.toLowerCase().trim()
      if (f.charAt(f.length - 1) == ' ' && f.charAt(0) == ' ') {
        f = f.substring(1, f.length - 1)
      } else if (f.charAt(f.length - 1) == ' ') {
        f = f.substring(0, f.length - 1)
      } else if (f.charAt(0) == ' ') {
        f = f.substring(1, f.length)
      }
      if (f.length == 0) {
        alert("Enter a non-empty name and last name")
        return
      }

      var l = last.toLowerCase().trim()
      if (l.charAt(l.length - 1) == ' ' && l.charAt(0) == ' ') {
        l = l.substring(1, l.length - 1)
      } else if (f.charAt(l.length - 1) == ' ') {
        l = l.substring(0, l.length - 1)
      } else if (f.charAt(0) == ' ') {
        l = l.substring(1, l.length)
      }
      if (f.length == 0 || l.length == 0) {
        alert("Enter a non-empty name and last name")
        return
      }
      if (this.state.password.length < 8) {
        alert("Password must be at least 8 characters")
        return;
      } else if (f < 1) {
        alert("Please enter your first name")
        return;
      } else if (l < 1) {
        alert("Please enter your last name")
        return;
      }
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var isValidEmail = re.test(email);
      if (!isValidEmail) {
        alert("Please provide a valid email")
        return;
      }
      Firebase.auth().createUserWithEmailAndPassword(email, password).then(e => {
        this.createNewUser(f, l, email, 'https://i.stack.imgur.com/l60Hf.png', '', [], true);
        this.logInUser(this.state.email, this.state.password)
      })
        .catch((error) => {
          alert(error)
          return;
        });
    } catch (error) {
      alert(error)
    }
  }

  logInUser = (email, password) => {
    try {
      if (this.state.password.length < 8) {
        alert("Password must be at least 8 characters")
        return;
      }
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var isValidEmail = re.test(email);
      if (!isValidEmail) {
        alert("Please provide a valid email")
        return;
      }
      this.setState({
        loading: true
      })
      Firebase.auth().signInWithEmailAndPassword(email.toLowerCase(), password).then(async user => {
        console.log(user.user.email)
        this.setState({
          loggedIn: true,
          user: user.email
        });
        await AsyncStorage.setItem('user', user.user.email);
        this.props.navigation.navigate('App', { user: user.user.email })
      })
        .catch((error) => {
          alert(error)
          this.setState({
            loading: false
          })
          return;
        });
    } catch (error) {
      alert(error)
      this.setState({
        loading: false
      })
    }
  }

  resetPassword = (s) => {
    Firebase.auth().sendPasswordResetEmail(this.state.email).then(function () {
      alert("Check your email for instructions")
    }).catch(function (error) {
      alert(error)
    });
  }

  viewStyle = () => {
    return {
      flex: 1,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    }
  }

  createNewUser = async (first, last, email, photoURL, id, friends, signingUp) => {
    try {

      if (signingUp) {
        var userdoc = firestore.collection('Users').doc(email);
        userdoc.set({
          firstName: first.toLowerCase(),
          lastName: last.toLowerCase(),
          email: email.toLowerCase(),
          photoURL: photoURL,
          facebookID: id,
          facebookFriends: friends,
          accountBalance: 0,
          activeGames: {},
          avgGameAmount: null,
          avgPeriodicalContribution: null,
          historicalSavings: 0,
          moneyInPlay: 0,
          monthlySavings: 0,
          responsibilityIndex: null,
          friends: [],
          pastGames: [],
          bankAccount: null,
          PaymentInfo: null,
          transactions: []
        });
      } else {
        var userdoc = firestore.collection('Users').doc(email);
        userdoc.update({
          firstName: first,
          lastName: last,
          email: email,
          photoURL: photoURL,
        });
      }
    } catch (error) {
      alert(error)
    }
  }
  render() {
    if (this.state.page === '1' && Platform.OS === 'android') {
      return (
        <Container style={styles.outContainer}>
          <View style={styles.container}>
            <Swiper
              loop={false}
              showsPagination={true}
              index={0}
              activeDotColor={'#3cb371'}
              dot={<View style={{ backgroundColor: '#e5e5e5', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
            >

              <View style={this.viewStyle()}>
                <View style={{
                  //flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  // borderWidth: 5,
                  // borderColor: 'black'
                }}>
                  <Image source={require('../assets/rsz_logosquare.png')}></Image></View>
                <View style={{
                  //flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 10
                  // borderWidth: 5,
                  // borderColor: 'black'
                }}>
                  <TitleText label="Welcome to MoneyPie" />
                </View>
                <View style={{
                  //flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingLeft: 20,
                  paddingRight: 20
                  // borderWidth: 5,
                  // borderColor: 'black'
                }}>
                  <Text style={{
                    fontSize: 16, color: 'black', textAlign: 'center', fontFamily: 'Avenir'
                  }}>Bulletproof your saving habit while making money</Text>
                </View>
              </View>
              <View style={this.viewStyle()}>
                <LottieView source={require('../assets/animation4.json')} progress={this.state.progress} style={{ height: 200, width: 200 }} />
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 15,
                  paddingLeft: 20,
                  paddingRight: 20
                }}>
                  <TitleText label="Join a Game that fits your savings goal" />
                </View>
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingLeft: 20,
                  paddingRight: 20
                }}>
                  <Text style={{
                    fontSize: 16, color: 'black', textAlign: 'center', fontFamily: 'Avenir'
                  }}>Each game will be joined by people in the MoneyPie community that have similar goals. Games can vary based on overall saving goal, duration of game, period of time to make each payment, and boldness(risk-reward factor)</Text>
                </View>
              </View>
              <View style={this.viewStyle()}>
                <LottieView source={require('../assets/animation5.json')} progress={this.state.progress} style={{ height: 200, width: 200 }} />
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 15,
                  // borderWidth: 5,
                  // borderColor: 'black'
                }}>
                  <TitleText label="Stay alive in the game" />
                </View>
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingLeft: 20,
                  paddingRight: 20
                  // borderWidth: 5,
                  // borderColor: 'black'
                }}>
                  <Text style={{
                    fontSize: 16, color: 'black', textAlign: 'center', fontFamily: 'Avenir'
                  }}>Add money to the game pot before each period ends to stay alive in the game. If you forget to make the payment on time, you will be removed from the game and a percentage of what you saved will go towards the common pot. You can always withdraw from the game with no penalty.</Text>
                </View>
              </View>
              <View style={this.viewStyle()}>
                <LottieView source={require('../assets/superSaver.json')} progress={this.state.progress} style={{ height: 200, width: 200 }} />
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 15,
                  // borderWidth: 5,
                  // borderColor: 'black'
                }}>
                  <TitleText label="Grow your savings and make profit" />
                </View>
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingLeft: 20,
                  paddingRight: 20
                  // borderWidth: 5,
                  // borderColor: 'black'
                }}>
                  <Text style={{
                    fontSize: 16, color: 'black', textAlign: 'center', fontFamily: 'Avenir'
                  }}>If you were responsible enough to stay until the end of the game, you will be able to unlock your savings plus your cut in the common pot. If you didn't make it till the end you can always join other games that better fit your goals.</Text>
                </View>
              </View>
            </Swiper>

            {/* <SocialIcon
              title='Get Started!'
              button
              light
              onPress={this.goSignUp}
              style={{ fontFamily: 'Avenir' }}
            /> */}
            <Button
              title='Sign Up'
              //button
              style={{ paddingBottom: 10, paddingHorizontal: 20 }}
              buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}
              light
              fontFamily="Avenir"
              textStyle={{ color: 'white', fontSize: 18 }}
              backgroundColor='#3cb371'
              onPress={this.signUpForm}
            />
            <View style={styles.textContainer}>
              <TouchableOpacity onPress={this.logInForm} style={styles.helpLink}>
                <Text style={styles.helpLinkText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Container >
      );
    } else if (this.state.page === '1' && Platform.OS === 'ios') {
      return (
        <Container style={styles.outContainer}>
          <View style={styles.container}>
            <Swiper
              loop={false}
              showsPagination={true}
              index={0}
              activeDotColor={'#3cb371'}
              dot={<View style={{ backgroundColor: '#e5e5e5', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
            >

              <View style={this.viewStyle()}>
                <View style={{
                  //flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  // borderWidth: 5,
                  // borderColor: 'black'
                }}>
                  <Image source={require('../assets/rsz_logosquare.png')}></Image></View>
                <View style={{
                  //flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 10
                  // borderWidth: 5,
                  // borderColor: 'black'
                }}>
                  <TitleText label="Welcome to MoneyPie" />
                </View>
                <View style={{
                  //flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingLeft: 20,
                  paddingRight: 20
                  // borderWidth: 5,
                  // borderColor: 'black'
                }}>
                  <Text style={{
                    fontSize: 16, color: 'black', textAlign: 'center', fontFamily: 'Avenir'
                  }}>Bulletproof your saving habit while making money.</Text>
                </View>
              </View>
              <View style={{
                flex: 1,
                backgroundColor: 'white',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'column',
              }}>
                <View style={{ flex: 0.5 }}></View>
                <LottieView source={require('../assets/animation4.json')} progress={this.state.progress} style={{ height: 300, width: 300, flex: 2, marginRight: 35 }} />
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 100,
                  paddingLeft: 20,
                  paddingRight: 20,
                  flex: 3,
                }}>
                  <TitleText label="Join a Game that fits your savings goal" />
                  <Text style={{
                    fontSize: 16, color: 'black', textAlign: 'center', fontFamily: 'Avenir', marginTop: 15
                  }}>Each game will be joined by people in the MoneyPie community that have similar goals. Games can vary based on overall saving goal, duration of game, period of time to make each payment, and boldness(risk-reward factor)</Text>
                </View>
              </View>
              <View style={{
                flex: 1,
                backgroundColor: 'white',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'column',
              }}>
                <View style={{ flex: 0.5 }}></View>
                <LottieView source={require('../assets/animation5.json')} progress={this.state.progress} style={{ height: 300, width: 300, flex: 2, marginRight: 35 }} />
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 100,
                  paddingLeft: 20,
                  paddingRight: 20,
                  flex: 3,
                }}>
                  <TitleText label="Stay alive in the game" />
                  <Text style={{
                    fontSize: 16, color: 'black', textAlign: 'center', fontFamily: 'Avenir', marginTop: 15
                  }}>Add money to the game pot before each period ends to stay alive in the game. If you forget to make the payment on time, you will be removed from the game and a percentage of what you saved will go towards the common pot. You can always withdraw from the game with no penalty.</Text>
                </View>
              </View>
              <View style={{
                flex: 1,
                backgroundColor: 'white',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'column',
              }}>
                <View style={{ flex: 0.5 }}></View>
                <LottieView source={require('../assets/superSaver.json')} progress={this.state.progress} style={{ height: 250, width: 250, flex: 3, marginRight: 65 }} />
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: 100,
                  paddingLeft: 20,
                  paddingRight: 20,
                  flex: 4,
                }}>
                  <TitleText label="Grow your savings and make profit" />
                  <Text style={{
                    fontSize: 16, color: 'black', textAlign: 'center', fontFamily: 'Avenir', marginTop: 15
                  }}>If you were responsible enough to stay until the end of the game, you will be able to unlock your savings plus your cut in the common pot. If you didn't make it till the end you can always join other games that better fit your goals.</Text>
                </View>
              </View>
            </Swiper>

            {/* <SocialIcon
              title='Get Started!'
              button
              light
              onPress={this.goSignUp}
              style={{ fontFamily: 'Avenir' }}
            /> */}
            <Button
              title='Sign Up'
              //button
              style={{ paddingBottom: 10, paddingHorizontal: 20 }}
              buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}
              light
              fontFamily="Avenir"
              textStyle={{ color: 'white', fontSize: 18 }}
              backgroundColor='#3cb371'
              onPress={this.signUpForm}
            />
            <View style={styles.textContainer}>
              <TouchableOpacity onPress={this.logInForm} style={styles.helpLink}>
                <Text style={styles.helpLinkText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Container >
      );
    } else if (this.state.page === '2') {
      return (
        <Container style={styles.outContainer}>
          <TouchableOpacity style={styles.backk} onPress={this.goStart}>
            <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} />
          </TouchableOpacity>
          <View style={styles.container}>
            {/* <SocialIcon
              title='Log In With Facebook'
              button
              light
              type='facebook'
              onPress={() => this.authFb(false)}
            /> */}
            <SocialIcon
              title='Log In With Email'
              button
              light
              onPress={this.logInForm}
            />
            <View style={styles.textContainer}>
              <Text style={styles.helpLinkText}> {"DON'T HAVE AN ACCOUNT?"}</Text>
              <TouchableOpacity onPress={this.goSignUp} style={styles.helpLink}>
                <Text style={styles.helpLinkText}>SIGNUP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Container>
      );
    } else if (this.state.page === '3') {
      return (
        <Container style={styles.outContainer}>
          <TouchableOpacity style={styles.backk} onPress={this.goStart}>
            <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} />
          </TouchableOpacity>
          <View style={styles.container}>
            {/* <SocialIcon
              title='Sign Up With Facebook'
              button
              light
              type='facebook'
              onPress={() => this.authFb(true)}
            /> */}
            <SocialIcon
              title='Sign Up With Email'
              button
              light
              onPress={this.signUpForm}
            />
            <View style={styles.textContainer}>
              <Text style={styles.helpLinkText}>ALREADY HAVE AN ACCOUNT?</Text>
              <TouchableOpacity onPress={this.goLogIn} style={styles.helpLink}>
                <Text style={styles.helpLinkText}>LOGIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Container>
      );
    } else if (this.state.page === '4') {
      return (
        <Container>
          <Content>
            <Form style={styles.helpLink}>
              <TouchableOpacity style={styles.back} onPress={this.goStart}>
                <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} />
              </TouchableOpacity>
              <Item floatingLabel>
                <Label style={{ fontFamily: "Avenir" }}>First Name</Label>
                <Input
                  fontFamily="Avenir"
                  onChangeText={(first) => this.setState({ first })}
                />
              </Item>
              <Item floatingLabel>
                <Label style={{ fontFamily: "Avenir" }}>Last Name</Label>
                <Input
                  fontFamily="Avenir"
                  onChangeText={(last) => this.setState({ last })}
                />
              </Item>
              <Item floatingLabel>
                <Label style={{ fontFamily: "Avenir" }}>Email</Label>
                <Input
                  fontFamily="Avenir"
                  autoCorrect={false}
                  autoCapitalize="none"
                  onChangeText={(email) => this.setState({ email })}
                />
              </Item>
              <Item floatingLabel>
                <Label style={{ fontFamily: "Avenir" }}>Password</Label>
                <Input
                  fontFamily="Avenir"
                  autoCorrect={false}
                  autoCapitalize="none"
                  secureTextEntry={true}
                  onChangeText={(password) => this.setState({ password })}
                />
              </Item>
            </Form>
            <Button
              title='Sign Up'
              //button
              style={{ paddingBottom: 15, paddingHorizontal: 20 }}
              buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}
              light
              fontFamily="Avenir"
              textStyle={{ fontSize: 18 }}
              loading={this.state.loading}
              backgroundColor='#3cb371'
              onPress={() => this.signUpUser(this.state.first, this.state.last, this.state.email, this.state.password)}
            />
          </Content>
        </Container>
      );
    } else if (this.state.page === '5') {
      return (
        <Container>
          <Content>
            <Form style={styles.helpLink}>
              <TouchableOpacity style={styles.back} onPress={this.goStart}>
                <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} />
              </TouchableOpacity>
              <Item floatingLabel>
                <Label style={{ fontFamily: "Avenir" }}>Email</Label>
                <Input
                  autoCorrect={false}
                  fontFamily="Avenir"
                  autoCapitalize="none"
                  onChangeText={(email) => this.setState({ email })}
                />
              </Item>
              <Item floatingLabel>
                <Label style={{ fontFamily: "Avenir" }}>Password</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  fontFamily="Avenir"
                  secureTextEntry={true}
                  onChangeText={(password) => this.setState({ password })}
                />
              </Item>
            </Form>
            <Button
              title='Log In'
              //button
              style={{ paddingBottom: 15, paddingHorizontal: 20 }}
              buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}
              light
              fontFamily="Avenir"
              loading={this.state.loading}
              textStyle={{ fontSize: 18 }}
              backgroundColor='#3cb371'
              onPress={() => this.logInUser(this.state.email, this.state.password)}
            />
            <TouchableOpacity onPress={() => this.setState({ page: '6' })} style={styles.helpLink}>
              <Text style={{ fontSize: 18, color: '#3cb371', fontFamily: 'Avenir', alignSelf: 'center' }}>Forgot your password?</Text>
            </TouchableOpacity>
          </Content>
        </Container>
      );
    } else if (this.state.page === '6') {
      return (
        <Container>
          <Header
            leftComponent={<TouchableOpacity onPress={this.goStart}>
              <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} />
            </TouchableOpacity>}
            centerComponent={<Text style={{ fontSize: 18, fontFamily: 'Avenir' }}>Password Reset</Text>}
            rightComponent={<TouchableOpacity onPress={this.resetPassword}>
              <Text style={{ fontSize: 18, color: '#3cb371', fontFamily: 'Avenir' }}>Reset</Text>
            </TouchableOpacity>}
            outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
          />
          <Text style={{
            paddingTop: 10,
            paddingLeft: 15,
            paddingBottom: 30,
            fontSize: 14,
            fontFamily: 'Avenir',
            textAlign: 'center'
          }}>Please enter the email address associated with your account. We'll send you an email with password reset instructions.</Text>
          <Content>
            <Form style={styles.helpLink}>
              <Item floatingLabel>
                <Label style={{ fontFamily: "Avenir" }}>Email</Label>
                <Input
                  autoCorrect={false}
                  fontFamily="Avenir"
                  autoCapitalize="none"
                  onChangeText={(email) => this.setState({ email })}
                />
              </Item>
            </Form>
          </Content>
        </Container >
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  outContainer: {
    backgroundColor: 'white',
  },
  textContainer: {
    alignItems: 'center',
  },
  but: {
    marginTop: 15,
    marginRight: 15,
    marginLeft: 15,
  },
  helpLink: {
    paddingBottom: 45,
  },
  back: {
    paddingLeft: 15,
    paddingTop: 45,
  },
  backk: {
    paddingLeft: 15,
    paddingTop: 60,
  },
  helpLinkText: {
    fontSize: 18,
    color: '#3cb371',
    fontFamily: 'Avenir'
  },
  container2: {
    flex: 1
  },
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
