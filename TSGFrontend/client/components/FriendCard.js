import React from 'react';
import { ListItem, Left, Body, Thumbnail, Text } from 'native-base';
import firestore from '../firestore.js';
import {
    StyleSheet
} from 'react-native';
//import AddBut from './AddBut.js';


export default class FriendCard extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            //user: this.props.navigation.state.params.user,
            user: 'sam_lhbmrxg_test@tfbnw.net',
            email: '',
            photoURL: 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=100758224333168&height=200&width=200&ext=1548539363&hash=AeSiV0PNqdptXTwE',
            name: ''
        }
    }

    componentDidMount() {
        this._isMounted = true;
        var that = this;
        if (this.props.id != "") {
            firestore.collection("Users").where("facebookID", "==", this.props.id)
                .onSnapshot(function (snapshot) {
                    snapshot.forEach(function (doc) {
                        email = doc.data()['email'];
                        photoURL = doc.data()['photoURL'];
                    });
                    if (that._isMounted) {
                        that.setState({
                            email: email,
                            photoURL: photoURL,
                            name: that.props.name
                        })
                    }
                },
                )
        } else {
            this.setState({
                email: this.props.email,
                photoURL: this.props.photoURL,
                name: this.props.name
            })
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <ListItem avatar>
                <Left>
                    <Thumbnail small source={{ uri: this.state.photoURL }} />
                </Left>
                <Body>
                    <Text>{this.state.name}</Text>
                    <Text note>{this.state.email}</Text>
                </Body>
                {/* <Right>
                    <AddBut enabled={this.props.add}></AddBut>
                </Right> */}
            </ListItem>
        );
    }
}

const styles = StyleSheet.create({
    buttonStyle: {
        alignSelf: 'stretch',

        flexDirection: 'column',
        justifyContent: 'center',

        alignItems: 'center',

        borderColor: '#3cb371',
        borderWidth: 1
    }
});