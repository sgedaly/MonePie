import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text
} from 'react-native';
import { Button } from 'react-native-elements';
import { Container, Content, Form, Item, Input, Label } from 'native-base';
import { SimpleLineIcons } from '@expo/vector-icons';
import firestore from '../firestore.js';

export default class EditProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            page: '1',
            first: '',
            last: '',
            email: '',
            user: this.props.navigation.state.params.user
            //this.props.navigation.state.params.user
        }
    }


    componentDidMount() {
        var that = this;
        console.log(that.state.user);
        firestore.collection("Users").doc(that.state.user)
            .onSnapshot(function (doc) {
                mail = doc.data()['email'];
                fN = doc.data()['firstName'];
                lN = doc.data()['lastName'];

                that.setState({
                    email: mail,
                    first: fN,
                    last: lN
                })
            })
    }

    saveProfile() {
        var f = this.state.first.toLowerCase().trim()
        if (f.charAt(f.length - 1) == ' ' && f.charAt(0) == ' ') {
            f = f.substring(1, f.length - 1)
        } else if (f.charAt(f.length - 1) == ' ') {
            f = f.substring(0, f.length - 1)
        } else if (f.charAt(0) == ' ') {
            f = f.substring(1, f.length)
        }
        if (f.length == 0) {
            alert("Enter a non-empty name and last name")
            return
        }

        var l = this.state.last.toLowerCase().trim()
        if (l.charAt(l.length - 1) == ' ' && l.charAt(0) == ' ') {
            l = l.substring(1, l.length - 1)
        } else if (f.charAt(l.length - 1) == ' ') {
            l = l.substring(0, l.length - 1)
        } else if (f.charAt(0) == ' ') {
            l = l.substring(1, l.length)
        }
        if (f.length == 0 || l.length == 0) {
            alert("Enter a non-empty name and last name")
            return
        }
        var userdoc = firestore.collection('Users').doc(this.state.user);
        userdoc.update({
            firstName: this.state.first.toLowerCase().trim(),
            lastName: this.state.last.toLowerCase().trim(),
        });
        this.props.navigation.navigate('HomeScreen')
    }



    render() {
        return (
            <Container style={styles.outContainer}>
                <View style={styles.sectionHeadingStyle}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                        <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} />
                    </TouchableOpacity>
                    <Text style={styles.navItemStyle}>Edit Profile</Text>
                </View>
                <Content>
                    <Form style={styles.helpLink}>
                        <Item floatingLabel>
                            <Label>First Name</Label>
                            <Input
                                onChangeText={(first) => this.setState({ first })}
                            />
                        </Item>
                        <Item floatingLabel>
                            <Label>Last Name</Label>
                            <Input
                                onChangeText={(last) => this.setState({ last })}
                            />
                        </Item>
                    </Form>
                    <Button
                        title='Save'
                        style={{ paddingHorizontal: 20 }}
                        buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}

                        light
                        backgroundColor='#3cb371'
                        onPress={() => this.saveProfile(this.state.firstName, this.state.lastName)}
                    />
                </Content>
            </Container >
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
        paddingLeft: 115,
        fontSize: 18,
        fontFamily: 'Avenir'
    },
    textContainer: {
        alignItems: 'center',
    },
    textStyle: {
        color: 'white',
    },
    but: {
        marginTop: 15,
        marginRight: 15,
        marginLeft: 15,
    },
    helpLink: {
        paddingVertical: 15,
        marginTop: 15,
    },
    helpLinkText: {
        fontSize: 14,
        color: '#a4f9ef7F',
    },
    buttonStyle: {
        alignSelf: 'stretch',
        margin: 25,
        flexDirection: 'column',
        flex: 0.06,
        backgroundColor: '#3cb371',
        justifyContent: 'center',
        alignItems: 'center',
    }
});