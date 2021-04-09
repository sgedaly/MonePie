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
import Dialog, { DialogContent, SlideAnimation } from 'react-native-popup-dialog';
import firestore from '../firestore.js';
import firebase from '@firebase/app';
import 'firebase/firestore';


export default class Feedback extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            page: '1',
            message: '',
            disabled: true,
            loading: false,
            visible: false
        }
    }

    componentDidMount() {
        this.setState({
            message: ""
        })
    }

    message() {
        this.setState({
            loading: true
        });
        var that = this
        firestore.collection('Feedback').doc('betaFeedback').update({
            Messages: firebase.firestore.FieldValue.arrayUnion({
                message: that.state.message,
                user: that.props.navigation.state.params.user,
                date: new Date()
            })
        }).then(function () {
            that.setState({
                loading: false,
                message: "",
                visible: true
            });
        })
    }

    link = async () => {
        var m = await new Promise(resolve => {
            this.setState({
                visible: false
            });
            resolve('resolved');
        });
        this.props.navigation.navigate("HomeScreen")
    }


    render() {
        return (
            <Container style={styles.outContainer}>
                <Header
                    leftComponent={<TouchableOpacity style={styles.icons}>
                        <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} onPress={() => this.props.navigation.toggleDrawer()} />
                    </TouchableOpacity>}
                    centerComponent={<Text style={styles.navItemStyle}>Leave us Feedback</Text>}
                    outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
                />
                <Content>
                    <Form style={styles.helpLink}>
                        <Item floatingLabel>
                            <Label style={{ fontSize: 20, fontFamily: "Avenir" }}>Message</Label>
                            <Input
                                style={{ fontSize: 20, color: '#3cb371', fontFamily: "Avenir" }}
                                onChangeText={(msg) => this.setState({ message: msg, disabled: false })}
                            />
                        </Item>
                    </Form>
                    <Button
                        title='Send'
                        style={{ paddingHorizontal: 20, paddingTop: 20 }}
                        buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}
                        light
                        disabled={this.state.disabled}
                        loading={this.state.loading}
                        backgroundColor='#3cb371'
                        onPress={() => this.message()}
                    />
                </Content>
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
                        borderRadius: 8,
                        backgroundColor: 'white',
                        height: 150,
                        width: 300
                    }}>
                        <Text style={{ fontSize: 18, fontFamily: 'Avenir', paddingHorizontal: 30, paddingVertical: 20, textAlign: 'center' }}>Thank You! We appreciate your feedback</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Button
                                title="Done"
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