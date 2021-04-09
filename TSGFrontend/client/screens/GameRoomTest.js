import React from 'react';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Loader from 'react-native-mask-loader';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Animated,
    Easing,
    Platform,
} from 'react-native';
import util from 'util';
import { Spinner } from 'native-base';
import { SimpleLineIcons, Feather } from '@expo/vector-icons';
import firestore from '../firestore.js';
import PaymentButton from '../components/PaymentButton';
import firebase from '@firebase/app';
import { LinearGradient, AppLoading } from 'expo';
import { ScrollView } from 'react-native-gesture-handler';
import Dialog, { DialogContent, SlideAnimation } from 'react-native-popup-dialog';
import { Button } from 'react-native-elements';

const roundedEdge = 8;

type State = {|
    appReady: boolean,
        rootKey: number,
|};

export default class App extends React.Component<{}, State> {
    state = {
        appReady: false,
        rootKey: Math.random(),
    };

    constructor(props) {
        super(props);
        this._image = require('../assets/Logo_.png');
        this.state = {
            isReady: false,
            isLoading: true,
            page: '1',
            //user: this.props.navigation.state.params.user,
            user: this.props.navigation.state.params.user,
            endDate: '',
            amountToSave: '',
            gameName: '',
            dailyContribution: 0,
            risk: 0,
            emoji: '',
            addButtonEnable: true,
            totalPot: 0,
            collapsed: true,
            won: false,
            totalPot: 0,
            progress: new Animated.Value(0),
            active: 0,
            inactive: 0,
            loading: false,
            dataArray: [
                { title: "Game Info", content: "" }
            ],
            icon: 'home',
            paymentStatus: 'nothing'
        }
    }

