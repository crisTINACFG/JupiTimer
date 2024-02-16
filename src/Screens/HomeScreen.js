import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, TextInput, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';
import Timers from '../Components/Timers';
import SettingsScreen from './settingsScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../api/supabaseClient'; 

export default function HomeScreen({ session }) {
    const [settingsToggle, setSettingsToggle] = useState(false);
    const [labels, setLabels] = useState([]);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newLabelName, setNewLabelName] = useState('');
    const [isProductive, setIsProductive] = useState(false);

    const [labelIdToUserIdMap, setLabelIdToUserIdMap] = useState({});

    const currentLabel = labels.find(label => label.id === selectedLabel);

    useEffect(() => {
        let mounted = true;
      
        const subscription = supabase
          .channel('room1')
          .on('postgres_changes', { 
              event: '*', 
              schema: 'public', 
              table: 'labels'}, 
              payload => {
                if (!mounted) {
                  return;
                }
                console.log('Change received!', payload);
                if (payload.eventType === 'DELETE') {
                  // Check if the deleted label's ID is mapped to the current user's ID
                  if (labelIdToUserIdMap[payload.old.id] === session.user.id) {
                      fetchLabels();
                  }
                } else {
                  // For non-DELETE events, check if the user ID matches the current session's user ID
                  const relevantChange = payload.new?.user_id === session.user.id || payload.old?.user_id === session.user.id;
                  if (relevantChange) {
                      fetchLabels();
                  }
                }
              })
          .subscribe();
      
        fetchLabels(); // Initial fetch
      
        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      }, [session.user.id, labelIdToUserIdMap]);      

    async function fetchLabels() {
        const { data, error } = await supabase
        .from('labels')
        .select('id, user_id, label_text, is_productive')
        .eq('user_id', session.user.id)

        if (error) {
            console.error('Error fetching labels:', error);
          }
        else {
            setLabels(data);
            // Update the label ID to user ID mapping in order to check for real_time deletes
            const newMap = data.reduce((map, label) => {
                map[label.id] = label.user_id;
                return map;
            }, {});
            setLabelIdToUserIdMap(newMap);

            if (data.length > 0) {
                setSelectedLabel(data[0].id);
            }
        }
    }

    const handleToggleSettings = () => {
        setSettingsToggle(!settingsToggle);
    };

    const addNewLabel = async () => {
        try {
            if (!session?.user) throw new Error('No user on the session!');

            const newLabel = {
                user_id: session.user.id,
                label_text: newLabelName,
                is_productive: isProductive
            };

            let { error } = await supabase
                .from('labels')
                .insert([newLabel]);

            if (error) {
                throw error;
            } else {
                await fetchLabels(); // Ensures labels are fetched before continuing
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message);
            }
        } finally {
            setNewLabelName('');
            setShowModal(false);
        }
    };

    return (
        <View style={styles.container}>

            <View style = {styles.picker}>
            <Picker
                selectedValue={selectedLabel}
                onValueChange={(itemValue, itemIndex) => {
                    if (itemValue === 'new') {
                        setShowModal(true);
                    } else {
                        setSelectedLabel(itemValue);
                    }
                }}
            >
                {labels.length === 0 && (
                    <Picker.Item label="No labels available" value="null" enabled={false} />
                )}
                {labels.map((label, index) => (
                    <Picker.Item key={index} label={label.label_text} value={label.id} />
                ))}
                <Picker.Item label="Add new label..." value="new" />
            </Picker>
            </View>

            <Modal
                visible={showModal}
                transparent={true}
                onRequestClose={() => {
                    setShowModal(false);
                    setNewLabelName(''); 
                }}
                animationType="slide">

                <TouchableOpacity
                    style={styles.centeredView}
                    activeOpacity={1}
                    onPressOut={() => {
                        setShowModal(false);
                        setNewLabelName('');
                    }}>
                    <View
                        style={styles.modalView}
                        onStartShouldSetResponder={() => true} // This prevents touch events from bubbling up to the parent TouchableOpacity
                    >
                        <TextInput
                            placeholder="Label Name"
                            value={newLabelName}
                            onChangeText={setNewLabelName}
                            style={styles.input}
                        />
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                value={isProductive}
                                onValueChange={setIsProductive}
                            />
                            <Text>Is Productive?</Text>
                        </View>
                        <TouchableOpacity onPress={addNewLabel} style={styles.button}>
                            <Text>Add Label</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Timers session={session} selectedLabel={currentLabel ? currentLabel.label_text : ''} labelsLength ={labels.length} />


            <TouchableOpacity onPress={handleToggleSettings} style={styles.settingsButton}>
                <Icon name="cog" size={24} color="#000" />
            </TouchableOpacity>

            {settingsToggle && (
                <SettingsScreen session={session} onToggleSettings={handleToggleSettings} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    settingsButton: {
        position: 'absolute',
        top: 4,
        right: 2,
        padding: 7,
        borderRadius: 5,
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        margin: 10,
        width: '100%',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        backgroundColor: 'lightblue',
        padding: 10,
        marginTop: 10,
    },
    picker: {
        position: 'absolute',
        bottom: 170, 
        backgroundColor: 'lightgrey', 
        borderRadius:100,
        width: '50%', 
    },
    modalView: {
        backgroundColor: 'white',
        paddingVertical:30,
        paddingHorizontal:100,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 10,
        position: 'absolute', 
        borderRadius: 10,
        
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute', 
        top: 0, 
        left: 0,
        right: 0,
        bottom: 0,
    },
});