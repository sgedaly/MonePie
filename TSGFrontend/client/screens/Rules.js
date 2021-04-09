import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';
import { Container, Spinner } from 'native-base';
//import {createDrawerNavigator} from 'react-navigation';

export default class Rules extends React.Component {
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
                    centerComponent={<Text style={styles.navItemStyle}>Rules</Text>}
                    outerContainerStyles={{ backgroundColor: '#3cb371', height: 88, marginBottom: 5 }}
                />

                <ScrollView>
                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>Join A Game</Text>
                        <Text style={styles.ruleText}>Join a private game with friends or a public game with strangers. Decide what game you want to join based on several factors.</Text>

                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>The Game</Text>
                        <Text style={styles.ruleText}>The game will have a "Save Day" when contestants have to open the app and save the set amount. If you forget, you are out of the game and lose a percentage of what you have already put up based on the games risk factor. The money you lose will go to the pot for remaining players to enjoy.</Text>
                    </View>

                    <View style={styles.rule}>
                        <Text style={styles.ruleHeading}>Grow Your Savings</Text>
                        <Text style={styles.ruleText}>As players lose and exit the game, a percentage of what they have saved will go to the common pot. If you are responsible enough to stay until the end, you will get keep your savings plus your cut of the common pot.</Text>
                    </View>
                </ScrollView>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    icons: {
        marginLeft: 0,
        marginBottom: 0
    },
    navItemStyle: {
        fontSize: 18,
        fontFamily: 'Avenir',
        color: 'white'
    },
    outContainer: {
        backgroundColor: 'white',
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