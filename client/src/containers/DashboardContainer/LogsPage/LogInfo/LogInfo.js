import React, { Component } from 'react';
import Chart from "chart.js";
import './LogInfo.css';
import LineChart from 'containers/DashboardContainer/LogsPage/LogInfo/Charts/LineChart.js'
import DoughnutChart from 'containers/DashboardContainer/LogsPage/LogInfo/Charts/DoughnutChart.js'
import { parseConfigFileTextToJson } from 'typescript';

Chart.defaults.global.defaultFontFamily = "Roboto, sans-serif";

const LogInfo = (props) => (
    <div>
        <div className="LogInfo">
            <div className="LogInfo-chart">
                <LineChart
                    data={props.data[0].data}
                    title={props.data[0].title}
                    color="#800000"
                />
            </div>
            <div className="LogInfo-chart">
                <LineChart
                    data={props.data[1].data}
                    title={props.data[1].title}
                    color="#999966"
                />
            </div>
        </div>
        <div className="LogInfo">
            <div className="LogInfo-chart">
                <LineChart
                    data={props.data[2].data}
                    title={props.data[2].title}
                    color="#006600"
                />
            </div>
            <div className="LogInfo-chart">
                <LineChart
                    data={props.data[3].data}
                    title={props.data[3].title}
                    color="#3E517A"
                />
            </div>
        </div>
    </div>


);

export default LogInfo;




