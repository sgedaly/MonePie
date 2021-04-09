import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import Profile from './screens/Profile';
import EditProfile from './screens/EditProfile';

const ProfNav = new createStackNavigator({
    EditProfile: {
        screen: EditProfile,
        navigationOptions: {
            header: null
        },
    },
});
export default ProfNav;