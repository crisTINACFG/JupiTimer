import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { supabase } from '../api/supabaseClient';

const Timers = ({ 
    session,
    selectedLabel, 
    labelsLength, 
    distractionCount, 
    setDistractionCount, 
    isRunning, 
    setIsRunning, 
    actualProductivity, 
    setActualProductivity,
    efficiency,
    setEfficiency,
    showEndPromps, 
    setShowEndPromps,
    elapsedTime, 
    setElapsedTime
    }) => {

    const [time, setTime] = useState(0);
    const [mode, setMode] = useState('stopwatch');
    const [startTime, setStartTime] = useState(new Date());
    const [timerDuration, setTimerDuration] = useState(25 * 60);
    const [modalVisible, setModalVisible] = useState(false);
    const [inputDuration, setInputDuration] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [label, setLabel] = useState('');  

    const [sessionEnd, setSessionEnd] = useState(false);

    const formatTime = (timeInSeconds, omitHours = false) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
    
        const paddedHours = hours.toString().padStart(2, '0');
        const paddedMinutes = minutes.toString().padStart(2, '0');
        const paddedSeconds = seconds.toString().padStart(2, '0');
    
        if (omitHours && hours === 0) {
            // Format the time as "MM:SS"
            return `${paddedMinutes}:${paddedSeconds}`;
        } else {
            // Format the time as "HH:MM:SS"
            return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
        }
    };

    const calculateElapsedTime = () => {
        const stopTime = new Date();
        // Check for startTime not being null
        if (startTime) {
            return Math.floor((stopTime - startTime) / 1000);
        }
        return 0;
    };

    
    useEffect(() => {
        setLabel(selectedLabel);
    },[selectedLabel]);

    useEffect(() => { //controls behaviour of the timers based on the users actions or mode. When the isRunning state is true 
        //(timer has been started), it sets up an interval that executes a function every 1000 milliseconds (1 second).
        // This function updates the time state to either count up (stopwatch mode) or count down ( timer ).
        
        let interval; //this interval ensures the UI is updated every sec to reflect the current time!!!
        if (isRunning) {
            interval = setInterval(() => {
                setTime(currentTime => {
                    if (currentTime <= 1 && mode === 'timer') { //if time remaining is 1 or less then stop the timer
                        clearInterval(interval);
                        handleStartStop();
                        return 0; // Stop the timer at zero
                    }
                    if (mode === 'stopwatch') {
                        return currentTime + 1;
                    } else {
                        return currentTime > 0 ? currentTime - 1 : 0; //if theres more than 0sec remaning on the timer remove -1 sec from currentTime
                    }
                });
            }, 1000);

        } else {  //if timer is not running, resets the interval and resets the time displayed to its initial value aka 0 for stopwatch
            //and timerDuration 
            clearInterval(interval);
            if (mode === 'timer') {
                setTime(timerDuration);
            } else {
                setTime(0);
            }
        }
        return () => clearInterval(interval); //cleanup function react calls when component unmounts or before re-running due to changes
        //in its dependencies, this cleanup prevents the interval from continuing to run or update state in an unmounted component.
    },[isRunning, mode, timerDuration, startTime]); //these are dependencies, if these change then the
    //effect re-runs to reflect the lastest state and props!!!
    

    const handleModeChange = newMode => {
        if (!isRunning) {
            setMode(newMode);
            if (newMode === 'stopwatch') {
                setTime(0);
            }
        }
    };

    const writeToDatabase = async (startTime, stopTime, elapsedTime, label, actualProductivity, distractionCount, efficiency) => {
        if (elapsedTime < 1) {
            // show an alert and return to prevent the database operation if time elapsed is less than a second.
            window.alert('Time elapsed too short.');
            return;
        }
   
        const hours = Math.floor(elapsedTime / 3600);
        const minutes = Math.floor((elapsedTime % 3600) / 60);
        const seconds = elapsedTime % 60;
        const formattedElapsedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
        const { data, error } = await supabase
            .from('studysession')
            .insert([
                {
                    id: session.user.id,
                    starttime: startTime.toISOString(),  
                    stoptime: stopTime.toISOString(),   
                    elapsedtime: formattedElapsedTime,  
                    label_text: label,
                    planet_type: 'Earth'  ,
                    actualproductivity: actualProductivity,
                    totaldistractions: distractionCount,
                    efficiency:efficiency
                }
            ]);
    
        if (error) {
            console.log('Error writing to database', error.message);
        }
    };
    
    const handleStartStop = () => {
        if (labelsLength > 0) {
            if (isRunning) { //if true then show elapsed time and write session to database.
                const elapsedTime = calculateElapsedTime();
                if (elapsedTime > 0) {
                    setElapsedTime(elapsedTime); 
                    setSessionEnd(true); 
                }else{
                    Alert.alert('Time elapsed too short, session not saved')
                }
            } else {
                // Start the timer by setting the startTime to the current time
                setStartTime(new Date()); // Reset the startTime when starting the timer
                setIsRunning(true);
            }
            // Toggle the running state
            setIsRunning(!isRunning); //changes the button to the opposite of what it is now 
        } else {
            Alert.alert("No labels", "Create a label before starting the timer.");
        }
    };

    const handleConfirmProductivity = () => {

        efficiency = actualProductivity - (100 - 2*  distractionCount) //think about a non-linear model instead
        setEfficiency(efficiency)
        setShowEndPromps(true);
        writeToDatabase(startTime, new Date(), elapsedTime, label, actualProductivity, distractionCount, efficiency);
        setSessionEnd(false); 
        setIsRunning(false); 
    };

    const handleTimeSet = () => {
        const newDuration = parseInt(inputDuration) * 60;  //turns the input from minutes to seconds
        if (!isNaN(newDuration) && newDuration > 0) {     
            setTimerDuration(newDuration);
            setTime(newDuration);
        }
        setModalVisible(false);
        setInputDuration('');
    };

    return (
        <View style={styles.container}>
            {/*Segmented control*/}
                <View style={styles.segmentedControl}>
                    <TouchableOpacity
                        style={[styles.button, mode === 'stopwatch' && styles.buttonActive]}
                        onPress={() => handleModeChange('stopwatch')}
                    >
                        <Text style={styles.buttonText}>S</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, mode === 'timer' && styles.buttonActive]}
                        onPress={() => handleModeChange('timer')}
                    >
                        <Text style={styles.buttonText}>T</Text>
                    </TouchableOpacity>
                </View>
    
                {
                    mode === 'stopwatch' 
                    ? ( 
                        <View style={styles.timerContainer}>
                            <Text style={styles.timer}>{formatTime(time)}</Text>
                        </View>
                    )
                    : mode === 'timer' 
                    ? ( 
                        <TouchableOpacity 
                            style={styles.timerContainer} 
                            onPress={() => !isRunning && setModalVisible(true)}
                        >
                            <Text style={styles.timer}>{formatTime(time, true)}</Text>
                        </TouchableOpacity>
                    )
                    : null
                }

                {/*Start/stop button*/}
                <TouchableOpacity style={styles.startButton} onPress={handleStartStop}>
                    <Text style={styles.startButtonText}>{isRunning ? 'Stop' : 'Start'}</Text>
                </TouchableOpacity>
            
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>

                        {/*exit button*/}
                        <TouchableOpacity style={styles.exitButton} onPress={() => setModalVisible(false)}> 
                            <Text style={styles.exitButtonText}>X</Text>
                        </TouchableOpacity>

                        <TextInput
                            style={[styles.input, isInputFocused ? styles.inputFocused : null]}
                            onChangeText={setInputDuration}
                            value={inputDuration}
                            keyboardType="numeric"
                            placeholder="Enter duration in minutes"
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleTimeSet}>
                            <Text style={styles.buttonText}>Set Time</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
            animationType="slide"
            transparent={true}
            visible={sessionEnd}
            onRequestClose={() => setSessionEnd(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.productivityModal}>
                        <Text style={styles.percentageText}>What percentage of your planned task did you complete?</Text>
                        <Text style={styles.percentage}>{actualProductivity}%</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={100}
                            step={1}
                            value={actualProductivity}
                            onValueChange={setActualProductivity}
                            minimumTrackTintColor="#886ef1"
                            maximumTrackTintColor="#d3d3d3"
                            thumbTintColor="#30137c"
                        />
                        <TouchableOpacity
                            style={styles.buttonConfirm}
                            onPress={handleConfirmProductivity} 
                        >
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
    },
    slider:{
        width: 290, 
        height: 40,
        color:'pink',
    },
    percentage:{
        fontSize: 16,
        position:'absolute',
        right:30,
        top:80,
    },
    percentageText:{
        marginLeft:10,
        fontSize:17,
    },
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
      },
    segmentedControl: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop:60,
    },
    button: {  //segmented control buttons
        padding: 13,
        marginHorizontal: 10,
        backgroundColor: '#7e65e5',
        borderRadius: 15,
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
    buttonConfirm: {  //segmented control buttons
        padding: 13,
        marginHorizontal: 10,
        backgroundColor: '#30137c',
        borderRadius: 15,
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
    buttonActive: {
        backgroundColor: '#30137c',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight:'bold',
    },
    timerContainer: {
        alignItems: 'center',
        marginTop: 540,
    },
    pomodoroTimer: {
        position:'relative',
        top:540,
        right:70,
    },
    breakTimer: {
        position:'relative',
        top:476,
        left:70,
    },
    timer: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'black',
    },
    startButton: {
        position: 'absolute',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#7e65e5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
        bottom:50,
        shadowColor: '#000',
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
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
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        padding: 25,
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
    productivityModal: {
        backgroundColor: 'white',
        padding: 10,
        paddingTop:30,
        height:220,
        shadowColor: '#000',
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 10,
        borderRadius: 10,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        width: 200,
        textAlign: 'center',
    },
    inputFocused: {
        borderColor: 'black',
        borderWidth: 2,
    },
    exitButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    exitButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    timerWrapper: {
        paddingTop: 0, 
    },
    
});

export default Timers;