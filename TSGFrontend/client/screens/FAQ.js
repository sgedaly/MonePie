import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import { Container, Text } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';


export default class TransferToBank extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            page: '1'
        }
    }


    render() {
        return (

            <Container style={styles.outContainer}>
                <Header
                    leftComponent={<TouchableOpacity style={styles.icons}>
                        <Ionicons name='md-menu' color='white' size={30} onPress={() => this.props.navigation.toggleDrawer()} />
                    </TouchableOpacity>}
                    centerComponent={<Text style={styles.navItemStyle}>FAQ</Text>}
                    outerContainerStyles={{ backgroundColor: '#3cb371', height: 88, marginBottom: 5 }}
                />

                <ScrollView>
                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>What is the difference between all the games? What are the factors?</Text>
                        <Text style={styles.ruleText}>You pick a game based on how much money you want to save, risk (how much you are willing to lose if you forget to save), and time (over what period of time do you want to save that money).</Text>

                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>Can you give an example?</Text>
                        <Text style={styles.ruleText}>Sure! Say you want to save $100 with a 50% risk, over 100 days. In this specific game, you would have to save $1 per day, for 100 days. If on day 50 you forget to save, at this point you have saved $50, so you would lose $25 (50%), which would go to the general pot for remaining players who go to day 100 to split among themselves.</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>Can I save automatically?</Text>
                        <Text style={styles.ruleText}>Nope. That is the whole point of the game. We don’t have a setting to withdraw from your account automatically, you have to manually go on the app and save!</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>How do I lose the game?</Text>
                        <Text style={styles.ruleText}>If you forget to save on your “save date” You are out and lose a percentage of what you have already put up for that game.</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>What happens if I make it all the way through?</Text>
                        <Text style={styles.ruleText}>You would get all the money you have saved for that game, plus your portion of the losses of all the players who have lost.</Text>
                    </View>


                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>What if everyone pays every day and no one loses?</Text>
                        <Text style={styles.ruleText}>Usually a percentage of people will lose. If not, you have saved money anyway.</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>How do i know when is the specified “Save Day”?</Text>
                        <Text style={styles.ruleText}>Every game has a different save date. Some are every day, every two days, once a week, etc. Every time you add money, a message will tell you when you will be able to add more money.</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>Can I withdraw from a game once it started?</Text>
                        <Text style={styles.ruleText}>Yes! You can withdraw from any game at any time without penalty and all the money that you saved on that game will go to your MoneyPie wallet</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>What happens if I join a game and I do not pay on the first day?</Text>
                        <Text style={styles.ruleText}>If you forget to pay on the very first day, a penalty of $0.50 will be charged</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>Where does money go after the game is over?</Text>
                        <Text style={styles.ruleText}>To your wallet.</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>Can I pay the games with my wallet blance?</Text>
                        <Text style={styles.ruleText}>No, you must pay with your bank account.</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>When can I withdraw money?</Text>
                        <Text style={styles.ruleText}>You can withdraw money from your wallet anytime.</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>How do I connect my account account?</Text>
                        <Text style={styles.ruleText}>You may connect your bank account in the 'Link Bank Account' tab in side menu.</Text>
                    </View>
                    {/* <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>Is this safe?</Text>
                        <Text style={styles.ruleText}>xxx</Text>
                    </View> */}
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
    },
    sectionHeadingStyle: {
        paddingTop: 45,
        paddingLeft: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 10
    },
    rule: {
        backgroundColor: 'white',
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.6,

    },
    ruleHeading: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 10,
        color: '#3cb371',
        fontFamily: 'Avenir'
    },
    ruleText: {
        fontSize: 16,
        fontWeight: 'normal',
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        fontFamily: 'Avenir'
    }
});