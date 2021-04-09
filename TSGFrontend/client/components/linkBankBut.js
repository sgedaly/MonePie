import React from 'react';
import { Button, Text, View } from 'native-base';

const LinkBankBut = (props) => {
  if (props.enabled) {
    return (
      <Button
        style={styles.buttonStyle}
        rounded
        light
        small
      >
        <Text>Add</Text>
      </Button>
    );
  } else {
    return (
      <View></View>
    );
  }
};

const styles = {
  buttonStyle: {
    alignSelf: 'stretch',

    flexDirection: 'column',
    justifyContent: 'center',

    alignItems: 'center',

    borderColor: '#3cb371',
    borderWidth: 1
  }
};

export default LinkBankBut;