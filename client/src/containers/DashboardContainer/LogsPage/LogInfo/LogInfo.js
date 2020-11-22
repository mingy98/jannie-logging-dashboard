import React, { useContext, useEffect, useLayoutEffect } from 'react';
import Chart from "chart.js";
import './LogInfo.css';
import LineChart from 'containers/DashboardContainer/LogsPage/LogInfo/Charts/LineChart.js'
// import { parseConfigFileTextToJson } from 'typescript';
import LogsContext from "../context.js"
import { config } from '../../../../constants';

Chart.defaults.global.defaultFontFamily = "Roboto, sans-serif";

const URL = config.url.PRIMARY_SERVER;

const getFileMissingText = (msg) => {
    return <div className='txtInfo' >
        <p> {msg} </p> </div>
}

const getLineChart = (data, index, color) => {

    if (data[0].data.length === 0 && data[1].data.length === 0 && data[2].data.length === 0 && data[3].data.length === 0) {
        return getFileMissingText("Please select a log.")
    } else if (!data[index].data.length || data[index].data.length === 0) {
        if (index === 0) {
            if (!data[1].data.length || data[1].data.length === 0) {
                return getFileMissingText("This log file does not exist.")
            }
        } else if (index === 1) {
            if (!data[0].data.length || data[0].data.length === 0) {
                return getFileMissingText("This log file does not exist.")
            }
        } else if (index === 2) {
            if (!data[3].data.length || data[3].data.length === 0) {
                return getFileMissingText("This log file does not exist.")
            }
        } else if (index === 3) {
            if (!data[2].data.length || data[2].data.length === 0) {
                return getFileMissingText("This log file does not exist.")
            }
        }
        const noDataMsg = "No " + data[index].title + " data in this log file.";
        return getFileMissingText(noDataMsg)

    } else {
        return (< LineChart data={data[index].data}
            title={data[index].title}
            color={color}
        />);
    }
}


const LogInfo = (props) => {

    const {
        dispatch,
        state: { selected_data = [],
                selected,
                selectionChanged
                 }
    } = useContext(LogsContext);

    const buildSelectQuery = () => {
        return `${URL}/getvisual?selected=${selected}`;
    };

    const loadSelectedData = () => {
        const selectQuery = buildSelectQuery();
        if (selectionChanged) {
            fetch(selectQuery)
                .then(response => {
                    return response.json()
                })
                .then((data) => {
                    const value = [{ title: "Latency", data: data.latency },
                    { title: "Average Decode Time", data: data.decode_time },
                    { title: "Average Encode Time", data: data.encode_time },
                    { title: "Average Encode Size", data: data.encode_size },
                    ]
                    dispatch({ type: 'SET_SELECTION_DATA', payload: value })
                })
                .catch(() => dispatch({ type: 'REQUEST_ERROR' }));
            dispatch({ type: 'CHANGE_SELECTION_DONE' });
        }
    };

    useEffect(() => loadSelectedData());

    return (
        <div>
            <div className="LogInfo" >
                <div className="LogInfo-chart" >
                    {getLineChart(selected_data, 0, "#800000")}
                </div>
                <div className="LogInfo-chart" > {
                    getLineChart(selected_data, 1, "#999966")}
                </div>
            </div>
            <div className="LogInfo" >
                <div className="LogInfo-chart" >
                    {getLineChart(selected_data, 2, "#006600")}
                </div>
                <div className="LogInfo-chart" >
                    {getLineChart(selected_data, 3, "#3E517A")}
                </div>
            </div>
        </div>


    );
}

export default LogInfo;