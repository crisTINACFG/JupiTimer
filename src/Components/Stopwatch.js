import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';

const Stopwatch = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [mode, setMode] = useState('stopwatch');
    const [startTime, setStartTime] = useState(null);
    const [timerDuration, setTimerDuration] = useState(25 * 60);
    const [pomodoroDuration, setPomodoroDuration] = useState(25 * 60);
    const [modalVisible, setModalVisible] = useState(false);
    const [inputDuration, setInputDuration] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);

    const showElapsedTime = () => {
        const now = new Date();
        const elapsedTime = Math.floor((now - startTime) / 1000);
        window.alert(`Time Elapsed: ${formatTime(elapsedTime)}`);
    };
    
    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTime(prevTime => {
                    if (prevTime <= 1 && (mode === 'timer' || mode === 'pomodoro')) {
                        clearInterval(interval);
                        setIsRunning(false);
                        showElapsedTime();
                        return 0; // Stop the timer at zero
                    }
                    if (mode === 'stopwatch') {
                        return prevTime + 1;
                    } else {
                        return prevTime > 0 ? prevTime - 1 : 0;
                    }
                });
            }, 1000);
        } else {
            clearInterval(interval);
            if (mode === 'timer') {
                setTime(timerDuration);
            } else if (mode === 'pomodoro') {
                setTime(pomodoroDuration);
            } else if (mode === 'stopwatch') {
                setTime(0);
            }
        }
        return () => clearInterval(interval);
    }, [isRunning, mode, timerDuration, pomodoroDuration, showElapsedTime, startTime]);
    

    const handleModeChange = newMode => {
        if (!isRunning) {
            setMode(newMode);
            if (newMode === 'stopwatch') {
                setTime(0);
            }
        }
    };

    const handleStartStop = () => {
        if (isRunning) {
            const now = new Date();
            const elapsedTime = Math.floor((now - startTime) / 1000);
            window.alert(`Time Elapsed: ${formatTime(elapsedTime)}`);
        } else {
            const now = new Date();
            setStartTime(now);
        }
        setIsRunning(!isRunning);
    };

    const formatTime = time => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };    

    const handleTimeSet = () => {
        const newDuration = parseInt(inputDuration) * 60;
        if (!isNaN(newDuration) && newDuration > 0) {
            if (mode === 'timer') {
                setTimerDuration(newDuration);
                setTime(newDuration);
            } else if (mode === 'pomodoro') {
                setPomodoroDuration(newDuration);
                setTime(newDuration);
            }
        }
        setModalVisible(false);
        setInputDuration('');
    };

    return (
        <View
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enabled
        >
            {/*Segmented control*/}
            <View style={styles.container} >     
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
    
                { //timer display
                    mode === 'stopwatch' ? (
                        <View style={styles.timerContainer}>
                            <Text style={styles.timer}>{formatTime(time)}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={styles.timerContainer} 
                            onPress={() => !isRunning && setModalVisible(true)}
                        >
                            <Text style={styles.timer}>{formatTime(time)}</Text>
                        </TouchableOpacity>
                    )
                }
                {/*Start/stop button*/}
                <TouchableOpacity style={styles.startButton} onPress={handleStartStop}>
                    <Text style={styles.startButtonText}>{isRunning ? 'Stop' : 'Start'}</Text>
                </TouchableOpacity>
            </View>
    
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
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
        backgroundColor: '#fff',
    },
    segmentedControl: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop:20,
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
        marginTop: 500,
    },
    timer: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'black',
    },
    startButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'blue',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
        marginTop: 30,
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

export default Stopwatch;
