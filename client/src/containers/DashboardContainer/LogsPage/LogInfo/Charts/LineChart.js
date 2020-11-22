import React, { Component } from 'react';
import Chart from "chart.js";
import moment from "moment";


class LineChart extends Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.state = {
            needReload: true
        }
        

    }

    componentDidUpdate() {
        this.myChart.data.labels = this.props.data.map(d => {
            // Random date + given time from log files. Chart requires a full date to display.
            var data = moment("2000-01-01 " + d.time, 'YYYY-MM-DD hh:mm:ss:SSS').toDate().getTime();
            return data;
        });
        this.myChart.data.datasets[0].data = this.props.data.map(d => d.value);
        this.myChart.update();
    }

    updateFigure = () => {
        if (this.state.needReload){
            this.setState({needReload: false});
            console.log("updated!")
        }

    }

    componentDidMount() {
        this.myChart = new Chart(this.canvasRef.current, {
            type: 'line',
            options: {
                animation: {
                    duration: 0
                },
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'second'
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            min: 0
                        }
                    }]
                }
            },
            data: {
                labels: this.props.data.map(d => d.time),
                datasets: [{
                    label: this.props.title,
                    data: this.props.data.map(d => d.value),
                    fill: 'none',
                    backgroundColor: this.props.color,
                    pointRadius: 2,
                    borderColor: this.props.color,
                    borderWidth: 1,
                    lineTension: 0
                }]
            },
        });

        this.updateFigure();
    }

    render() {

        return ( <
            canvas ref = { this.canvasRef }
            />
        );
    }
}
export default LineChart;