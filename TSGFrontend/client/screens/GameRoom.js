import React from 'react';
import { Util } from 'expo';

import Loader from 'react-native-mask-loader';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Animated,
    Easing,
    Platform
} from 'react-native';
import { Accordion } from 'native-base';
import { SimpleLineIcons, Feather, MaterialIcons } from '@expo/vector-icons';
import firestore from '../firestore.js';
import LottieView from 'lottie-react-native';
import PaymentButton from '../components/PaymentButton';
import firebase from '@firebase/app';
import Expo from 'expo';

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
            dataArray: [
                { title: "Game Info", content: "" }
            ]
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
                active = doc.data()['activeUsers'].length;
                inactive = doc.data()['inactiveUsers'].length;
                console.log(totalPot)
                currentDate = new Date();
                difference = endDate - currentDate;
                fromStart = currentDate - startDate;
                daysLeft = Math.floor(difference / 1000 / 60 / 60 / 24);
                fromStart = Math.floor(fromStart / 1000 / 60 / 60 / 24);
                hourDifference = (24 - currentDate.getHours()) + ((doc.data()['paymentPeriodWindow'] - (fromStart % doc.data()['paymentPeriodWindow']) - 1) * 24);
                currentAmountSaved = (Math.floor(fromStart / doc.data()['paymentPeriodWindow'])) * contribution;//Hay que chequear la list de los que ya pagaron el dia para ver si el user pago para poner el monto
                //exacto que pago.
                playersThatPaid = doc.data()['dailyUserPaymentCheck'];
                if (playersThatPaid.includes(that.props.navigation.state.params.user)) {
                    currentAmountSaved = currentAmountSaved + contribution
                    that.setState({
                        addButtonEnable: false
                    });
                }
                won = false
                currentAmountSaved = currentAmountSaved.toFixed(2);
                emoji = doc.data()['emoji'];
                pctg = Math.floor((currentAmountSaved / amountToSave) * 100)
                if (pctg == 0) {
                    pctg = 7.5
                } else if (pctg == 100) {
                    won = true
                }
                if (doc.data()['paymentPeriodWindow'] > 1) {
                    txt = <Text><Text>{'Add '}</Text><Text style={{ color: '#3cb371', fontWeight: 'bold' }}>{'$' + contribution}</Text><Text>{' every ' + doc.data()['paymentPeriodWindow'] + ' days'}</Text></Text>
                } else {
                    txt = <Text><Text>{'Add '}</Text><Text style={{ color: '#3cb371', fontWeight: 'bold' }}>{'$' + contribution}</Text><Text>{' every day'}</Text></Text>
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
                    hourDifference: hourDifference,
                    loading: true,
                    pctg: pctg,
                    won: won,
                    totalPot: totalPot,
                    active: active,
                    inactive: inactive,
                    dataArray: [{
                        title: <Text style={{ color: 'white' }}>{"Game Info "}</Text>, content: <Text><Text>{"• Goal: Save "}</Text><Text style={{ color: '#3cb371', fontWeight: 'bold' }}>{"$" + amountToSave}</Text><Text>{" + extra pot rewards"}</Text><Text>{`\n`}</Text>
                            <Text>{"• Rule: "}</Text><Text>{txt}</Text><Text>{`\n`}</Text><Text>{'• Risk: '}</Text><Text style={{ color: '#3cb371', fontWeight: 'bold' }}>{risk * 100 + '%'}</Text><Text>{`\n`}</Text><Text>{'• Time remaining: '}</Text><Text style={{ color: '#3cb371', fontWeight: 'bold' }}>{daysLeft}</Text><Text>{' days'}</Text></Text>
                    }]
                })
            })
    }

    pay() {
        var that = this
        //The following is the behavior once the user successfully paid from either his "accountBalance" or directly from plaid
        firestore.collection('Games').doc(that.props.navigation.state.params.game).update({
            totalPot: that.state.totalPot + that.state.dailyContribution,
            dailyUserPaymentCheck: firebase.firestore.FieldValue.arrayUnion(that.props.navigation.state.params.user)
        });
        //update moneyInPlay
        firestore.collection("Users").doc(that.props.navigation.state.params.user).get().then(function (doc) {
            moneyInPlay = doc.data()['moneyInPlay'] + that.state.dailyContribution;
            moneyInGame = doc.data()['activeGames'][that.props.navigation.state.params.game] + that.state.dailyContribution;
            console.log(moneyInGame);
            ref = firestore.collection('Users').doc(that.props.navigation.state.params.user);
            ref.update({
                moneyInPlay: moneyInPlay
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
        if (Platform.OS === 'android') {
            return (
                <View key={this.state.rootKey} style={styles.root}>
                    <View style={styles.sectionHeadingStyle}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen', { user: this.state.user })}>
                            <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} />
                        </TouchableOpacity>
                        <Feather style={styles.icon1} name='user-check' color='#3cb371' size={20} />
                        <Text style={styles.txt1}>{this.state.active} 30</Text>
                        <Feather style={styles.icon} name='user-x' color='red' size={20} />
                        <Text style={styles.txt2}>{this.state.inactive}</Text>
                    </View>
                    <View style={styles.container}>
                        <View style={styles.anim}>
                            <Text style={styles.money}>Game Pot: ${this.state.totalPot}</Text>
                            <LottieView source={require('../assets/animation.json')} progress={this.state.progress} />

                        </View>
                        <View style={styles.payBut}>
                            <PaymentButton
                                payAmount={this.state.dailyContribution}
                                onPress={() => this.pay()}
                                enabled={this.state.addButtonEnable}
                                hourDifference={this.state.hourDifference}
                                won={this.state.won}
                            />
                        </View>
                        <View style={styles.imgView} >
                            <Accordion dataArray={this.state.dataArray} expanded={0} icon="arrow-down" expandedIcon="arrow-up" expandedIconStyle={{ color: "white" }} iconStyle={{ color: "white" }} style={styles.dropdownA} contentStyle={{
                                borderStyle: 'solid',
                                borderWidth: 2,
                                borderColor: '#3cb371', borderRadius: roundedEdge
                            }} headerStyle={{ justifyContent: 'center', alignItems: 'center', backgroundColor: "#3cb371", borderTopLeftRadius: roundedEdge, borderTopRightRadius: roundedEdge, borderBottomLeftRadius: roundedEdge, borderBottomRightRadius: roundedEdge }} />
                        </View>
                        <TouchableOpacity style={styles.chatA}>
                            <MaterialIcons name='chat' color='#3cb371' size={30} />
                        </TouchableOpacity>
                    </View>
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
                            <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} />
                        </TouchableOpacity>
                        <Feather style={styles.icon1} name='user-check' color='#3cb371' size={20} />
                        <Text style={styles.txt1}>{this.state.active}</Text>
                        <Feather style={styles.icon} name='user-x' color='red' size={20} />
                        <Text style={styles.txt2}>{this.state.inactive}</Text>
                    </View>
                    <View style={styles.container}>
                        <View style={styles.anim}>
                            <Text style={styles.money}>Game Pot: ${this.state.totalPot}</Text>

                            <LottieView source={require('../assets/animation.json')} progress={this.state.progress} />

                        </View>
                        <View style={styles.payBut}>
                            <PaymentButton
                                payAmount={this.state.dailyContribution}
                                onPress={() => this.pay()}
                                enabled={this.state.addButtonEnable}
                                hourDifference={this.state.hourDifference}
                                won={this.state.won}
                            />
                        </View>
                        <View style={styles.imgView} >
                            <Accordion dataArray={this.state.dataArray} expanded={0} icon="arrow-down" expandedIcon="arrow-up" expandedIconStyle={{ color: "white" }} iconStyle={{ color: "white" }} style={styles.dropdown} contentStyle={{
                                borderStyle: 'solid',
                                borderWidth: 2,
                                borderColor: '#3cb371', borderRadius: roundedEdge
                            }} headerStyle={{ justifyContent: 'center', alignItems: 'center', backgroundColor: "#3cb371", borderTopLeftRadius: roundedEdge, borderTopRightRadius: roundedEdge, borderBottomLeftRadius: roundedEdge, borderBottomRightRadius: roundedEdge }} />
                        </View>
                        <TouchableOpacity style={styles.chat}>
                            <MaterialIcons name='chat' color='#3cb371' size={30} />
                        </TouchableOpacity>
                    </View>
                </Loader>
            </View>
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
    },
    txt2: {
        color: 'red',
        fontSize: 20,
    },
    payBut: {
        flex: 0.3,
        //alignItems: 'center',
        paddingLeft: 100,
        paddingRight: 100
    },
    anim: {
        flex: 1.3,
        alignItems: 'center',
        // paddingLeft: 100,
        // paddingRight: 100
    },
    money: {
        //flex: 1,
        paddingTop: 30,
        fontSize: 30,
        color: '#3cb371',
        flexDirection: 'row',
        paddingBottom: 30
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
        paddingTop: 65,
        paddingLeft: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
    },
    navItemStyle: {
        paddingLeft: 128,
        fontSize: 18
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        //alignItems: 'center'
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
    }
});