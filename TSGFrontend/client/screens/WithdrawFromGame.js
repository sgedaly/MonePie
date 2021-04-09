import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import { Button } from 'react-native-elements';
import { Container } from 'native-base';
import { SimpleLineIcons } from '@expo/vector-icons';
import firebase from '@firebase/app';
import firestore from '../firestore.js';
import { Header } from 'react-native-elements';


const roundedEdge = 8;
//import {createDrawerNavigator} from 'react-navigation';


export default class WithdrawFromGame extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isReady: false,
            isLoading: true,
            user: this.props.navigation.state.params.user,
            loading: false
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
        this._isMounted = true;
        var that = this;
        console.log(that.state.user);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    withdraw() {
        this.setState({
            loading: true
        });
        var that = this;
        firestore.collection('Users').doc(this.props.navigation.state.params.user).get().then(function (doc) {
            //console.log(doc.data()['activeGames'])
            devolution = parseFloat(that.props.navigation.state.params.amountToWithdraw)
            totalPot = parseFloat(that.props.navigation.state.params.currentPot) - devolution
            accountBalance = doc.data()['accountBalance'] + devolution;
            historicalSavings = doc.data()['historicalSavings'] + devolution;
            moneyInPlay = doc.data()['moneyInPlay'] - devolution;
            monthlySavings = doc.data()['monthlySavings'] + devolution;
            now = new Date();
            ref = firestore.collection('Users').doc(doc.id);
            ref.update({//Send money to winners and update user variables
                //activeGames: admin.firestore.FieldValue.arrayRemove(id),
                pastGames: firebase.firestore.FieldValue.arrayUnion({ id: that.props.navigation.state.params.game, saved: parseFloat(devolution), endDate: new Date() }),
                accountBalance: accountBalance,
                historicalSavings: historicalSavings,
                moneyInPlay: moneyInPlay,
                monthlySavings: monthlySavings,
                transactions: firebase.firestore.FieldValue.arrayUnion({
                    amount: devolution,
                    bankAccount: "MoneyPie Virtual Wallet",
                    date: (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear(),
                    type: 'Game Withdrawal',
                    key: Math.random()
                })
            })
            var update = {}
            update['activeGames.' + that.props.navigation.state.params.game] = firebase.firestore.FieldValue.delete()
            ref.update(update)
        }).then(function () {
            //console.log("Document successfully updated!");
            // firestore.collection('Games').doc(this.props.navigation.state.params.game).get().then(function (doc) {
            //     activeGames = doc.data()['activeUsers']
            // })
            firestore.collection('Games').doc(that.props.navigation.state.params.game).update({
                totalPot: totalPot,
                activeUsers: firebase.firestore.FieldValue.arrayRemove(that.props.navigation.state.params.user),
                dailyUserPaymentCheck: firebase.firestore.FieldValue.arrayRemove(that.props.navigation.state.params.user),
                wdUsers: firebase.firestore.FieldValue.arrayUnion(that.props.navigation.state.params.user)
            }).then(function () {
                console.log("Wd from game");
                that.props.navigation.navigate('Wallet', { user: that.props.navigation.state.params.user })
            })
        })
    }


    render(props) {
        if (!this.state.isReady) {
            return <Expo.AppLoading />;
        }
        return (
            <Container style={styles.outContainer}>
                <Header
                    leftComponent={<TouchableOpacity style={styles.icons}>
                        <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} onPress={() => this.props.navigation.navigate("GameRoomTest")} />
                    </TouchableOpacity>}
                    centerComponent={<Text style={styles.navItemStyle}>Withdraw</Text>}
                    outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
                />
                <Text style={styles.title}>By withdrawing from a game, all the money that you have added to this game(<Text style={{ color: '#3cb371', fontWeight: 'bold' }}>${this.props.navigation.state.params.amountToWithdraw}</Text>) will be transfered to your MoneyPie Wallet and will be reflected under "Acount Balance".</Text>
                <Button
                    title='Withdraw'
                    light
                    style={{ paddingHorizontal: 20 }}
                    buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}
                    backgroundColor='#3cb371'
                    onPress={() => this.withdraw()}
                    loading={this.state.loading}
                />
            </Container>
        );
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
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 15,
        fontFamily: 'Avenir',
        textAlign: "center"
    },
    titleItem: {
        paddingTop: 45,
        paddingLeft: 15,
        fontSize: 12,
        color: 'grey'
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
        fontSize: 30
    },
    helpLinkText: {
        fontSize: 10,
        paddingLeft: 15,
        paddingTop: 10,
        color: '#D3D3D3',
    },
    greenText: {
        color: '#3cb371',
        fontSize: 12,
        paddingTop: 10,
        paddingLeft: 15,
    }
});