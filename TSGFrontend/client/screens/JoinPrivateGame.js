import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Container } from 'native-base';
import { SimpleLineIcons } from '@expo/vector-icons';
import firestore from '../firestore.js';


export default class JoinPrivateGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accountBalance: "",
            historicalSavings: "",
            monthlySavings: "",
            moneyInPlay: "",
            user: this.props.navigation.state.params.user
        }
    }

    componentDidMount() {
        var that = this;
        console.log(that.state.user);
        firestore.collection("Users").doc(that.state.user)
            .onSnapshot(function (doc) {
                aB = doc.data()['accountBalance']
                hS = doc.data()['historicalSavings']
                mS = doc.data()['monthlySavings']
                mIP = doc.data()['moneyInPlay']
                that.setState({
                    accountBalance: aB,
                    historicalSavings: hS,
                    monthlySavings: mS,
                    moneyInPlay: mIP
                })
            })
    }

    render() {
        return (
            <Container style={styles.outContainer}>
                <View style={styles.sectionHeadingStyle}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                        <SimpleLineIcons name='close' color='#3cb371' size={20} />
                    </TouchableOpacity>
                    <Text style={styles.nav}>Join a Game</Text>
                </View>
                <TouchableOpacity onPress={this.props.navigation.navigate('JoinPublicGame1')} style={styles.options}>
                    <SimpleLineIcons name='globe' color='#3cb371' size={28} />
                    <Text style={styles.navItemStyle}>Join a public game</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.props.navigation.navigate('JoinPrivateGame1')} style={styles.options}>
                    <SimpleLineIcons name='people' color='#3cb371' size={28} />
                    <Text style={styles.navItemStyle}>Create a game with fiends</Text>
                </TouchableOpacity>
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
        paddingLeft: 15,
        paddingBottom: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.26
    },
    options: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.26
    },
    navItemStyle: {
        paddingLeft: 20
    },
    nav: {
        paddingLeft: 103,
        fontSize: 18
    }
});