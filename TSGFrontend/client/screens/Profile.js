import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import { Avatar } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import { Container } from 'native-base';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import firestore from '../firestore.js';
import PastGames from '../components/PastGames.js';

const roundedEdge = 8;
//import {createDrawerNavigator} from 'react-navigation';


export default class Profile extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isReady: false,
            isLoading: true,
            page: '1',
            user: this.props.navigation.state.params.user,
            email: "",
            firstName: "",
            lastName: "",
            picture: 'https://i.stack.imgur.com/l60Hf.png',
            pastGames: [],
            pastGamesList: <Text>Hello</Text>
        }
    }

    navigateToScreen = (route) => () => {
        const navigateAction = NavigationActions.navigate({
            routeName: route
        });
        this.props.navigation.dispatch(navigateAction);
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
                mail = doc.data()['email'];
                fN = doc.data()['firstName'];
                lN = doc.data()['lastName'];
                aGA = doc.data()['avgGameAmount'];
                aPC = doc.data()['avgPeriodicalContribution'];
                hS = doc.data()['historicalSavings'];
                mIP = doc.data()['moneyInPlay'];
                mS = doc.data()['monthlySavings'];
                photoURL = doc.data()['photoURL'];
                pG = doc.data()['pastGames'];
                console.log(pG)
                pastGamesList = pG.map((g) =>
                    <View>
                        <PastGames key={g.id} game={g["id"]} saved={g["saved"]} user={that.state.user} date={g["endDate"]} />
                    </View>
                )
                if (that._isMounted) {
                    that.setState({
                        email: mail,
                        firstName: fN,
                        lastName: lN,
                        avgGameAmount: aGA,
                        avgPeriodicalContribution: aPC,
                        historicalSavings: hS,
                        moneyInPlay: mIP,
                        pastGames: pG,
                        pastGamesList: pastGamesList.reverse()
                    })
                }
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }


    render(props) {
        if (!this.state.isReady) {
            return <Expo.AppLoading />;
        }
        return (
            <Container style={styles.outContainer}>
                <View style={styles.sectionHeadingStyle}>
                    <TouchableOpacity style={styles.icon}>
                        <Ionicons name='md-menu' color='#3cb371' size={30} onPress={() => this.props.navigation.toggleDrawer()} />
                    </TouchableOpacity>
                    <View style={styles.navItemStyle}>
                        <Text style={styles.title}>Profile</Text>
                    </View>
                    <TouchableOpacity style={styles.icon2} onPress={() => this.props.navigation.navigate('EditProfile', { user: this.state.user })}>
                        <SimpleLineIcons name='pencil' color='#3cb371' size={20} />
                    </TouchableOpacity>
                </View>
                <View style={styles.container}>
                    <View style={styles.top}>

                        <View style={styles.avatar}>
                            <Avatar
                                large
                                rounded
                                source={{ uri: this.state.picture }}
                                activeOpacity={0.7}
                            />
                        </View>
                        {/* <Text>{this.state.firstName}</Text>
                        <Text>{this.state.lastName}</Text> */}
                        <Text>{this.state.email}</Text>

                    </View>
                    <View style={styles.center}></View>
                    <Text style={styles.titleItem}>Past Games</Text>
                    <ScrollView>
                        {this.state.pastGamesList}
                    </ScrollView>
                </View>
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
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Avenir'
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