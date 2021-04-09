import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Container, Spinner } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import firestore from '../firestore.js';
import { Header } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';


export default class Wallet extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      page: '1',
      accountBalance: "",
      historicalSavings: "",
      monthlySavings: "",
      moneyInPlay: "",
      user: this.props.navigation.state.params.user,
      isLoading: true
    }
  }

  componentDidMount() {
    this._isMounted = true;
    var that = this;
    console.log(that.state.user);
    firestore.collection("Users").doc(that.state.user)
      .onSnapshot(function (doc) {
        aB = doc.data()['accountBalance']
        hS = doc.data()['historicalSavings']
        mS = doc.data()['monthlySavings']
        mIP = doc.data()['moneyInPlay']
        bankAccount = null
        if (doc.data()['bankAccount'] != null) {
          bankAccount = doc.data()['bankAccount'].name + " ••••" + doc.data()['bankAccount'].last4;
        }
        now = new Date();
        if (that._isMounted) {
          that.setState({
            accountBalance: aB.toFixed(2),
            historicalSavings: hS.toFixed(2),
            monthlySavings: mS.toFixed(2),
            moneyInPlay: mIP.toFixed(2),
            isLoading: false,
            bankAccount: bankAccount,
            date: (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear(),
            type: 'Transfer to Bank'
          })
        }
      }, function (error) {
        alert(error)
      }
      )
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (this.state.isLoading) {
      return (
        <Container style={styles.outContainer}>
          <Header
            leftComponent={<TouchableOpacity style={styles.icons}>
              <Ionicons name='md-menu' color='#3cb371' size={30} onPress={() => this.props.navigation.toggleDrawer()} />
            </TouchableOpacity>}
            centerComponent={<Text style={styles.navItemStyle}>Wallet</Text>}
            outerContainerStyles={{ backgroundColor: '#3cb371', height: 88, marginBottom: 5 }}
          />
          <Spinner color='grey' />
        </Container>);
    } else {
      return (
        <Container style={styles.outContainer}>
          <Header
            leftComponent={<TouchableOpacity style={styles.icons}>
              <Ionicons name='md-menu' color='#3cb371' size={30} onPress={() => this.props.navigation.toggleDrawer()} />
            </TouchableOpacity>}
            centerComponent={<Text style={styles.navItemStyle}>Wallet</Text>}
            outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
          />
          <ScrollView>
            <Text style={styles.titleItem}>ACCOUNT BALANCE</Text>
            <Text style={styles.money}>{"$" + this.state.accountBalance}</Text>
            <Text style={styles.helpLinkText}>Account Balance includes money from any savings that you have not transferred to your bank account. Money you win in games will end up here.</Text>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('TransferToBank', { user: this.state.user, balance: this.state.accountBalance, bankAccount: this.state.bankAccount, date: this.state.date, type: this.state.type })}>
              <Text style={styles.greenText}>TRANSFER TO BANK</Text>
            </TouchableOpacity>
            <Text style={styles.titleItem}>CASH IN PLAY</Text>
            <Text style={styles.money}>${this.state.moneyInPlay}</Text>
            <Text style={styles.helpLinkText}>Cash In Play includes the money that you added to all your current games.</Text>
            <Text style={styles.titleItem}>MONTHLY SAVINGS</Text>
            <Text style={styles.money}>${this.state.monthlySavings}</Text>
            <Text style={styles.helpLinkText}>This is all the cash you saved the last 30 days.</Text>
            <Text style={styles.titleItem}>TOTAL SAVINGS</Text>
            <Text style={styles.money}>${this.state.historicalSavings}</Text>
            <Text style={styles.helpLinkText}>This is all the cash you have saved since you started using MoneyPie.</Text>
            {/* <TouchableOpacity onPress={() => this.props.navigation.navigate('TransactionHistory', { user: this.state.user })}>
              <Text style={styles.greenText}>TRANSACTION HISTORY</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={{ paddingTop: 45, paddingBottom: 20 }} onPress={() => this.props.navigation.navigate('Link', { user: this.state.user })}>
              <Text style={styles.greenText}>LINK OR CHANGE BANK ACCOUNT</Text>
            </TouchableOpacity>
          </ScrollView>
        </Container>
      );
    }
  }
}

const styles = StyleSheet.create({
  outContainer: {
    backgroundColor: 'white',
  },
  sectionHeadingStyle: {
    paddingTop: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Avenir'
  },
  titleItem: {
    paddingTop: 45,
    paddingLeft: 15,
    fontSize: 12,
    color: 'grey',
    fontFamily: 'Avenir'
  },
  icons: {
    marginLeft: 0,
    marginBottom: 0
  },
  navItemStyle: {
    fontSize: 18,
    fontFamily: 'Avenir'
  },
  icon2: {
    flex: 1,
  },
  money: {
    paddingTop: 3,
    paddingLeft: 15,
    fontSize: 30,
    fontFamily: 'Avenir'
  },
  helpLinkText: {
    fontSize: 12,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    color: '#D3D3D3',
    fontFamily: 'Avenir'
  },
  greenText: {
    color: '#3cb371',
    fontSize: 12,
    paddingTop: 10,
    paddingLeft: 15,
    fontFamily: 'Avenir'
  }
});