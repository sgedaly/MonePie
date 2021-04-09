import React from 'react';
import { View, Text } from 'react-native';
import { Card, CardItem, Spinner } from 'native-base';
import PaymentButton from './PaymentButton';
import firestore from '../firestore.js';
import Emoji from 'react-native-emoji';
import firebase from '@firebase/app';
import { Button } from 'react-native-elements';
import util from 'util';
import 'firebase/firestore';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import Dialog, { DialogContent, SlideAnimation } from 'react-native-popup-dialog';

const roundedEdge = 8;

export default class GameCard extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      page: '1',
      //user: this.props.navigation.state.params.user,
      user: 'sam_lhbmrxg_test@tfbnw.net',
      endDate: '',
      amountToSave: '',
      gameName: '',
      dailyContribution: 0,
      risk: 0,
      emoji: '',
      addButtonEnable: true,
      totalPot: 0,
      collapsed: true,
      loading: false,
      loadingCard: true,
      won: false,
      paymentStatus: 'nothing',
    }
  }

  componentDidMount() {
    this._isMounted = true;
    var that = this;
    firestore.collection('Games').doc(this.props.game)
      .onSnapshot(function (doc) {
        endDate = doc.data()['endingDate'].toDate();
        startDate = doc.data()['startingDate'].toDate();
        endDate.setHours(endDate.getHours());
        startDate.setHours(startDate.getHours());
        amountToSave = doc.data()['amountToSave'].toFixed(2);
        gameName = doc.data()['gameName'];
        contribution = doc.data()['periodicalContribution'];
        risk = doc.data()['risk'];
        //currentDate = new Date("2019-02-18T10:00:00Z");
        currentDate = new Date();
        difference = endDate - currentDate;
        fromStart = currentDate - startDate;
        daysLeft = Math.floor(difference / 1000 / 60 / 60 / 24);
        fromStart = Math.floor(fromStart / 1000 / 60 / 60 / 24);
        hourDifference = (24 - currentDate.getHours()) + ((doc.data()['paymentPeriodWindow'] - (fromStart % doc.data()['paymentPeriodWindow']) - 1) * 24);
        //currentAmountSaved = (Math.floor(fromStart / doc.data()['paymentPeriodWindow'])) * contribution;//Hay que chequear la list de los que ya pagaron el dia para ver si el user pago para poner el monto
        //exacto que pago.
        playersThatPaid = doc.data()['dailyUserPaymentCheck'];
        totalPot = doc.data()['totalPot'];
        if (playersThatPaid.includes(that.props.user)) {
          //currentAmountSaved = currentAmountSaved + contribution
          that.setState({
            addButtonEnable: false
          });
        }
        won = false
        currentAmountSaved = that.props.moneyInGame
        currentAmountSaved = currentAmountSaved.toFixed(2);
        emoji = doc.data()['emoji'];
        pctg = Math.floor((currentAmountSaved / amountToSave) * 100)
        if (pctg == 0) {
          pctg = 7.5
        } else if (pctg == 100) {
          won = true
        }
        if (that._isMounted) {
          that.setState({
            endDate: endDate,
            amountToSave: amountToSave,
            gameName: gameName,
            dailyContribution: contribution,
            currentAmountSaved: currentAmountSaved,
            risk: risk * 100,
            daysLeft: daysLeft,
            emoji: emoji,
            totalPot: totalPot,
            hourDifference: hourDifference,
            pctg: pctg,
            won: won,
            loadingCard: false
          })
        }
      })
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  prettyPrintResponse = response => {
    console.log(util.inspect(response, { colors: true, depth: 4 }));
  };

  async pay() {
    /////
    console.log("paying")
    this.setState({
      paymentStatus: 'loading'
    })
    try {//mbu
      await fetch('https://money-pie-server.herokuapp.com/plaidAuth', {
        method: 'POST',
        headers: {
          //'Accept': 'application/x-www-form-urlencoded',
          'Content-Type': 'application/json',//'x-www-form-urlencoded'
        },
        mode: 'cors',
        body: JSON.stringify({
          user: this.props.user,
          amount: this.state.dailyContribution.toFixed(2),//this.state.dailyContribution.toFixed(2)
          option: 'pay'
        }),
      })
        .then((response) => {
          console.log("payment reponse......")
          this.prettyPrintResponse(response)
          if (response.status == 300) { //balance not enough
            console.log('no balance')
            this.setState({
              paymentStatus: 'no balance'
            })
          } else if (response.status == 200) {
            var that = this;
            //The following is the behavior once the user successfully paid from either his "accountBalance" or directly from plaid
            firestore.collection('Games').doc(that.props.game).update({
              totalPot: that.state.totalPot + that.state.dailyContribution,
              dailyUserPaymentCheck: firebase.firestore.FieldValue.arrayUnion(that.props.user)
            });
            //update moneyInPlay
            firestore.collection("Users").doc(that.props.user).get().then(function (doc) {
              moneyInPlay = doc.data()['moneyInPlay'] + that.state.dailyContribution;
              moneyInGame = doc.data()['activeGames'][that.props.game] + that.state.dailyContribution;
              bankAccount = doc.data()['bankAccount'].name + " ••••" + doc.data()['bankAccount'].last4;
              now = new Date();
              ref = firestore.collection('Users').doc(that.props.user);
              console.log("updating transactions")
              ref.update({
                moneyInPlay: moneyInPlay,
                transactions: firebase.firestore.FieldValue.arrayUnion({
                  amount: that.state.dailyContribution,
                  bankAccount: bankAccount,
                  date: (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear(),
                  type: 'Game Payment',
                  key: Math.random()
                })
              });
              var update = {}
              update['activeGames.' + that.props.game] = moneyInGame
              ref.update(update)
              pctg = Math.floor((moneyInGame / that.state.amountToSave) * 100)
              if (pctg < 7.5) {
                pctg = 7.5
              } else if (pctg == 100) {
                won = true
              }
              that.setState({
                currentAmountSaved: moneyInGame.toFixed(2),
                pctg: pctg,
                won: won
              });
            });
            console.log('done')
            this.setState({
              paymentStatus: 'done'
            })
          } else if (response.status == 404) {
            console.log('failed')
            this.setState({
              paymentStatus: 'failed'
            })
          }
        })
        .catch(error => console.error('Error: ', error))//Agregar unsuccessful link
        .then(response => {
          console.log('Success:', JSON.stringify(response))
        })
    } catch (error) {
      this.setState({
        paymentStatus: 'failed'
      })
    }
  }

  async pay2() {
    var that = this;
    //The following is the behavior once the user successfully paid from either his "accountBalance" or directly from plaid
    firestore.collection('Games').doc(that.props.game).update({
      totalPot: that.state.totalPot + that.state.dailyContribution,
      dailyUserPaymentCheck: firebase.firestore.FieldValue.arrayUnion(that.props.user)
    });
    //update moneyInPlay
    firestore.collection("Users").doc(that.props.user).get().then(function (doc) {
      moneyInPlay = doc.data()['moneyInPlay'] + that.state.dailyContribution;
      moneyInGame = doc.data()['activeGames'][that.props.game] + that.state.dailyContribution;
      bankAccount = doc.data()['bankAccount'].name + " ••••" + doc.data()['bankAccount'].last4;
      now = new Date();
      ref = firestore.collection('Users').doc(that.props.user);
      console.log("updating transactions")
      ref.update({
        moneyInPlay: moneyInPlay,
        transactions: firebase.firestore.FieldValue.arrayUnion({
          amount: that.state.dailyContribution,
          bankAccount: bankAccount,
          date: (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear(),
          type: 'Game Payment',
          key: Math.random()
        })
      });
      var update = {}
      update['activeGames.' + that.props.game] = moneyInGame
      ref.update(update)
      pctg = Math.floor((moneyInGame / that.state.amountToSave) * 100)
      if (pctg < 7.5) {
        pctg = 7.5
      }
      that.setState({
        currentAmountSaved: moneyInGame.toFixed(2),
        pctg: pctg
      });
    });
  }

  render() {
    if (this.state.paymentStatus == 'nothing') {
      visible = false;
      show = <View></View>
    } else if (this.state.paymentStatus == 'loading') {
      visible = true;
      show = <Spinner color='#3cb371'></Spinner>
    } else {
      visible = true;
      if (this.state.paymentStatus == 'no balance') {
        txt = 'Payment was not accepted because insufficient balance.'
      } else if (this.state.paymentStatus == 'failed') {
        txt = 'Payment was not accepted, try again later.'
      } else {
        txt = 'Payment Accepted! You are one step closer towards your goal'
      }
      show = <View><Text style={{ fontSize: 18, fontFamily: 'Avenir', paddingHorizontal: 30, paddingVertical: 20, textAlign: 'center' }}>{txt}</Text>
        <Button
          title="Done"
          light
          buttonStyle={{ borderRadius: 5, width: 95, height: 35, padding: 2, alignSelf: 'center' }}
          fontSize={16}
          backgroundColor='#3cb371'
          textStyle={{ fontSize: 18, fontFamily: "Avenir", color: "white" }}
          //onPress={this.notNow}
          onPress={() => { this.setState({ paymentStatus: 'nothing' }) }}
        /></View>
    }
    if (this.state.loadingCard) {
      return (
        <Card style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
          marginLeft: 10,
          borderRadius: roundedEdge,
          height: 125
        }}>
          <Spinner color='#3cb371ff' />
        </Card>
      )
    }
    return (
      <View style={{
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 8,
        marginRight: 20,
        marginLeft: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.6,
        height: 145
      }}>
        <CardItem style={styles.iconSectionStyle}>
          <Emoji name={this.state.emoji} style={{ fontSize: 40 }} />
        </CardItem>

        <CardItem style={styles.infoSectionStyle}>
          <View style={{ justifyContent: 'flex-start', flexDirection: 'column' }}>
            <Text style={{ color: 'black', fontFamily: 'Avenir', fontSize: 13 }}>You have saved:</Text>
            <Text style={styles.money}>{"$" + this.state.currentAmountSaved}</Text>
            <Text style={{ color: 'black', fontFamily: 'Avenir', fontSize: 13 }}>{this.state.risk + "% penalty"}</Text>
            <Text style={{ color: 'black', paddingBottom: 5, fontFamily: 'Avenir', fontSize: 13 }}>{this.state.daysLeft + " days left"}</Text>
            <ProgressBarAnimated
              width={140}
              value={this.state.pctg}
              height={10}
              backgroundColorOnComplete="#6CC644"
              borderColor={'rgba(207, 207, 207, 0.36)'}
              backgroundColor={'#3cb371'}
            />
          </View>
        </CardItem>

        <CardItem style={styles.paySectionStyle}>
          <PaymentButton
            payAmount={this.state.dailyContribution}
            onPress={() => this.pay()}
            enabled={this.state.addButtonEnable}
            hourDifference={this.state.hourDifference}
            loading={this.state.loading}
            won={this.state.won}
          />
        </CardItem>
        <Dialog
          visible={visible}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
        >
          <DialogContent style={{
            flexDirection: 'column',
            alignItems: 'center',
            paddingRight: 10,
            paddingLeft: 10,
            borderRadius: roundedEdge,
            backgroundColor: 'white',
            height: 160,
            width: 320
          }}>
            {show}
          </DialogContent>
        </Dialog>
      </View>
    );
  }
}

const styles = {
  viewStyle: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  expandStyle: {
    flex: 1,
    height: 50,
    width: 50
  },
  cardStyle: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginRight: 10,
    marginLeft: 10,
    borderRadius: roundedEdge,
    height: 155,
    backgroundColor: 'white'
  },
  iconSectionStyle: {
    flex: 1.1,
    borderTopLeftRadius: roundedEdge,
    borderBottomLeftRadius: roundedEdge,
    backgroundColor: 'white'
  },
  iconStyle: {
    height: 50,
    width: 50
  },
  infoSectionStyle: {
    flex: 3.5,
    backgroundColor: 'white'
  },
  money: {
    //paddingTop: 3,
    fontSize: 30,
    fontFamily: 'Avenir',
    color: 'black'
  },
  paySectionStyle: {
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1.6,
    borderTopRightRadius: roundedEdge,
    borderBottomRightRadius: roundedEdge,
    backgroundColor: 'white'
  }
};