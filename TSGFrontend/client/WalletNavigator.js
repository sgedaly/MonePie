import { createStackNavigator } from 'react-navigation';
import TransferToBank from './screens/TransferToBank';
import TransferConfirmation from './screens/TransferConfirmation';

const WalletNavigator = new createStackNavigator({
    // JoinGames: {
    //     screen: JoinGames,
    //     navigationOptions: {
    //         header: null
    //     },
    // },
    TransferToBank: {
        screen: TransferToBank,
        navigationOptions: {
            header: null
        },
    },
    TransferConfirmation: {
        screen: TransferConfirmation,
        navigationOptions: {
            header: null,
            gesturesEnabled: false,
        },
    },
}, {
        navigationOptions: {
            gesturesEnabled: false
        }
    })

export default WalletNavigator;