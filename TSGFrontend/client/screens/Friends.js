import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Container, List, Text } from 'native-base';
import { SimpleLineIcons, Ionicons } from '@expo/vector-icons';
import firestore from '../firestore.js';
import FriendCard from '../components/FriendCard';
import SearchInput, { createFilter } from 'react-native-search-filter';
const KEYS_TO_FILTERS = ['name'];
import { SearchBar } from 'react-native-elements'


export default class Friends extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.navigation.state.params.user,
            friendsList: [],
            searchTerm: ''
        }
    }

    componentDidMount() {
        this._isMounted = true;
        var that = this;
        firestore.collection("Users").doc(that.state.user)
            .onSnapshot(function (doc) {
                friendsList = doc.data()['facebookFriends'];
                if (that._isMounted) {
                    that.setState({
                        friendsList: friendsList
                    })
                }
            },
            )
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    searchUpdated(term) {
        this.setState({ searchTerm: term })
    }

    render() {
        const filteredFriends = this.state.friendsList.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
        return (
            <Container style={styles.outContainer}>
                <View style={styles.sectionHeadingStyle}>
                    <TouchableOpacity style={styles.icons}>
                        <Ionicons name='md-menu' color='#3cb371' size={30} onPress={() => this.props.navigation.toggleDrawer()} />
                    </TouchableOpacity>
                    <Text style={styles.nav}>Friends</Text>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('AddFriends', { user: this.state.user, friends: filteredFriends })}>
                        <Ionicons name='md-person-add' color='#3cb371' size={20} />
                    </TouchableOpacity>
                </View>
                <SearchBar
                    lightTheme
                    round
                    onChangeText={(term) => { this.searchUpdated(term) }}
                    placeholder='Search friends'
                />
                <List>
                    {filteredFriends.map(g => {
                        return (
                            <FriendCard key={g['id']} name={g['name']} id={g['id']} email={''} add={false} />
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
        paddingLeft: 125,
        paddingRight: 125
        ,
        fontSize: 18
    }
});