import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import JoinGames from './screens/JoinGames';
import JoinPublicGame from './screens/JoinPublicGame';
import JoinPrivateGame from './screens/JoinPrivateGame';
import GameRoom from './screens/GameRoom';
import GameRoomTest from './screens/GameRoomTest';
import WithdrawFromGame from './screens/WithdrawFromGame';

const GamesStackNavigator = new createStackNavigator({
    // JoinGames: {
    //     screen: JoinGames,
    //     navigationOptions: {
    //         header: null
    //     },
    // },
    JoinPublicGame: {
        screen: JoinPublicGame,
        navigationOptions: {
            header: null,
            gesturesEnabled: false,
        },
    },
    JoinPrivateGame: {
        screen: JoinPrivateGame,
        navigationOptions: {
            header: null
        },
    },
    GameRoom: {
        screen: GameRoom,
        navigationOptions: {
            header: null,
            gesturesEnabled: false,
        },
    },
    GameRoomTest: {
        screen: GameRoomTest,
        navigationOptions: {
            header: null,
            gesturesEnabled: false,
        },
    },
    WithdrawFromGame: {
        screen: WithdrawFromGame,
        navigationOptions: {
            header: null
        },
    },
}, {
        navigationOptions: {
            gesturesEnabled: false
        }
    })

export default GamesStackNavigator;