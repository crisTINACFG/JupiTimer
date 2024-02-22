import React from 'react';
import { TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Iconify } from 'react-native-iconify';

const MenuButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.toggleDrawer() //this opens the drawers with all of my other screens
      }
      style={{ marginLeft: 10, }}
    >
      <Iconify icon="streamline:planet-solid" size={24} color="#30137c" />
    </TouchableOpacity>
  );
};

export default MenuButton;
