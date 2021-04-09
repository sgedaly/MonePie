import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import firestore from '../firestore.js';
import Emoji from 'react-native-emoji';
import 'firebase/firestore';


const roundedEdge = 8;

export default class Transaction extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            page: '1',
            //user: this.props.navigation.state.params.user,
            user: 'sam_lhbmrxg_test@tfbnw.net',
            pastGames: [],
            emoji: ''

        }
    }
    componentDidMount() {
        this._isMounted = true;
        var that = this;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        var amountColor = 'black';
        var txtAmount = this.props.amount.toFixed(2);
        if (this.props.type == 'Game Payment') {
            amountColor = '#3cb371';
            txtAmount = "+" + this.props.amount.toFixed(2);
        } else if (this.props.type == 'Transfer to Bank') {
            amountColor = 'red';
            txtAmount = "-" + this.props.amount.toFixed(2);
        }
        return (
            <View style={styles.options}>
                <View style={styles.infoSectionStyle}>
                    <Text style={{ color: 'black', fontFamily: 'Avenir', fontSize: 14 }}>{this.props.type}</Text>
                    <Text style={{ color: 'grey', fontFamily: 'Avenir', fontSize: 10 }}>{this.props.date}</Text>
                    <Text style={{ color: 'grey', fontFamily: 'Avenir', fontSize: 10 }}>{this.props.bankAccount}</Text>
                </View>
                <View style={styles.infoSectionStyle2}></View>
                <View style={styles.infoSectionStyle2}>
                    <Text style={{ color: amountColor, fontFamily: 'Avenir', fontSize: 14 }}>{txtAmount}</Text>
                </View>
            </View>

        )
    }
}

const styles = {
    titleItem: {
        paddingTop: 45,
        paddingLeft: 15,
        fontSize: 12,
        color: 'grey'
    },
    options: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 8,
        marginHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.26,
        height: 70,
    },
    infoSectionStyle: {
        flexDirection: 'column',
        paddingLeft: 20,
        flex: 2
    },
    infoSectionStyle2: {
        flexDirection: 'column',
        paddingLeft: 20,
        flex: 1
    },
    iconSectionStyle: {
        paddingLeft: 20
    },
};