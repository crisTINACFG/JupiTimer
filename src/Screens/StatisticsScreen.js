import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
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
    const { data, error } = await supabase
      .from('studysession')
      .select('*')
      .eq('id', session?.user.id)
      .order('starttime', { ascending: true });

    if (error) {
      console.error('Error fetching data:', error);
      return;
    }


    // Convert data for timeline display
    const formattedData = data.map(session => ({
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


  // fetch data and set timeline state
  const fetchData = async () => {
    const data = await fetchTimelineData();
    if (data) {
      setTimelineData(data);
    }
  };
  useEffect(() => { // useEffect for fetching initial timeline data
    fetchData();
  }, [timelineData]); 
  useEffect(() => {//Supabase real-time subscription
    const subscription = supabase
      .channel('studysession') // Confirm this is the correct channel name
      .on('*', payload => {console.log(payload), fetchData();})
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session.user.id]); 



  const renderDetail = (rowData, sectionID, rowID) => {
    return (
      <TouchableOpacity
        style={styles.detailContainer}
        onPress={() => console.log(`Pressed: ${rowData.title}`)}
      >
        <Text style={styles.title}>{rowData.title}</Text>
        <Text style={styles.description}>{rowData.description}</Text>
      </TouchableOpacity>
    );};
  
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

            <TouchableOpacity onPress={goToNextDay}>
                <Text style={styles.arrow}>{">"}</Text>
            </TouchableOpacity>
        </View>


        <View style={styles.widget}>
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
    widget: {
      marginTop:4,
      padding:13,
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
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf:'center',
        marginTop: 10,
      },
      arrow: {
        fontSize: 24,
        marginHorizontal: 10,
      },
      dateText: {
        fontSize: 18,
      },
  });