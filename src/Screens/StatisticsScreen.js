import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
import {
  format, addMonths, addYears, startOfWeek,  endOfWeek, startOfMonth, endOfMonth, startOfYear, 
  endOfYear, 
  startOfDay, 
  endOfDay 
} from 'date-fns';

import MenuButton from "../Components/MenuButton";
import { supabase } from '../api/supabaseClient';

export default function StatisticsScreen ({ route }) {
  const { session } = route.params;
  const [timelineData, setTimelineData] = useState([]);
  const [currentDay, setCurrentDay] = useState(new Date()); 

  const [selectedSegment, setSelectedSegment] = useState('day'); 
  const [controlDate, setControlDate] = useState(new Date());

  const [labelTimeData, setLabelTimeData] = useState({});

  const [productiveTime, setProductiveTime] = useState('0sec');
  const [notProductiveTime, setNotProductiveTime] = useState('0sec');


  const updateControlDate = (action) => {
    switch (selectedSegment) {
      case 'day':
        setControlDate(current => action(current, 1));
        break;
      case 'week':
        setControlDate(current => action(current, 7));
        break;
      case 'month':
        setControlDate(current => action(current, 1, 'month'));
        break;
      case 'year':
        setControlDate(current => action(current, 1, 'year'));
        break;
      default:
        break;
    }
  };

  const goToPreviousControlDate = () => {
    updateControlDate((current, amount, unit) => {
      if (unit === 'month') {
        return addMonths(current, -amount);
      } else if (unit === 'year') {
        return addYears(current, -amount);
      }
      return addDays(current, -amount);
    });
  };

  const goToNextControlDate = () => {
    updateControlDate((current, amount, unit) => {
      if (unit === 'month') {
        return addMonths(current, amount);
      } else if (unit === 'year') {
        return addYears(current, amount);
      }
      return addDays(current, amount);
    });
  };

  const formatControlDate = () => {
    switch (selectedSegment) {
      case 'day':
        return format(controlDate, 'PPP');
        case 'week':
          const start = startOfWeek(controlDate, { weekStartsOn: 1 });
          const end = endOfWeek(controlDate, { weekStartsOn: 1 });
          
          // Check if start and end are in the same month
          if (format(start, 'MMMM') === format(end, 'MMMM')) {
            const startDay = format(start, 'd');
            const endDay = format(end, 'd');
            return `${format(start, 'MMMM')} ${startDay}${getOrdinalSuffix(parseInt(startDay))} - ${endDay}${getOrdinalSuffix(parseInt(endDay))}`;
          } else {
            // Different month, use full format for both dates
            return `${format(start, `MMMM d'${getOrdinalSuffix(new Date(start).getDate())}'`)} - ${format(end, `MMMM d'${getOrdinalSuffix(new Date(end).getDate())}'`)}`;
          }
      case 'month':
        return format(startOfMonth(controlDate), 'MMMM yyyy');
      case 'year':
        return format(controlDate, 'yyyy');
      default:
        return format(controlDate, 'PPP');
    }
  };

  const renderNewTimeControl = () => (
    <View style={styles.secondDateSelector}>
      <TouchableOpacity onPress={goToPreviousControlDate}>
        <Text style={styles.arrow}>{"<"}</Text>
      </TouchableOpacity>
      <Text style={styles.dateText}>{formatControlDate()}</Text>
      <TouchableOpacity onPress={goToNextControlDate}>
        <Text style={styles.arrow}>{">"}</Text>
      </TouchableOpacity>
    </View>
  );

  const addDays = (date, days) => { //DAY SELECTOR FOR TIMELINE
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

  const getOrdinalSuffix = (day) => {
    const j = day % 10,
          k = day % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };

  const formatDate = (date) => {
  const dayOfMonth = format(date, 'd');
  const ordinalSuffix = getOrdinalSuffix(dayOfMonth);
  return format(date, `MMMM d'${ordinalSuffix}', yyyy`);
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

  const formatElapsedTime = (elapsedtime) => { //this is for indivudual sessions aka my timeline
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

  const formatTotalElapsedTime = (totalSeconds) => {// this is for my labels in my statistics widget
    if (typeof totalSeconds === 'number') {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
  
      const hoursDisplay = hours > 0 ? `${hours}hr ` : '';
      const minutesDisplay = minutes > 0 ? `${minutes}min ` : '';
      const secondsDisplay = seconds > 0 ? `${seconds}sec` : '';
  
      return `${hoursDisplay}${minutesDisplay}${secondsDisplay}`.trim() || '0sec';
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
      .channel('studysession') 
      .on('*', payload => {console.log(payload), fetchData();})
      .subscribe();

    return () => {
      subscription.unsubscribe(); //here im unsubscriping when the component unmounts to prevent memory leaks
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
      fetchData(); // Refresh the timeline data after deletion which triggers to useeffect to fetch the data again
    }
  };

  const renderSegmentControl = () => (
    <View style={styles.segmentControlContainer}>
      {['day', 'week', 'month', 'year'].map((segment) => (
        <TouchableOpacity
          key={segment}
          style={[
            styles.segmentButton,
            selectedSegment === segment && styles.segmentButtonSelected,
          ]}
          onPress={() => setSelectedSegment(segment)}
        >
          <Text
            style={[
              styles.segmentButtonText,
              selectedSegment === segment && styles.segmentButtonTextSelected,
            ]}
          >
            {segment.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDetail = (rowData) => {
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
  
  const renderTime = (rowData) => {
    return (
      <Text style={styles.time}>{rowData.time}</Text>
    );};

  const fetchAndAggregateLabelData = async () => { //this is for my second widget
    const { start, end } = getStatsTimeframe();

    const { data, error } = await supabase
    .from('studysession')
    .select('*')
    .eq('id', session?.user.id)
    .gte('starttime', start)
    .lte('starttime', end)
    .order('starttime', { ascending: true });
  
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    // Aggregate elapsed time by label
    const aggregatedData = data.reduce((acc, session) => {
      const label = session.label_text;
      const elapsedTimeInSeconds = getSecondsFromElapsedTime(session.elapsedtime);
      acc[label] = acc[label] ? acc[label] + elapsedTimeInSeconds : elapsedTimeInSeconds;
      return acc;
    }, {});

    // Convert aggregated data seconds back to a more readable format
    const formattedAggregatedData = {};
    Object.keys(aggregatedData).forEach(label => {
      formattedAggregatedData[label] = formatTotalElapsedTime(aggregatedData[label]);
    });
  
    setLabelTimeData(formattedAggregatedData);
  };

  const aggregateTimeByProductivity = async () => {
    const { start, end } = getStatsTimeframe();
    const labelProductivityStatus = await fetchLabels();
  
    const { data, error } = await supabase
      .from('studysession')
      .select('elapsedtime, label_text')
      .eq('id', session?.user.id)
      .gte('starttime', start) 
      .lte('starttime', end) 
      .order('starttime', { ascending: true });
  
    if (error) {
      console.error('Error fetching sessions:', error);
      return;
    }
  
    let productiveTimeInSeconds = 0;
    let notProductiveTimeInSeconds = 0;
  
    data.forEach(session => {
      const elapsedTimeInSeconds = getSecondsFromElapsedTime(session.elapsedtime);
      if (labelProductivityStatus[session.label_text]) {
        productiveTimeInSeconds += elapsedTimeInSeconds;
      } else {
        notProductiveTimeInSeconds += elapsedTimeInSeconds;
      }
    });
  
    setProductiveTime(formatTotalElapsedTime(productiveTimeInSeconds));
    setNotProductiveTime(formatTotalElapsedTime(notProductiveTimeInSeconds));
  };
 
  const getSecondsFromElapsedTime = (elapsedtime) => {
    const parts = elapsedtime.split(':').map(part => parseInt(part, 10));
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  };

  const renderLabelTimeData = () => {
    return Object.entries(labelTimeData).map(([label, time]) => (
      <View key={label} style={{ marginVertical: 4, marginLeft:10, }}>
        <Text>{label}: {time}</Text>
      </View>
    ));
  };

  const renderProductiveTimeData = () => (
    <View style={{ marginVertical: 7, marginLeft: 10 }}>
      <Text style={{fontWeight:'bold'}}>Total Productive: {productiveTime}</Text>
      <Text style={{fontWeight:'bold'}}>Total Not Productive: {notProductiveTime}</Text>
    </View>
  );

  const fetchLabels = async () => {
    const { data, error } = await supabase
      .from('labels')
      .select('label_text, is_productive')
      .eq('user_id', session?.user.id);
  
    if (error) {
      console.error('Error fetching labels:', error);
      return {};
    }
  
    const labelProductivityStatus = {};
    data.forEach(label => {
      labelProductivityStatus[label.label_text] = label.is_productive;
    });
  
    return labelProductivityStatus;
  };

  const getStatsTimeframe = () => {
    let start;
    let end;
  
    switch (selectedSegment) {
      case 'day':
        start = startOfDay(controlDate);
        end = endOfDay(controlDate);
        break;
      case 'week':
        start = startOfWeek(controlDate, { weekStartsOn: 1 });
        end = endOfWeek(controlDate, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(controlDate);
        end = endOfMonth(controlDate);
        break;
      case 'year':
        start = startOfYear(controlDate);
        end = endOfYear(controlDate);
        break;
      default:
        start = new Date();
        end = new Date();
    }
  
    return { start: start.toISOString(), end: end.toISOString() };
  };
  
  useEffect(() => {
    fetchAndAggregateLabelData(); 
    aggregateTimeByProductivity();
  }, [selectedSegment, controlDate]);

    return ( 
      <View style={styles.container}>

        <View style={styles.menu}>
            <MenuButton />
        </View>

        {renderSegmentControl()}

        <View style={styles.dateSelector}>
            <TouchableOpacity onPress={goToPreviousDay}>
                <Text style={styles.arrow}>{"<"}</Text>
            </TouchableOpacity>

            <Text style={styles.dateText}>{formatDate(currentDay)}</Text>

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

        {renderNewTimeControl()}

        <View style={styles.timePerLabelWidget}>
          {renderProductiveTimeData()}

          <Text style={{ fontSize: 18, 
            fontWeight: 'bold', 
            marginLeft:2,
            marginTop:5,
            color:'#30137c', }}> Time Spent per Label</Text> 
          {renderLabelTimeData()}
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
    timePerLabelWidget:{
      marginTop:40,
      padding:20,
      paddingLeft:10,
      borderRadius:20,
      backgroundColor: '#f0ecff',
      width: '100%',
      height:300,
    },
    secondDateSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 450,
      left: 0,
      right: 0,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    arrow: {
      fontSize: 24,
      marginHorizontal: 10,
    },
    dateText: {
      fontSize: 18,
    },
    noSessionsView:{
      marginLeft:10,
      fontWeight:'bold',
    },
    widget: {
      marginTop:40,
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
        top:105,
      },
      arrow: {
        fontSize: 24,
        marginHorizontal: 10,
      },
      dateText: {
        fontSize: 18,
      },
      segmentControlContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
      },
      segmentButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        margin: 4,
      },
      segmentButtonSelected: {
        backgroundColor: '#30137c', 
      },
      segmentButtonText: {
        color: 'black',
      },
      segmentButtonTextSelected: {
        color: 'white',
      },
  });