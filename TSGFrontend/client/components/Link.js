import React from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import PlaidAuthenticator from 'react-native-plaid-link';
import PlaidLink from 'react-native-plaid-link';
//import Plaid from 'plaid';
import { Container, Spinner } from 'native-base';
import { Button, Header } from 'react-native-elements';
import util from 'util'
import { SimpleLineIcons } from '@expo/vector-icons';
import firestore from '../firestore.js';


class Link extends React.Component {
    constructor(props) {
        super(props);
        //this.onSuccess = this.onSuccess.bind(this);
        //this.onExit = this.onExit.bind(this);
        this.state = {
            user: this.props.navigation.state.params.user,
            data: {},
            status: '',
            invalidAccount: false,
            screen: <Container style={{ backgroundColor: 'white', alignItems: 'center', justifyContent: "center" }}>
                <Spinner color='#3cb371'>
                </Spinner>
            </Container>
        };
    };

    render() {
        //Captcha Problem
        const patchPostMessageFunction = () => {
            var originalPostMessage = window.postMessage;
            var patchedPostMessage = function (message, targetOrigin, transfer) {
                originalPostMessage(message, targetOrigin, transfer);
            };
            patchedPostMessage.toString = () => {
                return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
            };
            window.postMessage = patchedPostMessage;
        };
        //End Captcha problem
        switch (this.state.status) {
            case 'CONNECTED':
                console.log(this.state.data)
                return (
                    this.state.screen
                );
            case 'EXIT':
                return (this.onExit(null, null));
            default:
                return (
                    this.renderLogin()
                );
        }
    }

    renderLogin() {
        return (
            <PlaidAuthenticator
                onMessage={this.onMessage}
                publicKey="5043d945a5b10260976e0c0ceef740"
                env="development"//"development"
                product="auth"
                clientName="MoneyPie"
                onSuccess={this.onSuccess}
                onExit={this.onExit}
                requires_code
                includeDisplayData={true}
                javaScriptEnabled={true}
                ref={this._refWebView}
                injectedJavaScript={`(function () {
                    let originalPostMessage = window.postMessage;
                    let patchedPostMessage = function(message, targetOrigin, transfer, ...other) { 
                      originalPostMessage(message, targetOrigin, transfer, ...other);
                    };
              
                    patchedPostMessage.toString = function() { 
                      return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
                    };
              
                    window.postMessage = patchedPostMessage;
                  })()`}
            />
        );
    }

    onMessage = (data) => {
        var actionName = data.action.substr(data.action.lastIndexOf(':') + 1).toUpperCase()
        console.log(actionName)
        this.setState({
            data,
            status: actionName
        })
        if (actionName == 'CONNECTED') {
            this.onSuccess(data.metadata.public_token, data.metadata)
        }
        console.log(this.state.status)
    }

