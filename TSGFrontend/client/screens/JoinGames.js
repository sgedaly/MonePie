import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Container } from 'native-base';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';



export default class JoinGames extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accountBalance: "",
      historicalSavings: "",
      monthlySavings: "",
      moneyInPlay: "",
      user: this.props.navigation.state.params.user
    }
  }

  render() {
    return (
      <Container style={styles.outContainer}>
        <Header
          leftComponent={<TouchableOpacity style={styles.icons}>
            <SimpleLineIcons name='arrow-left' color='#3cb371' size={20} onPress={() => this.props.navigation.navigate("HomeScreen")} />
          </TouchableOpacity>}
          centerComponent={<Text style={styles.navItemStyle}>Join Games!</Text>}
          outerContainerStyles={{ backgroundColor: 'white', height: 88, marginBottom: 5 }}
        />
        <TouchableOpacity onPress={() => this.props.navigation.navigate('JoinPublicGame', { user: this.state.user })} style={styles.options}>
          <SimpleLineIcons name='globe' color='#3cb371' size={28} />
          <Text style={styles.navItemStyle2}>Join open games</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.navigation.navigate('JoinPrivateGame1', { user: this.state.user })} style={styles.options}>
          <SimpleLineIcons name='people' color='#3cb371' size={28} />
          <Text style={styles.navItemStyle2}>Create games with friends</Text>
        </TouchableOpacity>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  outContainer: {
    backgroundColor: 'white',
  },
  icons: {
    marginLeft: 0,
    marginBottom: 0
  },
  navItemStyle: {
    fontSize: 18
  },
  navItemStyle2: {
    paddingLeft: 20
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
  nav: {
    paddingLeft: 103,
    fontSize: 18
  }
});