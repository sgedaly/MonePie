import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Text,
    AsyncStorage,
    View
} from 'react-native';
import { Container, Spinner, Card, CardItem } from 'native-base';
import { SimpleLineIcons } from '@expo/vector-icons';
import firestore from '../firestore.js';
import JoinGameCard from '../components/JoinGameCard.js';
import { Header } from 'react-native-elements';
import Dialog, { DialogContent, SlideAnimation } from 'react-native-popup-dialog';
import { Button } from 'react-native-elements';


const roundedEdge = 8;


export default class JoinPublicGame extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        // var linkBank = <View></View>
        // if (!this.props.navigation.state.params.canJoin) {
        //     linkBank = <TouchableOpacity style={{ paddingBottom: 10 }} onPress={() => this.props.navigation.navigate('Link', { user: this.state.user })}>
        //         <Card style={{ flexDirection: 'row', alignItems: 'stretch', marginRight: 10, marginLeft: 10, borderRadius: roundedEdge }}>
        //             <CardItem style={{ borderTopLeftRadius: roundedEdge, borderBottomLeftRadius: roundedEdge }}>
        //                 <SimpleLineIcons name='link' color='#3cb371' size={28} />
        //             </CardItem>
        //             <CardItem>
        //                 <Text style={{ fontSize: 16, color: '#3cb371', fontFamily: 'Avenir' }}>Link Bank Before Joining Games</Text>
        //             </CardItem>
        //             <CardItem style={{ borderTopRightRadius: roundedEdge, borderBottomRightRadius: roundedEdge }}>
        //             </CardItem>
        //         </Card>
        //     </TouchableOpacity>
        // }
        this.state = {
            gamesList: [],
            compList: <Spinner></Spinner>,
            visible: false
        }
    }

    _bootstrapAsync = async () => {
        const userToken = await AsyncStorage.getItem('user');
        console.log(userToken)
        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        this.setState({
            user: userToken
        })
    };

    async componentDidMount() {
        this._isMounted = true;
        var that = this;
        compList = <Spinner color='white' />
        this.setState({
            compList: compList,
            visible: !that.props.navigation.state.params.canJoin
        })
        await this._bootstrapAsync()
        try {
            firestore.collection('Games').where("joinable", "==", true)
                .onSnapshot(function (snapshot) {
                    var games = [];
                    snapshot.forEach(function (doc) {
                        if (!doc.data()["usersInPlay"].includes(that.state.user)) {
                            games.push(doc.id);
                        }
                    });
                    var compList = games.map((g) =>
                        <JoinGameCard key={g} game={g} user={that.state.user} nav={that.props.navigation} disabled={!that.props.navigation.state.params.canJoin} />
                    )
                    if (that._isMounted) {
                        that.setState({
                            gamesList: games,
                            compList: compList,
                        })
                    }
                }, function (error) {
                    that.setState({
                        compList: <Text style={styles.errorStyle}>Error Loading Games</Text>
                    })
                }
                )
        } catch (error) {
            this.setState({
                compList: <Text style={styles.errorStyle}>Error Loading Games</Text>
            })
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    notNow = async () => {
        var m = await new Promise(resolve => {
            this.setState({
                visible: false
            });
            resolve('resolved');
        });
        this.props.navigation.navigate("HomeScreen")
    }

    link = async () => {
        var m = await new Promise(resolve => {
            this.setState({
                visible: false
            });
            resolve('resolved');
        });
        this.props.navigation.navigate("Link", { user: this.state.user, from: 'JoinGames', m: m })
    }

    render() {
        return (
            <Container style={styles.outContainer}>
                <Header
                    leftComponent={<TouchableOpacity style={styles.icons}>
                        <SimpleLineIcons name='arrow-left' color='white' size={20} onPress={() => this.props.navigation.navigate("HomeScreen")} />
                    </TouchableOpacity>}
                    centerComponent={<Text style={styles.navItemStyle}>Open Games</Text>}
                    outerContainerStyles={{ backgroundColor: '#3cb371', height: 88, marginBottom: 5 }}
                />
                <Dialog
                    visible={this.state.visible}
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
                        height: 150,
                        width: 300
                    }}>
                        <Text style={{ fontSize: 18, fontFamily: 'Avenir', paddingHorizontal: 30, paddingVertical: 20, textAlign: 'center' }}>Link Bank Account Before Joining Games</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Button
                                title="Not Now"
                                light
                                buttonStyle={{ borderRadius: 5, width: 95, height: 35, padding: 2 }}
                                fontSize={16}
                                backgroundColor='white'
                                textStyle={{ fontSize: 18, fontFamily: "Avenir", color: "#3cb371" }}
                                //onPress={this.notNow}
                                onPress={this.notNow}
                            />
                            <Button
                                title="Link"
                                light
                                buttonStyle={{ borderRadius: 5, width: 105, height: 35, padding: 2 }}
                                fontSize={16}
                                backgroundColor='#3cb371'
                                textStyle={{ fontSize: 18, fontFamily: "Avenir" }}
                                onPress={this.link}
                            />
                        </View>
                    </DialogContent>
                </Dialog>
                {this.state.linkBankComp}
                <ScrollView>
                    {this.state.compList}
                </ScrollView>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    outContainer: {
        backgroundColor: 'white',
    },
    icons: {
        marginLeft: 0,
        marginBottom: 0
    },
    navItemStyle: {
        fontSize: 18,
        fontFamily: 'Avenir',
        color: 'white'
    }
});