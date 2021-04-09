import React from 'react';
import {
    StyleSheet,
    Text
} from 'react-native';
import { Button, Header } from 'react-native-elements';
import { Container } from 'native-base';


export default class FeedbackThanks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <Container style={styles.outContainer}>
                <Header
                    centerComponent={<Text style={styles.navItemStyle}>We appreciate your Feedback</Text>}
                    outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
                />
                <Text style={styles.titleItem}>Thanks for helping us build a better experience for our customers. We really appreciate it.</Text>
                <Button
                    title='Done'
                    style={{ paddingHorizontal: 20 }}
                    buttonStyle={{ borderRadius: 8, height: 45, padding: 2 }}

                    light
                    disabled={this.state.disabled}
                    backgroundColor='#3cb371'
                    onPress={() => this.props.navigation.navigate("HomeScreen")}
                />
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
        fontSize: 14,
        fontFamily: 'Avenir'
    },
});