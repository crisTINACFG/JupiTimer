import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, TextInput, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';
import Timers from '../Components/Timers';
import { supabase } from '../api/supabaseClient'; 
import MenuButton from '../Components/MenuButton';

export default function HomeScreen({ route }) {
    const { session } = route.params; //parameters for authentication or user id

    const [labels, setLabels] = useState([]);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newLabelName, setNewLabelName] = useState('');
    const [isProductive, setIsProductive] = useState(false);
    const initialFetch = useRef(true);
    const [distractionCount, setDistractionCount] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showEndPromps, setShowEndPromps] = useState(false);
    const [actualProductivity, setActualProductivity] = useState(0);
    const [efficiency, setEfficiency] = useState(0);
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
                if (payload.eventType === 'DELETE') {
                  //checking if the deleted label id is mapped to the current user id
                  if (labelIdToUserIdMap[payload.old.id] === session.user.id) {
                      fetchLabels();
                  }
                } else {
                  //for non DELETE events check if the user id matches the current session user id
                  const relevantChange = payload.new?.user_id === session.user.id || payload.old?.user_id === session.user.id;
                  if (relevantChange) {
                      fetchLabels();
                  }
                }
              })
          .subscribe();
      
        fetchLabels(); //initial fetch
      
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
            //update the label id to user id mapping in order to check for real time deletes
            const newMap = data.reduce((map, label) => {
                map[label.id] = label.user_id;
                return map;
            }, {});
            setLabelIdToUserIdMap(newMap);

            if (initialFetch.current && data.length > 0) {
                setSelectedLabel(data[0].id);
                initialFetch.current = false;
            }
        }
    }

    const formatTime = (timeInSeconds, omitHours = false) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
    
        const paddedHours = hours.toString().padStart(2, '0');
        const paddedMinutes = minutes.toString().padStart(2, '0');
        const paddedSeconds = seconds.toString().padStart(2, '0');
    
        if (omitHours && hours === 0) {
            //"MM:SS"
            return `${paddedMinutes}:${paddedSeconds}`;
        } else {
            //"HH:MM:SS"
            return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
        }
    };

    const addNewLabel = async () => {
        if (!newLabelName.trim()) {
            //if newLabelName is empty or whitespace, display an alert and return 
            Alert.alert("Label name is required", "Please enter a label name before adding.");
            return; 
        }
    
        try {
            if (!session?.user) throw new Error('No user on the session!');
    
            const newLabel = {
                user_id: session.user.id,
                label_text: newLabelName.trim(),
                is_productive: isProductive
            };
    
            let { error } = await supabase
                .from('labels')
                .insert([newLabel]);
    
            if (error) {
                throw error;
            } else {
                await fetchLabels(); //ensures labels fetched before continuing
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message);
            }
        } finally {
            setNewLabelName('');
            setIsProductive(false);
            setShowModal(false); //resets values to their original states
        }
    };

    const handleDistractionCounter = () => { 
        setDistractionCount(distractionCount + 1);
        //this is a little bit redundant but it makes my return cleaner
    };

    return (
        <View style={styles.container}>
            {/*Menu Button*/}
            <View style={styles.menu}>
                <MenuButton/>
            </View>

            { //only render picker if timer is not running
            !isRunning && ( 
                <View style = {styles.picker}>
                    <Picker
                        selectedValue={selectedLabel}
                        onValueChange={(itemValue) => {
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
            )}

            { //Distraction counter button only rendered if isRunning
            isRunning && ( 
                    <TouchableOpacity 
                    style={styles.distraction}
                    onPress = {handleDistractionCounter}>
                        <Text style={styles.distractionText}>
                        {distractionCount > 0 ? distractionCount : ''}
                        </Text>
                    </TouchableOpacity>
            )}

            <Modal //modal for creating new label
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
                        onStartShouldSetResponder={() => true} 
                    >
                        <TextInput
                            label='Enter Label Name' //this is not working for some reason?
                            placeholder="Label Name e.g. Mathematics"
                            value={newLabelName}
                            onChangeText={setNewLabelName}
                            style={styles.input}
                        />
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                value={isProductive}
                                onValueChange={setIsProductive}
                                tintColors={{ true: '#30137c', false: '#7e65e5' }}
                            />
                            <Text>Is Productive?</Text>
                        </View>
                        <TouchableOpacity onPress={addNewLabel} style={styles.addLabelButton}>
                            <Text style={styles.endText} >Add Label</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
           
            <Modal //modal for the end statistics 
            visible={showEndPromps}
            transparent={true}
            onRequestClose={() => {
                setShowEndPromps(false);
            }}
            animationType="slide">

                <TouchableOpacity
                    style={styles.centeredView}
                    activeOpacity={1}
                    onPressOut={() => {[ 
                        setDistractionCount(0),
                        setShowEndPromps(false)];
                    }}>
                   <View style={styles.endView} onStartShouldSetResponder={() => true}>
                        <Text style={styles.endText}>Time elapsed: {formatTime(elapsedTime)}</Text>
                        <Text style={styles.endText}>Distractions: {distractionCount}</Text>
                        <Text style={styles.endText}>Productivity: {actualProductivity}%</Text>
                        {efficiency !== 0 && (
                        <Text style={styles.endText}>
                            You were {efficiency > 0 ? `${efficiency}% more` : `${Math.abs(efficiency)}% less`} efficient than predicted
                        </Text>
                        )}
                   </View>
                </TouchableOpacity>

            </Modal>
            
            <Timers //passes a bunch of props down to child component (Timers.js)
            elapsedTime={elapsedTime} 
            setElapsedTime={setElapsedTime}
            showEndPromps={showEndPromps}
            setShowEndPromps={setShowEndPromps}
            efficiency={efficiency}
            setEfficiency={setEfficiency}
            actualProductivity={actualProductivity}
            setActualProductivity={setActualProductivity}
            isRunning={isRunning} 
            setIsRunning={setIsRunning}
            distractionCount={distractionCount} 
            setDistractionCount={setDistractionCount}
            session={session} 
            selectedLabel={currentLabel ? currentLabel.label_text : ''} 
            labelsLength ={labels.length} 
            />

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
    menu:{
        position:'absolute',
        left: 0,
        top: 15,
    },
    endView:{
        backgroundColor: '#7e65e5',
        padding:15,
        paddingHorizontal:35,
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
    endText:{
        fontSize:15,
        color:'white',
    },
    distractionPromt:{
        flex:1,
    },
    distraction: {
        width: 50, 
        height: 50,
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor:'#30137c',
        position:'absolute',
        right: 100,
        bottom:49,
        borderRadius:40,
        borderWidth: 1,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    distractionText: {
        color: 'white',
        fontWeight:'bold',
        fontSize:15,
    },
    modalContent: {
        flex: 1,
        justifyContent: 'left',
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
        position:'absolute',
        left:20,
        top: 85,
    },
    button: {
        backgroundColor: '#F9B9CF',
        position:'absolute',
        padding: 8,
        right:44,
        top: 72,
        marginTop: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    addLabelButton:{
        backgroundColor:'#7e65e5',
        position:'absolute',
        padding: 7,
        right:44,
        top: 75,
        marginTop: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
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
        padding:15,
        height:150,
        width:300,
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