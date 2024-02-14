import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Platform, Modal } from 'react-native';
import { supabase } from '../api/supabaseClient';

const Timers = ({ session }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [mode, setMode] = useState('stopwatch');
    const [startTime, setStartTime] = useState(null);
    const [timerDuration, setTimerDuration] = useState(25 * 60);
    const [modalVisible, setModalVisible] = useState(false);
    const [inputDuration, setInputDuration] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [label, setLabel] = useState('');

    const [pomodoroDuration, setPomodoroDuration] = useState(25 * 60);
    const [breakDuration, setBreakDuration] = useState(5*60);
    const [isBreak, setIsBreak] = useState(false);

    const handlePomodoroTimer = () => {

    };

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

    const showElapsedTime = () => { //this function displays the time elapsed
        const elapsedTime = calculateElapsedTime()
        window.alert(`Time Elapsed: ${formatTime(elapsedTime)}`);
    };

    const calculateElapsedTime = () => { //calculates the time elapsed based on the mode
        const stopTime = new Date();
        if (mode === 'stopwatch') {
            return Math.floor((stopTime - startTime) / 1000);
        }
        if (mode === 'timer'){
            return Math.floor((stopTime - startTime) / 1000);
        }
        else {
            return Math.floor((stopTime - startTime) / 1000); //this is temporary for pomodoro!!
        }
    };
    
    useEffect(() => { //controls behaviour of the timers based on the users actions or mode. When the isRunning state is true 
        //(timer has been started), it sets up an interval that executes a function every 1000 milliseconds (1 second).
        // This function updates the time state to either count up (stopwatch mode) or count down ( timer and pomodoro modes).
        
        let interval; //this interval ensures the UI is updated every sec to reflect the current time!!!
        if (isRunning) {
            interval = setInterval(() => {
                setTime(currentTime => {
                    if (currentTime <= 1 && (mode === 'timer' || mode === 'pomodoro')) { //if time remaining is 1 or less then stop the timer
                        clearInterval(interval);
                        setIsRunning(false);
                        showElapsedTime();
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
            //and timerDuration and pomodoroDuration 
            clearInterval(interval);
            if (mode === 'timer') {
                setTime(timerDuration);
            } else if (mode === 'pomodoro') {
                setTime(pomodoroDuration);
            } else if (mode === 'stopwatch') {
                setTime(0);
            }
        }
        return () => clearInterval(interval); //cleanup function react calls when component unmounts or before re-running due to changes
        //in its dependencies, this cleanup prevents the interval from continuing to run or update state in an unmounted component.
    }, [isRunning, mode, timerDuration, pomodoroDuration, showElapsedTime, startTime]); //these are dependencies, if these change then the
    //effect re-runs to reflect the lastest state and props!!!
    

    const handleModeChange = newMode => {
        if (!isRunning) {
            setMode(newMode);
            if (newMode === 'stopwatch') {
                setTime(0);
            }
        }
    };

    const writeToDatabase = async (startTime, stopTime, elapsedTime, label) => {
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
                    label: 'temporary',
                    planet_type: 'Earth'  
                }
            ]);
    
        if (error) {
            console.log('Error writing to database', error.message);
        }
    };
    
    const handleStartStop = () => {
        if (isRunning) { //if true then show elapsed time and write session to database.
            showElapsedTime(); 
            const elapsedTime = calculateElapsedTime();
            writeToDatabase(startTime, new Date(), elapsedTime, label);
        } else {
            // Start the timer by setting the startTime to the current time
            setStartTime(new Date());
        }
        // Toggle the running state
        setIsRunning(!isRunning);   //changes the button to the opposite of what it is now
    };

    const handleTimeSet = () => {
        const newDuration = parseInt(inputDuration) * 60;  //turns the input from minutes to seconds
        if (!isNaN(newDuration) && newDuration > 0) {      //checks if Not a Number and > than 0. This ensures input provided is a valid, positive number.
            if (mode === 'timer') {
                setTimerDuration(newDuration);
                setTime(newDuration);
            } else if (mode === 'pomodoro' && !isBreak) { //study timer
                setPomodoroDuration(newDuration);
                setTime(newDuration);
            } else if (mode === 'pomodoro' && isBreak) { //break timer
                setBreakDuration(newDuration);
                setTime(newDuration);
            }
        }
        setModalVisible(false);
        setIsBreak(false);
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
                    <TouchableOpacity
                        style={[styles.button, mode === 'pomodoro' && styles.buttonActive]}
                        onPress={() => handleModeChange('pomodoro')}
                    >
                        <Text style={styles.buttonText}>P</Text>
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
                    : mode === 'pomodoro'
                    ? (
                        <>
                        <View //line between two timers
                        style={{
                        backgroundColor: 'black', 
                        width: 4,         
                        height: 40,
                        position:'absolute',
                        bottom:122,
                        borderRadius:3,
                        }}
                        />
                            <TouchableOpacity //study time
                                style={styles.pomodoroTimer} 
                                onPress={() => !isRunning && setModalVisible(true)}
                            >
                                <Text style={styles.timer}>{formatTime(time, true)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity //break time
                                style={styles.breakTimer} 
                                onPress={() => {
                                    if (!isRunning) {
                                        setIsBreak(true);
                                        setModalVisible(true);
                                    }
                                }}
                            >
                                <Text style={styles.timer}>{formatTime(breakDuration, true)}</Text>
                            </TouchableOpacity>
                        </>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    segmentedControl: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop:60,
    },
    button: {  //segmented control buttons
        padding: 13,
        marginHorizontal: 10,
        backgroundColor: '#DDD',
        borderRadius: 5,
    },
    buttonActive: {
        backgroundColor: '#AAA',
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
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
        backgroundColor: 'blue',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
        bottom:50,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
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