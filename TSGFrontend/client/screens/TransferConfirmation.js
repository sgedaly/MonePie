import React from 'react';
import {
    StyleSheet,
    Text
} from 'react-native';
import { Button, Header } from 'react-native-elements';
import { Container } from 'native-base';


export default class TransferConfirmation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            success: this.props.navigation.state.params.success
        }
    }

    render() {
        if (this.state.success == true) {
            return (
                <Container style={styles.outContainer}>
                    <Header
                        centerComponent={<Text style={styles.navItemStyle}>Transfer Initiated</Text>}
                        outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
                    />
                    <Text style={styles.titleItem}>We've initiated your transfer of ${this.props.navigation.state.params.wdAmount}. It may take up to 5 days to arrive to your account.</Text>
                    <Button
                        title='Done'
                        style={{ paddingHorizontal: 20 }}
                        buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}
                        light
                        disabled={this.state.disabled}
                        backgroundColor='#3cb371'
                        onPress={() => this.props.navigation.navigate("Wallet", { user: this.props.navigation.state.params.user })}
                    />
                </Container>
            );
        } else {
            return (
                <Container style={styles.outContainer}>
                    <Header
                        centerComponent={<Text style={styles.navItemStyle}>Transfer Failed</Text>}
                        outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
                    />
                    <Text style={styles.titleItem}>There was an error initiating your transfer. Try again later and if this error persists give us a call at +1(305)343-1896.</Text>
                    <Button
                        title='Done'
                        style={{ paddingHorizontal: 20 }}
                        buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}
                        light
                        disabled={this.state.disabled}
                        backgroundColor='#3cb371'
                        onPress={() => this.props.navigation.navigate("Wallet", { user: this.props.navigation.state.params.user })}
                    />
                </Container>
            );
        }
    }
}

const styles = StyleSheet.create({
    outContainer: {
        backgroundColor: 'white',
    },
    sectionHeadingStyle: {
        paddingTop: 45,
        paddingLeft: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    navItemStyle: {
        fontSize: 18,
        fontFamily: 'Avenir'
    },
    titleItem: {
        paddingTop: 10,
        paddingLeft: 15,
        paddingBottom: 30,
        fontSize: 14,
        fontFamily: 'Avenir'
    },
});