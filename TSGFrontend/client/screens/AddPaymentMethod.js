import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Container, Text } from 'native-base';
import { SimpleLineIcons } from '@expo/vector-icons';

export default class AddPaymentMethod extends React.Component {
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
                <View style={styles.sectionHeadingStyle}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                        <SimpleLineIcons name='close' color='#3cb371' size={20} />
                    </TouchableOpacity>
                    <Text style={styles.navItemStyle}>Add Payment Method</Text>
                </View>



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
        paddingLeft: 80,
        fontSize: 18
    }
});