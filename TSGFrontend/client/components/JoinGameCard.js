import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Card, CardItem } from 'native-base';
import JoinButton from './JoinButton';
import firestore from '../firestore.js';
import firebase from '@firebase/app';
import 'firebase/firestore';
import Emoji from 'react-native-emoji';

const roundedEdge = 8;

//props: Game name, amount contributed, bucket amount, risk, end date, icon link
//const GameCard = ({ game }) => {
export default class JoinGameCard extends React.Component {
    //  const { name, contribution, size, risk, end_date, icon } = game;
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            page: '1',
            //user: 'a@b.com',
            //game: props.game,
            endDate: '',
            amountToSave: '',
            gameName: '',
            dailyContribution: 0,
            risk: 0,
            _window: 0,
            emoji: '',
            users: 0,
            diff: 0
        }
    }

    componentDidMount() {
        this._isMounted = true;
        var that = this;
        firestore.collection('Games').doc(this.props.game)
            .onSnapshot(function (doc) {
                endDate = doc.data()['endingDate'].toDate();
                amountToSave = doc.data()['amountToSave'];
                gameName = doc.data()['gameName'];
                contribution = doc.data()['periodicalContribution'];
                risk = doc.data()['risk'];
                startingDate = doc.data()['startingDate'].toDate();
                difference = endDate - startingDate;
                daysLeft = Math.floor(difference / 1000 / 60 / 60 / 24);
                _window = doc.data()['paymentPeriodWindow'];
                active = doc.data()['activeUsers'].length;
                currentAmountSaved = (daysLeft / doc.data()['paymentPeriodWindow']) * contribution;//Hay que chequear la list de los que ya pagaron el dia para ver si el user pago para poner el monto
                //exacto que pago.
                currentAmountSaved = currentAmountSaved.toFixed(2);
                currentDate = new Date();
                fromStart = currentDate - startingDate;
                hourDifference = (24 - currentDate.getHours()) + ((doc.data()['paymentPeriodWindow'] - (fromStart % doc.data()['paymentPeriodWindow']) - 1) * 24);
                emoji = doc.data()['emoji'];
                joinBy = doc.data()['joinBy'];
                var diff = joinBy.seconds - new Date().getTime() / 1000;
                console.log(joinBy);
                if (that._isMounted) {
                    that.setState({
                        endDate: endDate,
                        amountToSave: amountToSave,
                        gameName: gameName,
                        dailyContribution: contribution,
                        currentAmountSaved: currentAmountSaved,
                        risk: risk * 100,
                        daysLeft: daysLeft,
                        _window: _window,
                        emoji: emoji,
                        users: active,
                        hdiff: hourDifference,
                        diff: diff
                    })
                }
                if (_window == 1) {
                    if (that._isMounted) {
                        that.setState({
                            renderText: "Add $" + contribution + " every day"
                        })
                    }
                } else {
                    if (that._isMounted) {
                        that.setState({
                            renderText: "Add $" + contribution + " every " + _window + " days"
                        })
                    }
                }
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    joinGame = () => {
        firestore.collection('Games').doc(this.props.game).update({
            usersInPlay: firebase.firestore.FieldValue.arrayUnion(this.props.user),
            activeUsers: firebase.firestore.FieldValue.arrayUnion(this.props.user)
        });
        ref = firestore.collection('Users').doc(this.props.user);
        var update = {}
        update['activeGames.' + this.props.game] = 0
        ref.update(update)
        //this.props.nav.navigate("HomeScreen");
        this.props.nav.navigate('GameRoomTest', { icon: "home", game: this.props.game, user: this.props.user, moneyInGame: 0.00, canJoin: true })
    }

    render() {
        return (
            <View style={{
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 8,
                marginRight: 10,
                marginLeft: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderBottomColor: '#D3D3D3',
                borderBottomWidth: 0.6,
            }}>
                <CardItem style={styles.iconSectionStyle}>
                    <Emoji name={this.state.emoji} style={{ fontSize: 40 }} />
                </CardItem>

                <CardItem style={styles.infoSectionStyle}>
                    <View style={{ justifyContent: 'flex-start', flexDirection: 'column' }}>
                        <Text style={{
                            paddingTop: 5,
                            paddingBottom: 5,
                            fontSize: 14,
                            fontFamily: 'Avenir',
                            fontWeight: 'bold',
                            color: '#3cb371'
                        }}>{"Save $" + this.state.amountToSave + " in " + this.state.daysLeft + " days "}</Text>
                        <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Avenir' }}>{"" + this.state.risk + "% penalty"}</Text>
                        <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Avenir' }}>{this.state.renderText}</Text>
                        <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Avenir' }}>{"" + this.state.users + " users joined"}</Text>
                    </View>
                </CardItem>

                <CardItem style={styles.paySectionStyle}>
                    <JoinButton
                        payAmount={this.state.dailyContribution}
                        onPress={this.joinGame}
                        diff={this.state.diff}
                        disabled={this.props.disabled}
                    />
                </CardItem>
            </View>
        );
    }
}

const styles = {
    cardStyle: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginRight: 10,
        marginLeft: 10,
        borderRadius: roundedEdge
    },
    iconSectionStyle: {
        flex: 1.2,
        borderTopLeftRadius: roundedEdge,
        borderBottomLeftRadius: roundedEdge
    },
    iconStyle: {
        height: 50,
        width: 50
    },
    infoSectionStyle: {
        flex: 4.0
    },
    paySectionStyle: {
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 2.3,
        borderTopRightRadius: roundedEdge,
        borderBottomRightRadius: roundedEdge
    }
};
