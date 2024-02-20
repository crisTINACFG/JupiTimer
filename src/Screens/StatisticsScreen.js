import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
import Swiper from 'react-native-swiper';

import MenuButton from "../Components/MenuButton";
import { supabase } from '../api/supabaseClient';

export default function StatisticsScreen ({ route }) {
  const { session } = route.params;
  const [timelineData, setTimelineData] = useState([]);
  const [currentDay, setCurrentDay] = useState(new Date()); 


  const addDays = (date, days) => { //DAY SELECTOR
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  const goToNextDay = () => {
    setCurrentDay(addDays(currentDay, 1));
  };
  const goToPreviousDay = () => {
    setCurrentDay(addDays(currentDay, -1));
  };
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };


  const fetchTimelineData = async () => {
    const startOfDay = new Date(currentDay.setHours(0,0,0,0)).toISOString();
    const endOfDay = new Date(currentDay.setHours(23,59,59,999)).toISOString();
  
    const { data, error } = await supabase
      .from('studysession')
      .select('*')
      .eq('id', session?.user.id)
      .gte('starttime', startOfDay) // sessions starting on or after the start of the current day
      .lte('starttime', endOfDay) // sessions starting on or before the end of the current day
      .order('starttime', { ascending: true });
  
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
  
    // Convert data for timeline display
    const formattedData = data.map(session => ({
      sessionId: session.sessionid,
      time: new Date(session.starttime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: session.label_text,
      description: `Elapsed Time: ${formatElapsedTime(session.elapsedtime)}`,
    }));
  
    return formattedData;
  };

  // Function to format the elapsed time
  const formatElapsedTime = (elapsedtime) => {
    if (typeof elapsedtime === 'string' && elapsedtime.includes(':')) {
      const parts = elapsedtime.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);

      const hoursDisplay = hours > 0 ? `${hours}hr ` : '';
      const minutesDisplay = minutes > 0 ? `${minutes}min ` : '';
      const secondsDisplay = seconds > 0 ? `${seconds}sec` : '';

      return `${hoursDisplay}${minutesDisplay}${secondsDisplay}`.trim();
    } else {
      return 'No elapsed time';
    }
  };
  const isToday = (date) => { //checking if the day selected is today
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };


  // fetch data and set timeline state
  const fetchData = async () => {
    const data = await fetchTimelineData();
    if (data) {
      setTimelineData(data);
    }
  };
  useEffect(() => { // useEffect for fetching initial timeline data
    fetchData();
  }, [timelineData, currentDay]); 
  useEffect(() => {//Supabase real-time subscription
    const subscription = supabase
      .channel('studysession') // Confirm this is the correct channel name
      .on('*', payload => {console.log(payload), fetchData();})
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session.user.id]); 

  const deleteSession = async (sessionid) => {
    const { data, error } = await supabase
      .from('studysession')
      .delete()
      .match({ sessionid: sessionid });
  
    if (error) {
      console.error('Error deleting session:', error);
    } else {
      fetchData(); // Refresh the timeline data after deletion
    }
  };

  const renderDetail = (rowData, sectionID, rowID) => {
    return (
      <TouchableOpacity
        style={styles.detailContainer}
        onPress={() => {
          Alert.alert(
            "Delete Session",
            `Are you sure you want to delete the session "${rowData.title}"?`,
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              { text: "Delete", onPress: () => deleteSession(rowData.sessionId) }
            ],
            { cancelable: false }
          );
        }}
      >
        <Text style={styles.title}>{rowData.title}</Text>
        <Text style={styles.description}>{rowData.description}</Text>
      </TouchableOpacity>
    );
  };
  
  
  const renderTime = (rowData, sectionID, rowID) => {
    return (
      <Text style={styles.time}>{rowData.time}</Text>
    );};
  

    return( 
      <View style={styles.container}>

        <View style={styles.menu}>
            <MenuButton />
        </View>

        
        <View style={styles.dateSelector}>
            <TouchableOpacity onPress={goToPreviousDay}>
                <Text style={styles.arrow}>{"<"}</Text>
            </TouchableOpacity>

            <Text style={styles.dateText}>{formatDate(currentDay)}</Text>

            {/* Conditionally render the next day button */}
            {!isToday(currentDay) && (
              <TouchableOpacity onPress={goToNextDay}>
                  <Text style={styles.arrow}>{">"}</Text>
              </TouchableOpacity>
            )}
        </View>


        <View style={styles.widget}>
        {timelineData.length === 0 ? (
          <View style={styles.noSessionsView}>
            <Text style={styles.noSessionsText}>No sessions today</Text>
          </View>
        ) : (
          <Timeline
            data={timelineData}
            circleSize={20}
            circleColor="#30137c"
            lineColor="#30137c"
            descriptionStyle={{ color: 'gray' }}
            options={{
                style: { paddingTop: 5 }
            }}
            innerCircle={'dot'}
            renderDetail={renderDetail}
            renderTime={renderTime}
          />
        )}
      </View>


      </View>
    );
}

const styles = StyleSheet.create({
    menu: {
      position: 'absolute',
      left: 0,
      top: 15,
      zIndex: 1,
    },
    noSessionsView:{
      marginLeft:10,
      fontWeight:'bold',
    },
    widget: {
      marginTop:55,
      padding:10,
      paddingLeft:1,
      borderRadius:20,
      backgroundColor: '#f0ecff',
      width: '100%',
      height:300,
    },
    detailContainer: {
        marginBottom: 20, 
        paddingVertical: 10, 
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 1, height: 3 },
        elevation: 3,
        borderWidth: 1,
        borderColor: 'black',
      },
      title: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      description: {
        fontSize: 14,
      },
      time: {
        color: 'black',
        borderRadius: 13,
        overflow: 'hidden',
        width: 75, 
        textAlign: 'center',
      },
      container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        width: '100%',
      },
      dateSelector: {
        flexDirection:'row',
        alignItems: 'center',
        marginLeft:95,
        position:'absolute',
        top:80,
      },
      arrow: {
        fontSize: 24,
        marginHorizontal: 10,
      },
      dateText: {
        fontSize: 18,
      },
  });