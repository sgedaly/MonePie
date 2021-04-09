import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import { Container } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import firestore from '../firestore.js';
import Transaction from '../components/Transaction';
import { Header } from 'react-native-elements';
import PastGames from '../components/PastGames.js';
import Swiper from 'react-native-swiper';


const roundedEdge = 8;
//import {createDrawerNavigator} from 'react-navigation';


export default class TransactionHistory extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isReady: false,
            isLoading: true,
            user: this.props.navigation.state.params.user,
            transactionsList: <View></View>,
            index: 0,
            tColor: 'black',
            pgColor: 'grey',
            tWidth: 3,
            pgWidth: 0,
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
        firestore.collection("Users").doc(that.state.user)
            .onSnapshot(function (doc) {
                transactions = doc.data()["transactions"]
                transactionsList = transactions.map((t) =>
                    <View>
                        <Transaction key={t.amount} type={t.type} date={t.date} amount={t.amount} bankAccount={t.bankAccount} />
                    </View>
                )
                transactionsList = transactionsList.reverse()
                pG = doc.data()['pastGames'];
                pastGamesList = pG.map((g) =>
                    <View>
                        <PastGames key={g.id} game={g["id"]} saved={g["saved"]} user={that.state.user} date={g["endDate"]} />
                    </View>
                )
                pastGamesList = pastGamesList.reverse()
                if (transactions.length == 0) {
                    transactionsList =
                        <View style={{ paddingVertical: 100 }}>
                            <Text style={{ fontSize: 25, color: 'grey', fontFamily: 'Avenir', marginHorizontal: 20, textAlign: 'center' }}>You can find all your transactions here.</Text>
                        </View>
                }
                if (pG.length == 0) {
                    pastGamesList =
                        <View style={{ paddingVertical: 100 }}>
                            <Text style={{ fontSize: 25, color: 'grey', fontFamily: 'Avenir', marginHorizontal: 20, textAlign: 'center' }}>You can find all your past games here.</Text>
                        </View>
                }
                if (that._isMounted) {
                    that.setState({
                        transactionsList: transactionsList,
                        pastGamesList: pastGamesList
                    })
                }
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    switch(idx) {
        if (idx == 0) {
            this.setState({ tColor: 'black', pgColor: 'grey', tWidth: 3, pgWidth: 0 });
        } else if (idx == 1) {
            this.setState({ tColor: 'grey', pgColor: 'black', pgWidth: 3, tWidth: 0 });
        }
    }


    render(props) {
        if (!this.state.isReady) {
            return <Expo.AppLoading />;
        }
        return (
            <Container style={styles.outContainer}>
                <Header
                    leftComponent={<TouchableOpacity style={styles.icons}>
                        <Ionicons name='md-menu' color='white' size={30} onPress={() => this.props.navigation.toggleDrawer()} />
                    </TouchableOpacity>}
                    centerComponent={<Text style={styles.navItemStyle}>History</Text>}
                    outerContainerStyles={{ backgroundColor: '#3cb371', height: 88, marginBottom: 5 }}
                />
                <View style={{ marginHorizontal: 20, marginBottom: 10, height: 40, flexDirection: 'row', borderBottomColor: '#D3D3D3', borderBottomWidth: 0.26 }}>
                    <View style={{ flex: 1, alignItems: 'center', borderBottomColor: 'black', borderBottomWidth: this.state.tWidth }} onPress={() => this.switch(0)}>
                        <Text style={{ fontSize: 18, color: this.state.tColor, fontFamily: 'Avenir', fontWeight: 'bold' }}>
                            Transactions
                        </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', borderBottomColor: 'black', borderBottomWidth: this.state.pgWidth }} onPress={() => this.switch(1)}>
                        <Text style={{ fontSize: 18, color: this.state.pgColor, fontFamily: 'Avenir', fontWeight: 'bold' }}>
                            Past Games
                        </Text>
                    </View>
                </View>
                <Swiper
                    loop={false}
                    showsPagination={true}
                    index={this.state.index}
                    activeDotColor={'#3cb371'}
                    dot={<View style={{ backgroundColor: '#e5e5e5', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
                    onIndexChanged={(idx) => this.switch(idx)}
                >
                    <ScrollView style={{}}>
                        {this.state.transactionsList}
                    </ScrollView>
                    <ScrollView style={{}}>
                        {this.state.pastGamesList}
                    </ScrollView>
                </Swiper>
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
        //paddingLeft: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    navItemStyle: {
        // paddingLeft: 125,
        // paddingRight: 125,
        fontSize: 18,
        fontFamily: 'Avenir',
        color: 'white'
    },
    title: {
        fontSize: 18,
    },
    container: {
        flex: 1,
    },
    top: {
        height: '40%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    icon: {
        flex: 1,
        paddingLeft: 15,
        alignItems: 'flex-start'
    },
    icon2: {
        flex: 1,
        paddingRight: 15,
        alignItems: 'flex-end'
    },
    profimage: {
        width: 480,
        height: 480,
        borderRadius: 400,
        borderWidth: 4,
        borderColor: '#3cb371',
        backgroundColor: 'white',
    },
    center: {
        height: '1%',
        backgroundColor: '#3cb371',
    },
    paySectionStyle: {
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 2.5,
        borderTopRightRadius: roundedEdge,
        borderBottomRightRadius: roundedEdge,
    },
    buttonStyle: {
        alignSelf: 'stretch',

        flexDirection: 'column',
        justifyContent: 'center',

        alignItems: 'center',

        borderColor: '#3cb371',
        borderWidth: 2
    },
    titleItem: {
        paddingTop: 45,
        paddingLeft: 15,
        fontSize: 12,
        color: 'grey'
    },
    money: {
        paddingTop: 3,
        paddingLeft: 15,
        fontSize: 30
    },
    errorStyle: {
        fontSize: 18,
        color: 'white',
        marginLeft: 100
    },
    optionys: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.26
    },
    avatar: {
    }
});