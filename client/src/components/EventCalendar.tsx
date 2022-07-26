import React, { useState, useEffect } from "react";
import { Calendar, isSameDate } from "@mantine/dates";
import { Text, Loader, Card, Grid, Stack } from "@mantine/core";
import { useQuery } from "@apollo/client";
import { SEARCH_EVENTS } from "../utils/queries";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import "../App.css";

import { Chart, registerables } from 'chart.js'; // required to actually get chart.js with react-chartjs-2 to work
Chart.register(...registerables); // to get the package working, source: https://www.chartjs.org/docs/next/getting-started/integration.html

export default function EventCalendar() {
    
    const state: any = useSelector(state => state)
    
    const [value, setValue] = useState<Date | null>(null); // if useState is not written like this then onChange doesn't work due to how the NPM package works, source: https://mantine.dev/dates/date-picker/
    
    const { loading, data } = useQuery(SEARCH_EVENTS, {
        variables : {
            ambitionId: state.ambitionId
        },
        fetchPolicy: "cache-and-network"
    });

    const viewRecords = data?.searchEvents || [];
     
    useEffect(() => {
        if (!loading) { // to prevent page errors
            selectEvent()
            getFirstDate()
            getLastDate()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    
    function getFirstDate() {
        return new Date(viewRecords.events.at(0).createdAt)
    }

    function getLastDate() {
        return new Date(viewRecords.events.at(-1).createdAt)
    }

    function stats() {
        const category = (viewRecords.category === "Lose Weight" && viewRecords.events.length >= 2) 
                            ? `Weight difference from start to end: ${Math.floor(viewRecords.events.at(0).dataInput - viewRecords.events.at(-1).dataInput)}kg.` 
                            : (viewRecords.category === "Save Money" && viewRecords.events.length >= 7) 
                            ? `$${Math.floor(viewRecords.events.reduce((previous: any, current: any) => previous + current.dataInput, 0 ) / (viewRecords.events.length / 7))} spent per week. Daily: $${Math.floor(viewRecords.events.reduce((previous: any, current: any) => previous + current.dataInput, 0 ) / viewRecords.events.length)} spent per day.` 
                            : ((viewRecords.category === "New Profession" && viewRecords.events.length >= 2) || (viewRecords.category === "New Hobby" && viewRecords.events.length >= 2)) 
                            ? `Total: ${Math.floor(viewRecords.events.reduce((previous: any, current: any) => previous + current.dataInput, 0 ))} minutes. Daily: ${Math.floor(viewRecords.events.reduce((previous: any, current: any) => previous + current.dataInput, 0 ) / viewRecords.events.length)} minutes.` 
                            : (viewRecords.category === "???" && viewRecords.events.length >= 2) 
                            ? `Total: ${Math.floor(viewRecords.events.reduce((previous: any, current: any) => previous + current.dataInput, 0 ))} units. Daily: ${Math.floor(viewRecords.events.reduce((previous: any, current: any) => previous + current.dataInput, 0 ) / viewRecords.events.length)}` 
                            : `More data required for calculations.`


        return (
            <>
                <Text mt="md" style={{textAlign: "center"}}>{`First record: ${viewRecords.events.at(0).createdAt}`} </Text>
                <Text style={{textAlign: "center"}}>{`Last record: ${viewRecords.events.at(-1).createdAt}`} </Text>
                <Text style={{textAlign: "center"}}>{category}</Text>
            </>
        )
    }

    function yAxisLabels() {

        const units = (viewRecords.category === "Lose Weight") 
                ? "Weight (kg)" 
                : (viewRecords.category === "Save Money") 
                ? "Dollars Spent ($)"
                : ((viewRecords.category === "New Profession") || (viewRecords.category === "New Hobby"))
                ? "Minutes Spent"
                : "Units"

        return units 
    }


    function displayDataPoint() {

        return viewRecords.events.map((date: any) => {
            if (isSameDate(value || new Date(), new Date(date.createdAt))) {
                
                return "rgba(0, 255, 64, 1)"
            } else {
                return "violet"
            }
        });
    };

    const ambitionUnits = (state.category === "Lose Weight") 
                                    ? "kg" 
                                    : (state.category === "Save Money") 
                                    ? " dollars" 
                                    : (state.category === "New Profession" || state.category === "New Hobby") 
                                    ? " minutes" 
                                    : " units";
        

    function selectEvent() { // for displaying data when clicking on the calendar

      return  viewRecords.events.map((date: any) => {
            if (isSameDate(value || new Date(), new Date(date.createdAt))) {
                var eventCreatedAt = `Date: ${date.createdAt}`;
                var eventDataInput = `Data Input: ${date.dataInput}${ambitionUnits}`;
                var eventNotes = (date.notes) ? `Notes: ${date.notes}` : null ;


                return <Card key={date.createdAt} shadow="sm" p="sm" radius="md" withBorder style={{margin: "1em"}} >
                    <Stack >
                        <Text >
                            {eventCreatedAt}
                        </Text>
                        <Text >
                            {eventDataInput}
                        </Text>
                        <Text >
                            {eventNotes}
                        </Text>
                    </Stack>
                </Card>

                // note, you can actually stick <Card /> component in the return statement to actually render
            } else {
                return null
            }
        })
        
    };
    
    return (
        <>
        {loading ? (
            <Loader color="red" size="xl" />
            ) : (
        <div>
            {stats()}

            <Grid grow>
            <Grid.Col
            md={6}
            lg={3} 
            >

            
            <Calendar 
                fullWidth
                value={value} 
                onChange={setValue}
                minDate={getFirstDate()}
                maxDate={getLastDate()}
            />
            </Grid.Col>
            <Grid.Col 
            md={6}
            lg={3} 
            >
                {selectEvent()}
            </Grid.Col>

            <Grid.Col 
            className="chart"
            md={12}
            lg={6}
            >
            <Line 
                datasetIdKey="eventsChart"
                data={{
                    labels: viewRecords.events.map((data: any, index: any) => { // source for knowing index can be used as a parameter: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
                    
                        return index + 1
                    }),//array x-axis
                    datasets: [
                        {
                            data: viewRecords.events.map((data: any) => {
                                return data.dataInput
                            }),
                            label: viewRecords.category,
                            borderColor: "crimson",
                            backgroundColor: (displayDataPoint())
                        },
                    ], // hmmm
                }}
                options={{
                    scales: {
                        y: {
                            title: {
                              display: true,
                              text: yAxisLabels(),
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Days recorded",
                            },
                          },
                    }
                }}
                 />
                </Grid.Col>
            </Grid>
        </div>
        )}

        </>
    );
}