    async componentWillMount() {
        await Expo.Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        });
        this.setState({ isReady: true })
    }

    componentDidMount() {
        this.resetAnimation();
        Animated.loop(Animated.timing(this.state.progress, {
            toValue: 1,
            duration: 5000,
            easing: Easing.linear,
        })).start()
        console.log(this.props.navigation.state.params.game)
        var that = this;
        firestore.collection('Games').doc(that.props.navigation.state.params.game)
            .onSnapshot(function (doc) {
                endDate = doc.data()['endingDate'].toDate();
                startDate = doc.data()['startingDate'].toDate();
                endDate.setHours(endDate.getHours());
                startDate.setHours(startDate.getHours());
                amountToSave = doc.data()['amountToSave'].toFixed(2);
                gameName = doc.data()['gameName'];
                contribution = doc.data()['periodicalContribution'];
                risk = doc.data()['risk'];
                totalPot = doc.data()['totalPot'];
                rewardPot = doc.data()['rewardPot'];
                activeUsers = doc.data()['activeUsers'];
                active = activeUsers.length;
                inactive = doc.data()['inactiveUsers'].length;
                wd = doc.data()['wdUsers'].length;
                console.log(totalPot)
                currentDate = new Date();
                difference = endDate - currentDate;
                fromStart = currentDate - startDate;
                daysLeft = Math.floor(difference / 1000 / 60 / 60 / 24);
                fromStart = Math.floor(fromStart / 1000 / 60 / 60 / 24);
                hourDifference = (24 - currentDate.getHours()) + ((doc.data()['paymentPeriodWindow'] - (fromStart % doc.data()['paymentPeriodWindow']) - 1) * 24);
                //currentAmountSaved = (Math.floor(fromStart / doc.data()['paymentPeriodWindow'])) * contribution;//Hay que chequear la list de los que ya pagaron el dia para ver si el user pago para poner el monto
                currentAmountSaved = that.props.navigation.state.params.moneyInGame
                currentAmountSaved = currentAmountSaved.toFixed(2);
                //exacto que pago.
                playersThatPaid = doc.data()['dailyUserPaymentCheck'];
                notPaidList = activeUsers.filter(x => !playersThatPaid.includes(x));
                if (playersThatPaid.includes(that.props.navigation.state.params.user)) {
                    //currentAmountSaved = currentAmountSaved + contribution
                    that.setState({
                        addButtonEnable: false
                    });
                }
                won = false
                emoji = doc.data()['emoji'];
                pctg = Math.floor((currentAmountSaved / amountToSave) * 100)
                if (pctg == 100) {
                    won = true
                }
                var withdrawComp = <TouchableOpacity style={{ flex: 0.6, paddingBottom: 20 }} onPress={() => that.props.navigation.navigate('WithdrawFromGame', { user: that.state.user, game: that.props.navigation.state.params.game, amountToWithdraw: currentAmountSaved, currentPot: totalPot })}>
                    <Text style={styles.greenText}>WITHDRAW FROM GAME</Text>
                </TouchableOpacity>
                if (won) {
                    withdrawComp = <View></View>
                }
                console.log(totalPot)
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
                    rewardPot: rewardPot,
                    hourDifference: hourDifference,
                    pctg: pctg,
                    won: won,
                    totalPot: totalPot,
                    active: active,
                    paid: playersThatPaid.length,
                    activeUsers: activeUsers,
                    inactive: inactive,
                    wd: wd,
                    ppw: doc.data()['paymentPeriodWindow'],
                    notPaid: notPaidList.length,
                    withdrawComp: withdrawComp
                })
            })
    }

    prettyPrintResponse = response => {
        console.log(util.inspect(response, { colors: true, depth: 4 }));
    };

    pay2() {
        var that = this
        this.setState({ loading: true });
        //The following is the behavior once the user successfully paid from either his "accountBalance" or directly from plaid
        firestore.collection('Games').doc(that.props.navigation.state.params.game).update({
            totalPot: that.state.totalPot + that.state.dailyContribution,
            dailyUserPaymentCheck: firebase.firestore.FieldValue.arrayUnion(that.props.navigation.state.params.user)
        });
        //update moneyInPlay
        firestore.collection("Users").doc(that.props.navigation.state.params.user).get().then(function (doc) {
            moneyInPlay = doc.data()['moneyInPlay'] + that.state.dailyContribution;
            moneyInGame = doc.data()['activeGames'][that.props.navigation.state.params.game] + that.state.dailyContribution;
            bankAccount = doc.data()['bankAccount'].name + " ••••" + doc.data()['bankAccount'].last4;
            now = new Date();
            console.log(moneyInGame);
            ref = firestore.collection('Users').doc(that.props.navigation.state.params.user);
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
            update['activeGames.' + that.props.navigation.state.params.game] = moneyInGame
            ref.update(update)
            pctg = Math.floor((moneyInGame / that.state.amountToSave) * 100)
            that.setState({
                currentAmountSaved: moneyInGame.toFixed(2),
                pctg: pctg
            });
        });
    }

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
                    user: this.props.navigation.state.params.user,
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
                        var that = this
                        this.setState({ loading: true });
                        //The following is the behavior once the user successfully paid from either his "accountBalance" or directly from plaid
                        firestore.collection('Games').doc(that.props.navigation.state.params.game).update({
                            totalPot: that.state.totalPot + that.state.dailyContribution,
                            dailyUserPaymentCheck: firebase.firestore.FieldValue.arrayUnion(that.props.navigation.state.params.user)
                        });
                        //update moneyInPlay
                        firestore.collection("Users").doc(that.props.navigation.state.params.user).get().then(function (doc) {
                            moneyInPlay = doc.data()['moneyInPlay'] + that.state.dailyContribution;
                            moneyInGame = doc.data()['activeGames'][that.props.navigation.state.params.game] + that.state.dailyContribution;
                            bankAccount = doc.data()['bankAccount'].name + " ••••" + doc.data()['bankAccount'].last4;
                            now = new Date();
                            console.log(moneyInGame);
                            ref = firestore.collection('Users').doc(that.props.navigation.state.params.user);
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
                            update['activeGames.' + that.props.navigation.state.params.game] = moneyInGame
                            ref.update(update)
                            pctg = Math.floor((moneyInGame / that.state.amountToSave) * 100)
                            if (pctg == 100) {
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
            console.error(error);
        }
    }

    resetAnimation() {
        this.setState({
            appReady: false,
            rootKey: Math.random()
        });

        setTimeout(() => {
            this.setState({
                appReady: true,
            });
        }, 100);
    }

    render() {
        if (!this.state.isReady) {
            return <Expo.AppLoading />;
        }
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
        if (Platform.OS === 'android') {
            return (
                <View key={this.state.rootKey} style={styles.root}>
                    <View style={styles.sectionHeadingStyle}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen', { user: this.state.user })}>
                            <SimpleLineIcons name={this.props.navigation.state.params.icon} color='#3cb371' size={20} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.money}>Game Pot: ${this.state.totalPot}</Text>
                    <View style={styles.boxList}>
                        <LinearGradient
                            // colors={['#4c669f', '#3b5998', '#192f6a']}
                            colors={['#1e5938', '#1e5938']}
                            start={[0, 0]}
                            end={[1, 1]}
                            location={[0.25, 0.4, 1]}
                            style={{ flex: 1, marginLeft: 5, marginRight: 5, padding: 15, alignItems: 'center', borderRadius: 5 }}>
                            <Text style={{
                                backgroundColor: 'transparent',
                                fontSize: 13,
                                color: '#fff',
                                fontFamily: 'Avenir'
                            }}>Goal</Text>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>${this.state.amountToSave}</Text>
                        </LinearGradient>
                        <LinearGradient
                            //colors={['#93C6F9', '#97B4FA', '#A768FE']}
                            colors={['#2a7d4f', '#2a7d4f']}
                            start={[0, 0]}
                            end={[1, 1]}
                            location={[0.25, 0.4, 1]}
                            style={{ flex: 1, marginRight: 5, padding: 15, alignItems: 'center', borderRadius: 5 }}>
                            <Text style={{ color: 'white', fontSize: 13 }}>Rule</Text>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>${this.state.dailyContribution}/{this.state.ppw}d</Text>
                        </LinearGradient>
                        <LinearGradient
                            //colors={['#dfa579', '#c79081']}
                            colors={['#36a165', '#36a165']}
                            start={[0, 0]}
                            end={[1, 1]}
                            location={[0.25, 0.4, 1]}
                            style={{ flex: 1, marginRight: 5, padding: 15, alignItems: 'center', borderRadius: 5 }}>
                            <Text style={{ color: 'white', fontSize: 13 }}>Penalty</Text>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{this.state.risk}%</Text>
                        </LinearGradient>
                        <LinearGradient
                            colors={['#4fba7f', '#4fba7f']}
                            start={[0, 0]}
                            end={[1, 1]}
                            location={[0.25, 0.4, 1]}
                            style={{ flex: 1, marginRight: 5, padding: 15, alignItems: 'center', borderRadius: 5 }}>
                            <Text style={{ color: 'white', fontSize: 13 }}>Time Left</Text>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{this.state.daysLeft}d</Text>
                        </LinearGradient>
                    </View>
                    <ScrollView>
                        <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 5 }}>
                            <Text style={{ fontSize: 15, fontWeight: 'bold' }}>Savers</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'center', paddingVertical: 30 }}>
                            <View style={{ alignItems: 'center', flexDirection: 'column', paddingHorizontal: 10 }}>
                                <Feather style={{ alignSelf: 'center' }} name='user-check' color='#3cb371' size={30} />
                                <Text style={{ alignSelf: 'center', fontSize: 12, color: '#3cb371', paddingBottom: 10, paddingTop: 8 }}>ACTIVE</Text>
                                <Text style={{ alignSelf: 'center', color: '#3cb371', fontSize: 20 }}>{this.state.paid}</Text>
                            </View>
                            <View style={{ alignItems: 'center', flexDirection: 'column', paddingHorizontal: 10 }}>
                                <Feather style={{ alignSelf: 'center' }} name='user-minus' color='#3cb371' size={30} />
                                <Text style={{ alignSelf: 'center', fontSize: 12, color: '#3cb371', paddingBottom: 10, paddingTop: 8 }}>PENDING</Text>
                                <Text style={{ alignSelf: 'center', color: '#3cb371', fontSize: 20 }}>{this.state.notPaid}</Text>
                            </View>
                            <View style={{ alignItems: 'center', flexDirection: 'column', paddingHorizontal: 10 }}>
                                <Feather style={{ alignSelf: 'center' }} name='user-x' color='#3cb371' size={30} />
                                <Text style={{ alignSelf: 'center', fontSize: 12, color: '#3cb371', paddingBottom: 10, paddingTop: 8 }}>INACTIVE</Text>
                                <Text style={{ alignSelf: 'center', color: '#3cb371', fontSize: 20 }}>{this.state.inactive}</Text>
                            </View>
                            <View style={{ alignItems: 'center', flexDirection: 'column', paddingHorizontal: 10 }}>
                                <Feather style={{ alignSelf: 'center' }} name='user' color='#3cb371' size={30} />
                                <Text style={{ alignSelf: 'center', fontSize: 12, color: '#3cb371', paddingBottom: 10, paddingTop: 8 }}>WITHDRAWN </Text>
                                <Text style={{ alignSelf: 'center', color: '#3cb371', fontSize: 20 }}>{this.state.wd}</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'center', marginTop: 0, marginBottom: 5 }}>
                            <Text style={{ fontSize: 15, fontWeight: 'bold' }}>My Savings</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <AnimatedCircularProgress
                                size={145}
                                width={12}
                                fill={this.state.pctg}
                                lineCap={"round"}
                                //tintColor='rgb(134, 65, 244)'
                                tintColor='#3cb371'
                                backgroundColor="#FFF0F8FF"
                                rotation={0}>
                                {
                                    (fill) => (
                                        <Text>
                                            <Text style={{ color: '#3cb371', fontWeight: 'bold', fontSize: 24 }}>${this.state.currentAmountSaved}</Text>
                                        </Text>
                                    )
                                }
                            </AnimatedCircularProgress>
                        </View>
                        <View style={{ alignItems: 'center', marginTop: 5, marginBottom: 5 }}>
                            <Text style={{ fontSize: 15, color: 'black' }}>+</Text>
                        </View>
                        <View style={{ alignItems: 'center', marginBottom: 5 }}>
                            <Text style={{ fontSize: 10, color: 'grey' }}>Current Reward: ${this.state.rewardPot / (this.state.paid + this.state.notPaid)}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: "column", backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={styles.payBut}>
                                <PaymentButton
                                    payAmount={this.state.dailyContribution}
                                    onPress={() => this.pay()}
                                    enabled={this.state.addButtonEnable}
                                    loading={this.state.loading}
                                    hourDifference={this.state.hourDifference}
                                    won={this.state.won}
                                />
                            </View>
                            {this.state.withdrawComp}
                        </View>
                    </ScrollView>
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
        ////////////
        return (
            <View key={this.state.rootKey} style={styles.root}>
                <Loader
                    isLoaded={this.state.appReady}
                    imageSource={this._image}
                    backgroundStyle={styles.loadingBackgroundStyle}
                >
                    <View style={styles.sectionHeadingStyle}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen', { user: this.state.user })}>
                            <SimpleLineIcons name={this.props.navigation.state.params.icon} color='#3cb371' size={20} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.money}>Game Pot: ${this.state.totalPot}</Text>
                    <View style={styles.boxList}>
                        <LinearGradient
                            // colors={['#4c669f', '#3b5998', '#192f6a']}
                            colors={['#1e5938', '#1e5938']}
                            start={[0, 0]}
                            end={[1, 1]}
                            location={[0.25, 0.4, 1]}
                            style={{ flex: 1, marginLeft: 5, marginRight: 5, padding: 15, alignItems: 'center', borderRadius: 5 }}>
                            <Text style={{
                                backgroundColor: 'transparent',
                                fontSize: 13,
                                color: '#fff',
                                fontFamily: 'Avenir'
                            }}>Goal</Text>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold', fontFamily: 'Avenir' }}>${this.state.amountToSave}</Text>
                        </LinearGradient>
                        <LinearGradient
                            //colors={['#93C6F9', '#97B4FA', '#A768FE']}
                            colors={['#2a7d4f', '#2a7d4f']}
                            start={[0, 0]}
                            end={[1, 1]}
                            location={[0.25, 0.4, 1]}
                            style={{ flex: 1, marginRight: 5, padding: 15, alignItems: 'center', borderRadius: 5 }}>
                            <Text style={{ color: 'white', fontSize: 13, fontFamily: 'Avenir' }}>Rule</Text>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold', fontFamily: 'Avenir' }}>${this.state.dailyContribution}/{this.state.ppw}d</Text>
                        </LinearGradient>
                        <LinearGradient
                            //colors={['#dfa579', '#c79081']}
                            colors={['#36a165', '#36a165']}
                            start={[0, 0]}
                            end={[1, 1]}
                            location={[0.25, 0.4, 1]}
                            style={{ flex: 1, marginRight: 5, padding: 15, alignItems: 'center', borderRadius: 5 }}>
                            <Text style={{ color: 'white', fontSize: 13, fontFamily: 'Avenir' }}>Penalty</Text>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold', fontFamily: 'Avenir' }}>{this.state.risk}%</Text>
                        </LinearGradient>
                        <LinearGradient
                            colors={['#4fba7f', '#4fba7f']}
                            start={[0, 0]}
                            end={[1, 1]}
                            location={[0.25, 0.4, 1]}
                            style={{ flex: 1, marginRight: 5, padding: 15, alignItems: 'center', borderRadius: 5 }}>
                            <Text style={{ color: 'white', fontSize: 13, fontFamily: 'Avenir' }}>Time Left</Text>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold', fontFamily: 'Avenir' }}>{this.state.daysLeft}d</Text>
                        </LinearGradient>
                    </View>
                    <ScrollView>
                        <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 5 }}>
                            <Text style={{ fontSize: 15, fontWeight: 'bold', fontFamily: 'Avenir' }}>Savers</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'center', paddingVertical: 30 }}>
                            <View style={{ alignItems: 'center', flexDirection: 'column', paddingHorizontal: 10 }}>
                                <Feather style={{ alignSelf: 'center' }} name='user-check' color='#3cb371' size={30} />
                                <Text style={{ alignSelf: 'center', fontSize: 12, color: '#3cb371', paddingBottom: 10, paddingTop: 8 }}>ACTIVE</Text>
                                <Text style={{ alignSelf: 'center', color: '#3cb371', fontSize: 20 }}>{this.state.paid}</Text>
                            </View>
                            <View style={{ alignItems: 'center', flexDirection: 'column', paddingHorizontal: 10 }}>
                                <Feather style={{ alignSelf: 'center' }} name='user-minus' color='#3cb371' size={30} />
                                <Text style={{ alignSelf: 'center', fontSize: 12, color: '#3cb371', paddingBottom: 10, paddingTop: 8 }}>PENDING</Text>
                                <Text style={{ alignSelf: 'center', color: '#3cb371', fontSize: 20 }}>{this.state.notPaid}</Text>
                            </View>
                            <View style={{ alignItems: 'center', flexDirection: 'column', paddingHorizontal: 10 }}>
                                <Feather style={{ alignSelf: 'center' }} name='user-x' color='#3cb371' size={30} />
                                <Text style={{ alignSelf: 'center', fontSize: 12, color: '#3cb371', paddingBottom: 10, paddingTop: 8 }}>INACTIVE</Text>
                                <Text style={{ alignSelf: 'center', color: '#3cb371', fontSize: 20 }}>{this.state.inactive}</Text>
                            </View>
                            <View style={{ alignItems: 'center', flexDirection: 'column', paddingHorizontal: 10 }}>
                                <Feather style={{ alignSelf: 'center' }} name='user' color='#3cb371' size={30} />
                                <Text style={{ alignSelf: 'center', fontSize: 12, color: '#3cb371', paddingBottom: 10, paddingTop: 8 }}>WITHDRAWN </Text>
                                <Text style={{ alignSelf: 'center', color: '#3cb371', fontSize: 20 }}>{this.state.wd}</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 30 }}>
                            <Text style={{ fontSize: 15, fontWeight: 'bold', fontFamily: 'Avenir' }}>My Savings</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <AnimatedCircularProgress
                                size={160}
                                width={12}
                                fill={this.state.pctg}
                                lineCap={"round"}
                                //tintColor='rgb(134, 65, 244)'
                                tintColor='#3cb371'
                                backgroundColor="#FFF0F8FF"
                                rotation={0}>
                                {
                                    (fill) => (
                                        <Text>
                                            <Text style={{ color: '#3cb371', fontWeight: 'bold', fontSize: 24, fontFamily: 'Avenir' }}>${this.state.currentAmountSaved}</Text>
                                        </Text>
                                    )
                                }
                            </AnimatedCircularProgress>
                        </View>
                        <View style={{ alignItems: 'center', marginTop: 5, marginBottom: 5 }}>
                            <Text style={{ fontSize: 15, color: 'black' }}>+</Text>
                        </View>
                        <View style={{ alignItems: 'center', marginBottom: 5 }}>
                            <Text style={{ fontSize: 10, color: 'grey' }}>Current Rewards: ${this.state.rewardPot / (this.state.paid + this.state.notPaid)}</Text>
                        </View>
                        <View style={styles.container}>
                            <View style={styles.payBut}>
                                <PaymentButton
                                    payAmount={this.state.dailyContribution}
                                    onPress={() => this.pay()}
                                    enabled={this.state.addButtonEnable}
                                    hourDifference={this.state.hourDifference}
                                    loading={this.state.loading}
                                    won={this.state.won}
                                />
                            </View>
                            {this.state.withdrawComp}
                        </View>
                    </ScrollView>
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
                </Loader>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    chatA: {
        flex: 0.15,
        paddingLeft: 15,
    },
    chat: {
        flex: 0.3,
        paddingLeft: 15,
    },
    icon1: {
        paddingRight: 5,
        paddingLeft: 200,
    },
    icon: {
        paddingRight: 5,
    },
    txt1: {
        paddingRight: 5,
        color: '#3cb371',
        fontSize: 20,
        fontFamily: 'Avenir'
    },
    txt2: {
        color: 'red',
        fontSize: 20,
        fontFamily: 'Avenir'
    },
    payBut: {
        flex: 1,
        //alignItems: 'center',
        paddingLeft: 100,
        paddingRight: 100,
        paddingBottom: 15,
        paddingTop: 25,
    },
    anim: {
        flex: 1.3,
        alignItems: 'center',
        // paddingLeft: 100,
        // paddingRight: 100
    },
    money: {
        //flex: 1,
        paddingTop: 10,
        fontSize: 30,
        flexDirection: 'row',
        // paddingBottom: 15,
        paddingLeft: 15,
        fontWeight: 'bold',
        fontFamily: 'Avenir'
    },
    dropdown: {
        maxHeight: 160,
        color: 'white',
        maxWidth: 320,
        paddingTop: 20,
        paddingBottom: 30
    },
    dropdownA: {
        maxHeight: 160,
        color: 'white',
        maxWidth: 320,
        paddingTop: 15,
        paddingBottom: 30
    },
    loadingBackgroundStyle: {
        backgroundColor: '#3cb371'//'rgba(125, 125, 255, 1)',
    },
    outContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionHeadingStyle: {
        paddingTop: 45,
        paddingLeft: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
    },
    boxList: {
        // paddingTop: 15,
        // paddingLeft: 15,
        flexDirection: 'row',
        // alignItems: 'center',
    },
    cardStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: roundedEdge,
        backgroundColor: '#22027b'
    },
    navItemStyle: {
        paddingLeft: 128,
        fontSize: 18,
        fontFamily: 'Avenir'
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imgView: {
        //justifyContent: 'center',
        alignItems: 'center',
        flex: 0.7
        // backgroundColor: 'red',
    },
    tableImg: {
        resizeMode: 'contain',
        width: '70%',
        height: '70%',
        shadowOpacity: 0.6,
        // backgroundColor: 'orange',
    },
    greenText: {
        color: '#3cb371',
        fontSize: 12,
        marginTop: 10,
        fontFamily: 'Avenir'
    }
});