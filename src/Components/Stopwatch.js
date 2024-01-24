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

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTime(prevTime => {
                    if (mode === 'stopwatch') {
                        return prevTime + 1;
                    } else if (mode === 'timer') {
                        return prevTime > 0 ? prevTime - 1 : 0;
                    } else if (mode === 'pomodoro') {
                        return prevTime > 0 ? prevTime - 1 : 0;
                    }
                    return prevTime;
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
    }, [isRunning, mode, timerDuration, pomodoroDuration]);

    const handleModeChange = newMode => {
        setMode(newMode);
        if (newMode === 'stopwatch') {
            setTime(0);
        }
    };

    const handleStartStop = () => {
        if (isRunning) {
            const now = new Date();
            const elapsedTime = (now - startTime) / 1000;
            Alert.alert('Time Elapsed', `Elapsed time: ${formatTime(elapsedTime)}`);
        } else {
            const now = new Date();
            setStartTime(now);
        }
        setIsRunning(!isRunning);
    };

    const formatTime = time => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enabled
        >
            <View style={styles.container}>
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
    
                <TouchableOpacity style={styles.timerContainer} onPress={() => setModalVisible(true)}>
                    <Text style={styles.timer}>{formatTime(time)}</Text>
                </TouchableOpacity>
    
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
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 25,
        backgroundColor: '#fff',
    },
    segmentedControl: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 50,
    },
    button: {
        padding: 10,
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
        marginVertical: 30,
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
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
});

export default Stopwatch;
