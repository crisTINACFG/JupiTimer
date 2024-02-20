import MenuButton from "../Components/MenuButton";
import { View, StyleSheet } from 'react-native';

export default function Leaderboard () {
    return(
        <View style={styles.container}>
            <View style={styles.menu}>
                <MenuButton/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    menu:{
        position:'absolute',
        left: 0,
        top: 15,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});