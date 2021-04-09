import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text
} from 'react-native';
import { Header, Button } from 'react-native-elements';
import { Container, Content, Form, Item, Input, Label } from 'native-base';
import { SimpleLineIcons } from '@expo/vector-icons';
import firebase from '@firebase/app';
import 'firebase/firestore';
import firestore from '../firestore.js';
import util from 'util';


export default class TransferToBank extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            page: '1',
            amount: '$0.00',
            disabled: true,
            loading: false
        }
    }

    txtChange(amount) {
        if (isNaN(amount)) {
            alert("Please enter a valid amount");
            return;
        }
        this.setState({ amount: "$" + amount, disabled: false });
        if (amount == "" || parseFloat(amount) == 0) {
            this.setState({ disabled: true });
        }
    }

    transfer2() {
        this.setState({
            loading: true
        });
        var amountToWithdraw = parseFloat(this.state.amount.replace("$", ""));
        //make transfer with backend. If it gets approved..
        if (amountToWithdraw > this.props.navigation.state.params.balance) {
            alert("Withdrawal Limit Exceeded. You can only withdraw up to $" + this.props.navigation.state.params.balance)
            this.setState({
                loading: false
            });
            return;
        }
        var that = this
        firestore.collection('Users').doc(this.props.navigation.state.params.user).update({
            accountBalance: that.props.navigation.state.params.balance - amountToWithdraw,
            transactions: firebase.firestore.FieldValue.arrayUnion({
                amount: amountToWithdraw,
                bankAccount: that.props.navigation.state.params.bankAccount,
                date: that.props.navigation.state.params.date,
                type: that.props.navigation.state.params.type,
                key: Math.random()
            })
        }).then(function () {
            that.setState({
                loading: false
            });
            that.props.navigation.navigate('TransferConfirmation', { user: that.props.navigation.state.params.user, wdAmount: amountToWithdraw });
        })
    }

    async transfer() {
        /////
        console.log("paying")
        this.setState({
            loading: true,
            disabled: true
        });
        var amountToWithdraw = parseFloat(this.state.amount.replace("$", ""));
        //make transfer with backend. If it gets approved..
        if (amountToWithdraw > this.props.navigation.state.params.balance) {
            alert("Withdrawal Limit Exceeded. You can only withdraw up to $" + this.props.navigation.state.params.balance)
            this.setState({
                loading: false
            });
            return;
        } else if (amountToWithdraw < 0.75) {
            alert("The minimum amount to withdraw is $0.75.")
            this.setState({
                loading: false
            });
            return;
        }
        try {//mbu
            await fetch('https://money-pie-server.herokuapp.com/plaidAuth', {
                method: 'POST',
                headers: {
                    //'Accept': 'application/x-www-form-urlencoded',
                    'Content-Type': 'application/json',//'x-www-form-urlencoded'
                },
                mode: 'cors',
                body: JSON.stringify({
                    user: this.props.navigation.state.params.user,
                    amount: this.state.amount.replace("$", ""),//this.state.dailyContribution.toFixed(2)
                    option: 'withdraw'
                }),
            })
                .then((response) => {
                    console.log("withdraw response......")
                    this.prettyPrintResponse(response)
                    var that = this
                    if (response.status == 200) {
                        firestore.collection('Users').doc(this.props.navigation.state.params.user).update({
                            accountBalance: that.props.navigation.state.params.balance - amountToWithdraw,
                            transactions: firebase.firestore.FieldValue.arrayUnion({
                                amount: amountToWithdraw,
                                bankAccount: that.props.navigation.state.params.bankAccount,
                                date: that.props.navigation.state.params.date,
                                type: that.props.navigation.state.params.type,
                                key: Math.random()
                            })
                        }).then(function () {
                            that.setState({
                                loading: false,
                                disabled: false
                            });
                            that.props.navigation.navigate('TransferConfirmation', { user: that.props.navigation.state.params.user, success: true, wdAmount: amountToWithdraw });
                        })
                    } else if (response.status == 404) {
                        console.log('failed')
                        that.props.navigation.navigate('TransferConfirmation', { user: that.props.navigation.state.params.user, success: false, wdAmount: amountToWithdraw });
                        that.setState({
                            loading: false,
                            disabled: false
                        });
                    }
                })
                .catch(error => console.error('Error: ', error))//Agregar unsuccessful link
                .then(response => {
                    console.log('Success:', JSON.stringify(response))
                })
        } catch (error) {
            console.error(error);
        }
    }

    prettyPrintResponse = response => {
        console.log(util.inspect(response, { colors: true, depth: 4 }));
    };

    render() {
        return (
            <Container style={styles.outContainer}>
                <Header
                    leftComponent={<TouchableOpacity style={styles.icons}>
                        <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} onPress={() => this.props.navigation.navigate("Wallet", { user: this.props.navigation.state.params.user })} />
                    </TouchableOpacity>}
                    centerComponent={<Text style={styles.navItemStyle}>Transfer To Bank</Text>}
                    outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
                />
                <Content>
                    <Form style={styles.helpLink}>
                        <Item floatingLabel>
                            <Label style={{ fontSize: 20, fontFamily: "Avenir" }}>{this.state.amount}</Label>
                            <Input
                                style={{ fontSize: 20, color: '#3cb371', fontFamily: "Avenir" }}
                                onChangeText={(amount) => this.txtChange(amount)}
                            />
                        </Item>
                    </Form>
                    <Text style={styles.titleItem}>${this.props.navigation.state.params.balance} AVAILABLE</Text>
                    <Button
                        title='Transfer'
                        style={{ paddingHorizontal: 20 }}
                        buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}

                        light
                        disabled={this.state.disabled}
                        loading={this.state.loading}
                        backgroundColor='#3cb371'
                        onPress={() => this.transfer()}
                    />
                </Content>
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
        fontSize: 12,
        color: 'grey',
        fontFamily: 'Avenir'
    },
});