import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Container, List, Button, Text } from 'native-base';
import { SimpleLineIcons, Ionicons } from '@expo/vector-icons';
import firestore from '../firestore.js';
import FriendCard from '../components/FriendCard';
import { SearchBar } from 'react-native-elements';


export default class AddFriends extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.navigation.state.params.user,
            friendsList: [],
            searchTerm: '',
            notFriends: []
        }
    }

    searchUpdated(term) {
        this.setState({
            searchTerm: term
        });
    }

    searchData() {
        try {
            var that = this
            var term = this.state.searchTerm.toLowerCase();
            if (term.length > 100) {
                alert("Please use less than 100 characters")
                return;
            }
            var entireName = term.split(" ");
            if (entireName.length == 2 && entireName[1] == "") {
                entireName = [entireName[0]]
            }
            console.log(entireName.length)
            if (entireName.length == 0) {
                return;
            }
            if (entireName.includes("")) {
                alert("Please do not use extra spaces.")
                return;
            }
            if (entireName.length == 1) {
                var list = []
                firestore.collection("Users").where("firstName", "==", entireName[0])
                    .onSnapshot(function (snapshot) {
                        snapshot.forEach(function (doc) {
                            _id = '';
                            _email = doc.data()['email'];
                            _name = doc.data()['firstName'] + " " + doc.data()['lastName'];
                            _photoURL = doc.data()['photoURL'];
                            // if (doc.data()['facebookFriends'])
                            list.push({ 'id': _id, 'name': _name, 'email': _email, 'photoURL': _photoURL })
                        });
                        that.setState({
                            friendsList: list
                        })
                    },
                    )
                firestore.collection("Users").where("lastName", "==", entireName[0])
                    .onSnapshot(function (snapshot) {
                        snapshot.forEach(function (doc) {
                            _id = '';
                            _email = doc.data()['email'];
                            _name = doc.data()['firstName'] + " " + doc.data()['lastName'];
                            _photoURL = doc.data()['photoURL'];
                            list.push({ 'id': _id, 'name': _name, 'email': _email, 'photoURL': _photoURL })
                        });
                        that.setState({
                            friendsList: list
                        })
                    },
                    )
            } else if (entireName.length == 2) {
                var list = []
                firestore.collection("Users").where("firstName", "==", entireName[0]).where("lastName", "==", entireName[1])
                    .onSnapshot(function (snapshot) {
                        snapshot.forEach(function (doc) {
                            _id = '';
                            _email = doc.data()['email'];
                            _name = doc.data()['firstName'] + " " + doc.data()['lastName'];
                            _photoURL = doc.data()['photoURL'];
                            list.push({ 'id': _id, 'name': _name, 'email': _email, 'photoURL': _photoURL })
                        });
                        that.setState({
                            friendsList: list
                        })
                    },
                    )
                firestore.collection("Users").where("firstName", "==", term)
                    .onSnapshot(function (snapshot) {
                        snapshot.forEach(function (doc) {
                            _id = '';
                            _email = doc.data()['email'];
                            _name = doc.data()['firstName'] + " " + doc.data()['lastName'];
                            _photoURL = doc.data()['photoURL'];
                            list.push({ 'id': _id, 'name': _name, 'email': _email, 'photoURL': _photoURL })
                        });
                        that.setState({
                            friendsList: list
                        })
                    },
                    )
                firestore.collection("Users").where("lastName", "==", term)
                    .onSnapshot(function (snapshot) {
                        snapshot.forEach(function (doc) {
                            _id = '';
                            _email = doc.data()['email'];
                            _name = doc.data()['firstName'] + " " + doc.data()['lastName'];
                            _photoURL = doc.data()['photoURL'];
                            list.push({ 'id': _id, 'name': _name, 'email': _email, 'photoURL': _photoURL })
                        });
                        that.setState({
                            friendsList: list
                        })
                    },
                    )
            } else if (entireName.length == 3) {
                firestore.collection("Users").where("firstName", "==", entireName[0] + " " + entireName[1]).where("lastName", "==", entireName[2])
                    .onSnapshot(function (snapshot) {
                        snapshot.forEach(function (doc) {
                            _id = '';
                            _email = doc.data()['email'];
                            _name = doc.data()['firstName'] + " " + doc.data()['lastName'];
                            _photoURL = doc.data()['photoURL'];
                            list.push({ 'id': _id, 'name': _name, 'email': _email, 'photoURL': _photoURL })
                        });
                        that.setState({
                            friendsList: list
                        })
                    },
                    )
                firestore.collection("Users").where("firstName", "==", entireName[0]).where("lastName", "==", entireName[1] + " " + entireName[2])
                    .onSnapshot(function (snapshot) {
                        snapshot.forEach(function (doc) {
                            _id = '';
                            _email = doc.data()['email'];
                            _name = doc.data()['firstName'] + " " + doc.data()['lastName'];
                            _photoURL = doc.data()['photoURL'];
                            list.push({ 'id': _id, 'name': _name, 'email': _email, 'photoURL': _photoURL })
                        });
                        that.setState({
                            friendsList: list
                        })
                    },
                    )
            } else if (entireName.length == 4) {
                firestore.collection("Users").where("firstName", "==", entireName[0] + " " + entireName[1]).where("lastName", "==", entireName[2] + " " + entireName[3])
                    .onSnapshot(function (snapshot) {
                        snapshot.forEach(function (doc) {
                            _id = '';
                            _email = doc.data()['email'];
                            _name = doc.data()['firstName'] + " " + doc.data()['lastName'];
                            _photoURL = doc.data()['photoURL'];
                            list.push({ 'id': _id, 'name': _name, 'email': _email, 'photoURL': _photoURL })
                        });
                        that.setState({
                            friendsList: list
                        })
                    },
                    )
            } else {
                firestore.collection("Users").where("firstName", "==", entireName[0]).where("lastName", "==", entireName[1])
                    .onSnapshot(function (snapshot) {
                        snapshot.forEach(function (doc) {
                            _id = '';
                            _email = doc.data()['email'];
                            _name = doc.data()['firstName'] + " " + doc.data()['lastName'];
                            _photoURL = doc.data()['photoURL'];
                            list.push({ 'id': _id, 'name': _name, 'email': _email, 'photoURL': _photoURL })
                        });
                        that.setState({
                            friendsList: list
                        })
                    },
                    )
            }
            console.log(that.props.navigation.state.params.friends)
            notFriends = list.filter(x => !that.props.navigation.state.params.friends.includes(x));
            console.log(notFriends)
            that.setState({
                notFriends: notFriends
            })
        } catch (e) {
            this.setState({
                friendsList: [],
                notFriends: []
            })
            alert("Please write a name followed by a last name")
        }

    }

    render() {
        return (
            <Container style={styles.outContainer}>
                <View style={styles.sectionHeadingStyle}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('Friends', { user: this.state.user })}>
                        <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} />
                    </TouchableOpacity>
                    <Text style={styles.nav}>Add Friends</Text>
                </View>
                <View style={styles.searchBar}>
                    <View style={styles.searchBa}>
                        <SearchBar
                            lightTheme
                            round
                            onChangeText={(term) => { this.searchUpdated(term) }}
                            placeholder='Search people'
                        />
                    </View>
                    <Button transparent onPress={() => this.searchData()}>
                        <Text>Search</Text>
                    </Button>
                </View>
                <Text>Friends</Text>
                <List>
                    {this.props.navigation.state.params.friends.map(g => {
                        return (
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Friends', { user: this.state.user })}>
                                <FriendCard key={g['email']} name={g['name']} id={g['id']} email={g['email']} photoURL={g['photoURL']} add={false} />
                            </TouchableOpacity>
                        )
                    })}
                </List>
                <Text>Other People</Text>
                <List>
                    {this.state.notFriends.map(g => {
                        return (
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Friends', { user: this.state.user })}>
                                <FriendCard key={g['email']} name={g['name']} id={g['id']} email={g['email']} photoURL={g['photoURL']} add={true} />
                            </TouchableOpacity>
                        )
                    })}
                </List>
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
        paddingBottom: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.26
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    searchBa: {
        flex: 4,
    },
    searchText: {
        flex: 1,
    },
    options: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 0.26
    },
    navItemStyle: {
        paddingLeft: 20
    },
    nav: {
        paddingLeft: 110,
        fontSize: 18
    }
});