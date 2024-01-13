import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';

const Stopwatch = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [mode, setMode] = useState('stopwatch'); // 'stopwatch', 'timer', 'pomodoro'
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
                        return prevTime > 0 ? prevTime - 1 : 0; // Stop the timer at 0
                    } else if (mode === 'pomodoro') {
                        return prevTime > 0 ? prevTime - 1 : 0; // Stop the Pomodoro at 0, switch to break here if needed
                    }
                    return prevTime;
                });
            }, 1000);
        } else if (!isRunning && mode === 'timer') {
            setTime(timerDuration); // Reset timer when stopped
        } else if (!isRunning && mode === 'pomodoro') {
            setTime(pomodoroDuration); // Reset Pomodoro when stopped
        }
        return () => clearInterval(interval);
    }, [isRunning, mode, timerDuration, pomodoroDuration]);

    const handleStartStop = () => {
        if (!isRunning) {
            // If the timer or Pomodoro is not running, reset the time to the initial duration
            if (mode === 'timer') {
                setTime(timerDuration);
            } else if (mode === 'pomodoro') {
                setTime(pomodoroDuration);
            }
        }
        setIsRunning(!isRunning); // Start or stop the timer or Pomodoro
    };

    // Format the time to display
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
                    onPress={() => setMode('stopwatch')}
                >
                    <Text style={styles.buttonText}>S</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, mode === 'timer' && styles.buttonActive]}
                    onPress={() => setMode('timer')}
                >
                    <Text style={styles.buttonText}>T</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, mode === 'pomodoro' && styles.buttonActive]}
                    onPress={() => setMode('pomodoro')}
                >
                    <Text style={styles.buttonText}>P</Text>
                </TouchableOpacity>
            </View>

            {/* Timer Display */}
            <View style={styles.timerContainer}>
                <Text style={styles.timer}>
                    {new Date(time * 1000).toISOString().substr(11, 8)}
                </Text>
            </View>

            {/* Start/Stop Button */}
            <TouchableOpacity
                style={styles.startButton}
                onPress={() => setIsRunning(!isRunning)}
            >
                <Text style={styles.startButtonText}>{isRunning ? 'Stop' : 'Start'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // The container takes up the whole screen
        justifyContent: 'space-around', // Distribute children evenly, including the first and last children
        alignItems: 'center', // Center children horizontally
        paddingTop: Platform.OS === 'android' ? 25 : 0, // Avoid overlapping the status bar on Android
        backgroundColor: '#fff', // White background color
    },
    segmentedControl: {
        flexDirection: 'row', // Align children in a row
        justifyContent: 'center', // Center children horizontally
        marginTop: 50, // Add space from the top
    },
    button: {
        padding: 10, // Add padding inside the buttons
        marginHorizontal: 10, // Add horizontal space between buttons
        backgroundColor: '#DDD', // Light grey background color
        borderRadius: 5, // Round the corners of the buttons
    },
    buttonActive: {
        backgroundColor: '#AAA', // Darker grey background color for active button
    },
    buttonText: {
        color: 'black', // Black text color
        fontSize: 18, // Medium text size
    },
    timerContainer: {
        alignItems: 'center', // Center timer text horizontally
        marginVertical: 30, // Add vertical space above and below the timer text
    },
    timer: {
        fontSize: 48, // Large text size for the timer
        fontWeight: 'bold', // Bold font weight for the timer
        color: 'black', // Black text color
    },
    startButton: {
        paddingVertical: 10, // Vertical padding inside the start button
        paddingHorizontal: 20, // Horizontal padding inside the start button
        backgroundColor: 'blue', // Blue background color
        borderRadius: 10, // Round the corners of the button
        borderWidth: 1, // Width of the border around the button
        borderColor: 'white', // White border color
    },
    startButtonText: {
        color: 'white', // White text color
        fontSize: 18, // Medium text size
        textAlign: 'center', // Center text horizontally
    },
});

export default Stopwatch;
