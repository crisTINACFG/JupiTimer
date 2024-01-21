import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';

const Stopwatch = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [mode, setMode] = useState('stopwatch'); // 'stopwatch', 'timer', 'pomodoro'
    const [startTime, setStartTime] = useState(null);
    const [stopTime, setStopTime] = useState(null);
    const [timerDuration, setTimerDuration] = useState(25 * 60); // For the timer, 25 minutes as an example
    const [pomodoroDuration, setPomodoroDuration] = useState(25 * 60); // For Pomodoro, 25 minutes work session as an example

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTime((prevTime) => {
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

    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (newMode === 'stopwatch') {
            setTime(0);
        }
    };

    const handleStartStop = () => {
        if (isRunning) {
            // Stop the stopwatch
            const now = new Date();
            setStopTime(now);
            const elapsedTime = (now - startTime) / 1000; // Elapsed time in seconds
            Alert.alert('Time Elapsed', `Elapsed time: ${formatTime(elapsedTime)}`);
        } else {
            // Start the stopwatch
            const now = new Date();
            setStartTime(now);
            setStopTime(null);
        }
        setIsRunning(!isRunning);
    };

    const formatTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            {/* Segmented Control */}
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

            {/* Timer Display */}
            <View style={styles.timerContainer}>
                <Text style={styles.timer}>
                    {formatTime(time)}
                </Text>
            </View>

            {/* Start/Stop Button */}
            <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartStop}
            >
                <Text style={styles.startButtonText}>{isRunning ? 'Stop' : 'Start'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 25 : 0,
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
});

export default Stopwatch;