    onExit = (err, metadata) => {
        console.log('Entered onExit');
        return (
            <Container style={styles.outContainer}>
                <View style={styles.sectionHeadingStyle}>
                    <TouchableOpacity onPress={() => this.close()}>
                        <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} />
                    </TouchableOpacity>
                </View>
                <Button
                    title='Link Bank'
                    style={{ marginVertical: 100, marginHorizontal: 20 }}
                    buttonStyle={{ borderRadius: 5 }}
                    light
                    disabled={this.state.disabled}
                    backgroundColor='#3cb371'
                    onPress={() => this.change()}
                />
            </Container>
        )
    }

    change = () => {
        console.log('change')
        this.setState({
            status: ''
        });
    }

    sendToken = async (publicToken, accountID, bankName, bankAccount4Last, bankAccountName) => {
        console.log("sendToken")
        try {//mbu http://localhost:3000  https://money-pie-server.herokuapp.com
            await fetch('https://money-pie-server.herokuapp.com/tokenExchange', {
                method: 'POST',
                headers: {
                    //'Accept': 'application/x-www-form-urlencoded',
                    'Content-Type': 'application/json',//'x-www-form-urlencoded'
                },
                mode: 'cors',
                body: JSON.stringify({
                    public_token: publicToken,
                    account_id: accountID,
                    user: this.state.user,
                    institution: bankName
                }),
            }).then(resp => {
                this.prettyPrintResponse(resp)
                var errScr = <Container style={styles.outContainer}>
                    <Header
                        centerComponent={<Text style={styles.navItemStyle}>Error Linking Bank</Text>}
                        outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
                    />
                    <Text style={styles.titleItem}>Sorry, we were not able to link your bank account, please check your connection or try later.</Text>
                    <Button
                        title='Try Again'
                        style={{ paddingHorizontal: 20 }}
                        buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}

                        light
                        disabled={this.state.disabled}
                        backgroundColor='#3cb371'
                        onPress={this.change}
                    />
                </Container>
                if (resp.status == 404 || resp.status == 400) {
                    console.log('returning false')
                    this.setState({
                        screen: errScr
                    })
                    return false;
                } else {
                    firestore.collection("Users").doc(this.state.user).update({
                        bankAccount: {
                            name: bankAccountName,
                            last4: bankAccount4Last,
                            bank: bankName
                        }
                    }).catch((err) => {
                        this.setState({
                            screen: errorScreen
                        })
                    })
                    this.setState({
                        screen: <Container style={styles.outContainer}>
                            <Header
                                centerComponent={<Text style={styles.navItemStyle}>Bank Successfully Linked</Text>}
                                outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
                            />
                            <Text style={styles.titleItem}>We've successfully linked your bank account, you can now start saving.</Text>
                            <Button
                                title='Done'
                                style={{ paddingHorizontal: 20 }}
                                buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}

                                light
                                disabled={this.state.disabled}
                                backgroundColor='#3cb371'
                                onPress={this.close}
                            />
                        </Container>
                    })
                    return true;
                }
            }).catch((error) => {
                this.setState({
                    screen: errScr
                })
                return false
            })//Agregar unsuccessful link
        } catch (error) {
            this.setState({
                screen: errScr
            })
            return false;
        } finally { }
    }

    close = () => {
        this.setState({
            status: 'init'
        })
        if (this.props.navigation.state.params.from === 'JoinGames') {
            this.props.navigation.navigate('JoinPublicGame', { user: this.state.user, canJoin: true });
        } else {
            this.props.navigation.navigate('HomeScreen');
        }
    }

    prettyPrintResponse = response => {
        console.log(util.inspect(response, { colors: true, depth: 4 }));
    };

    onSuccess = async (public_token, metadata) => {
        console.log('SuccessDadada');
        console.log(public_token);
        console.log(metadata);
        bankAccountName = metadata.account.name;
        bankAccount4Last = metadata.account.mask;
        bankName = metadata.institution.name;
        //en production quitar esto y descomentar senToken
        firestore.collection("Users").doc(this.state.user).update({
            bankAccount: {
                name: bankAccountName,
                last4: bankAccount4Last,
                bank: bankName
            }
        })
        this.setState({
            screen: <Container style={styles.outContainer}>
                <Header
                    centerComponent={<Text style={styles.navItemStyle}>Bank Successfully Linked</Text>}
                    outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
                />
                <Text style={styles.titleItem}>We've successfully linked your bank account, you can now start saving.</Text>
                <Button
                    title='Done'
                    style={{ paddingHorizontal: 20 }}
                    buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}

                    light
                    disabled={this.state.disabled}
                    backgroundColor='#3cb371'
                    onPress={this.close}
                />
            </Container>
        })
        await this.sendToken(public_token, metadata.account_id, metadata.institution.name, bankAccount4Last, bankAccountName)
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
    greenText: {
        color: '#2b95ff',
        fontSize: 12,
        paddingTop: 250,
        paddingLeft: 100,
    },
    buttonStyle: {
        alignSelf: 'stretch',
        margin: 25,
        flexDirection: 'column',
        flex: 0.06,
        backgroundColor: '#3cb371',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textStyle: {
        color: 'white',
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

export default Link;