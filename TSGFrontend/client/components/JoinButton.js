import React from 'react';
import { Text } from 'native-base';
import { Button } from 'react-native-elements';
import {
    View,
} from 'react-native';

const JoinButton = (props) => {
    fromEnd = Math.floor(props.diff / 60 / 60 / 24);
    var txt = "closes in " + fromEnd + " days"
    if (fromEnd == 1) {
        txt = "closes in " + fromEnd + " day"
    } else if (fromEnd == 0) {
        fromEnd = Math.floor(props.diff / 60 / 60);
        txt = "closes in " + fromEnd + " hours"
        if (fromEnd == 1) {
            txt = "closes in " + fromEnd + " hour"
        } else if (fromEnd == 0) {
            fromEnd = Math.floor(props.diff / 60);
            if (fromEnd == 0) {
                fromEnd = 1;
            }
            txt = "closes in " + fromEnd + " min"
        }
    }
    return (
        <View style={{ alignItems: 'center' }}>
            <Button
                title="Join"
                light
                buttonStyle={{ borderRadius: 5, width: 85, height: 35, padding: 2 }}
                fontSize={16}
                backgroundColor='#3cb371'
                textStyle={{ fontSize: 18, fontFamily: "Avenir" }}
                onPress={props.onPress}
            //disabled={props.disabled}
            //loading={props.loading}
            />
            <Text style={{ color: 'grey', fontStyle: 'italic', fontSize: 10, paddingTop: 3, fontFamily: 'Avenir' }}>{txt}</Text>
        </View>
    );
};

const styles = {
    buttonStyle: {
        alignSelf: 'stretch',

        flexDirection: 'column',
        justifyContent: 'center',

        alignItems: 'center',

        borderColor: '#3cb371',
        borderWidth: 1,
        width: 80
    }
};

export default JoinButton;
