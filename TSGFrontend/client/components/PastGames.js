import React from 'react';
import { View, Text } from 'react-native';
import firestore from '../firestore.js';
import Emoji from 'react-native-emoji';
import 'firebase/firestore';


const roundedEdge = 8;

export default class Transactions extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            page: '1',
            //user: this.props.navigation.state.params.user,
            user: 'sam_lhbmrxg_test@tfbnw.net',
            emoji: '',
        }
    }
    componentDidMount() {
        this._isMounted = true;
        var that = this;
        console.log("past games");
        firestore.collection("Games").doc(that.props.game)
            .onSnapshot(function (doc) {
                emoji = doc.data()['emoji'];
                console.log(emoji);
                if (that._isMounted) {
                    that.setState({
                        emoji: emoji
                    })
                }
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        var diff = new Date().getTime() / 1000 - this.props.date.seconds;
        fromEnd = Math.floor(diff / 60 / 60 / 24);
        var txt = fromEnd + " days ago"
        if (fromEnd == 1) {
            txt = fromEnd + " day ago"
        } else if (fromEnd == 0) {
            fromEnd = Math.floor(diff / 60 / 60);
            txt = fromEnd + " hours ago"
            if (fromEnd == 1) {
                txt = fromEnd + " hour ago"
            } else if (fromEnd == 0) {
                fromEnd = Math.floor(diff / 60);
                if (fromEnd == 0) {
                    fromEnd = 1;
                }
                txt = fromEnd + " min ago"
            }
        }
        return (
            <View style={styles.options}>
                <View style={styles.iconSectionStyle}>
                    <Emoji name={this.state.emoji} style={{ fontSize: 40 }} />
                </View>
                <View style={styles.infoSectionStyle}>
                    <Text>{txt}</Text>
                    <Text>Saved: ${this.props.saved}</Text>
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
    cardStyle: {
        flexDirection: 'row',
        marginRight: 10,
        marginLeft: 10,
        height: 60,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.26
    },
    infoSectionStyle: {
        flexDirection: 'column',
        paddingLeft: 20
    },
    iconSectionStyle: {
        paddingLeft: 20
    },
};