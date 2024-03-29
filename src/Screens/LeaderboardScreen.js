import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../api/supabaseClient';
import MenuButton from "../Components/MenuButton";

export default function Leaderboard( { route }) {
    const { session } = route.params;
    const [leaderboardData, setLeaderboardData] = useState([]);

    useEffect(() => {
        fetchLeaderboardData();
    }, []);

    useEffect(() => {
        //supabase real-time subscription
        //this listens to the table studysession and provides me with the changed data in payload
        //on payload receive, fetch the data again to get the new table
        const subscription = supabase
          .channel('studysession') 
          .on('*', payload => { fetchLeaderboardData();})
          .subscribe();
    
        return () => {
          subscription.unsubscribe(); //unsubscriping to prevent memory leaks
        };
      }, [session.user.id]); 

    const fetchLeaderboardData = async () => {
        try {
            //fetching elapsed time data
            let { data: sessionData, error: sessionError } = await supabase
                .from('studysession')
                .select('id, elapsedtime');
            if (sessionError) throw sessionError;

            //fetching usernames
            let { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('id, username');
            if (userError) throw userError;

            //creating a map for userId to username
            const userIdToUsernameMap = userData.reduce((acc, user) => {
                acc[user.id] = user.username;
                return acc;
            }, {});

            //aggregating session data by userId
            const aggregatedData = sessionData.reduce((acc, session) => {
                const { id, elapsedtime } = session;
                if (!acc[id]) {
                    acc[id] = { totalelapsedtime: 0 };
                }
                acc[id].totalelapsedtime += parseToSeconds(elapsedtime); 
                return acc;
            }, {});

            //creating leaderboard array with usernames
            const leaderboardArray = Object.keys(aggregatedData).map((userId) => {
                const totalSeconds = aggregatedData[userId].totalelapsedtime;
                const formattedTime = formatelapsedtime(totalSeconds);
                return {
                    id: userId,
                    username: userIdToUsernameMap[userId] || 'Unknown', //'Unknown' if no username found
                    formattedTime,
                };
            }).sort((a, b) => b.formattedTime.localeCompare(a.formattedTime));

            setLeaderboardData(leaderboardArray);
        } catch (error) {
            console.error(error.message);
        }
    };

    
    //function to parse "HH:MM:SS" string to total seconds
    function parseToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }
    
    //function to convert elapsed time in seconds to dd:hh:mm:ss format
    function formatelapsedtime(totalSeconds) {
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
    
        let timeString = '';
    
        if (days > 0) {
            timeString += `${days} days `;
        }
        if (hours > 0 || (days > 0 && (minutes > 0 || seconds > 0))) {
            timeString += `${hours} hr `;
        }
        if (minutes > 0 || (hours > 0 && seconds > 0) || (days > 0 && seconds > 0)) {
            timeString += `${minutes} min `;
        }
        if (seconds > 0 || totalSeconds < 60) {
            timeString += `${seconds} sec`;
        }
    
        return timeString.trim();   
    }

    return (
        <View style={styles.container}>
            <View style={styles.menu}>
                <MenuButton/>
            </View>
            <View style={styles.headerRow}>
                <Text style={styles.headerText}>Username</Text>
                <Text style={styles.headerText}>Total Time</Text>
            </View>
            <ScrollView style={styles.leaderboardList}>
                {leaderboardData.map((user, index) => (
                    <View key={index} style={styles.userRow}>
                        <Text> {user.username}</Text>
                        <Text> {user.formattedTime}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    menu: {
        position: 'absolute',
        left: 0,
        top: 15,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    leaderboardList: {
        width: '100%',
    },
    userRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 5,
        marginTop:50,
        width: '100%',
    },
    headerText: {
        fontWeight: 'bold',
    },
});
