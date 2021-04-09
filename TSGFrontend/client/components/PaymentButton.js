import React from 'react';
import { Text } from 'native-base';
import { Button } from 'react-native-elements';
import Emoji from 'react-native-emoji';
import { View } from 'react-native';

const PaymentButton = (props) => {
  //txt1 = props.hourDifference + " hours left"
  txt1 = "Payment due in " + props.hourDifference + " hours"
  txt2 = "Next payment will be available in " + props.hourDifference + " hours"
  //txt2 = "You can add more money in " + props.hourDifference + " hours"
  if (props.hourDifference == 1) {
    //txt1 = props.hourDifference + " hour left"
    txt1 = "Payment due in " + props.hourDifference + " hour"
    txt2 = "Next payment will be available in " + props.hourDifference + " hour"
    //txt2 = "You can add more money in " + props.hourDifference + " hour"
  }
  if (props.hourDifference > 24) {
    //txt1 = Math.floor(props.hourDifference / 24) + " days left"
    txt1 = "Payment due in " + Math.floor(props.hourDifference / 24) + " days"
    txt2 = "Next payment will be available in " + Math.floor(props.hourDifference / 24) + " days"
    //txt2 = "You can add more money in " + Math.floor(props.hourDifference / 24) + " days"
    if (Math.floor(props.hourDifference / 24) == 1) {
      txt1 = "Payment due in " + Math.floor(props.hourDifference / 24) + " day"
      txt2 = "Next payment will be available in " + Math.floor(props.hourDifference / 24) + " day"
    }
  }
  if (props.enabled) {
    return (
      <View style={{
        alignItems: 'center', width: 85
      }}>
        <Button
          title={"Add $" + props.payAmount}
          light
          buttonStyle={{ borderRadius: 5, width: 85, height: 35, padding: 2 }}
          fontSize={16}
          backgroundColor='#3cb371'
          textStyle={{ fontFamily: "Avenir", color: 'white' }}
          onPress={props.onPress}
          loading={props.loading}
        />
        <Text style={{ color: 'grey', textAlign: 'center', fontStyle: 'italic', fontSize: 10, paddingTop: 3, fontFamily: 'Avenir' }}>{txt1}</Text>
      </View>
    );
  } else {
    if (!props.won) {
      return (
        <Text style={{ color: 'grey', textAlign: 'center', fontStyle: 'italic', fontSize: 12, fontFamily: 'Avenir' }}>{txt2}</Text>
      );
    } else {
      return (
        <Text style={{ color: 'grey', textAlign: 'center', fontStyle: 'italic', fontSize: 12, fontFamily: 'Avenir' }}>You Won!<Emoji name={'tada'} style={{ fontSize: 10 }} />Your money will be in your wallet by midnight</Text>
      );
    }
  }
};

const styles = {
  buttonStyle2: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#2b95ff',
    borderWidth: 2
  },
  buttonStyle: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    fontFamily: 'Avenir'
  }
};

export default PaymentButton;
