import React, { Component } from 'react';
import Chart from "chart.js";
import moment from "moment";


class LineChart extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();

  }

  componentDidUpdate() {
    this.myChart.data.labels = this.props.data.map(d => {
      var data = moment("2000-01-01 " + d.time, 'YYYY-MM-DD hh:mm:ss:SSS').toDate().getTime();
      return data;
    });
    this.myChart.data.datasets[0].data = this.props.data.map(d => d.value);
    this.myChart.update();
  }

  componentDidMount() {
    this.myChart = new Chart(this.canvasRef.current, {
      type: 'line',
      options: {
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'second'
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                min: 0
              }
            }
          ]
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

      // plugin hooks not functioning as expected

      // plugins:[{
      //   afterUpdate: function(chart) {
      //       if (chart.data.datasets.data == undefined || chart.data.datasets.data.length == 0) {
      //         console.log("am in the plugn")

      //         console.log(chart.data.datasets.data)

      //         // No data is present
      //         var ctx = chart.chart.ctx;
      //         var width = chart.chart.width;
      //         var height = chart.chart.height
      //         chart.clear();

      //         ctx.save();
      //         ctx.textAlign = 'center';
      //         ctx.textBaseline = 'middle';
      //         ctx.font = "16px normal 'Helvetica Nueue'";
      //         ctx.fillText('No data to display', width / 2, height / 2);
      //         ctx.restore();
      //       } else {

      //       }
      //     }

      // }]
    });
  }

  render() {

    return (
      <canvas ref={this.canvasRef} />
    );
  }
}
export default LineChart;