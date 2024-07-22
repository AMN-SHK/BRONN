import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

function PredictionChart({ data }) {
  const chartData = data.prediction.x.map((date, index) => ({
    date,
    prediction: data.prediction.y[index],
    trend: data.trend.y[index],
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p>{`Date: ${label}`}</p>
          <p>{`Value: ${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderArrow = (points, lineColor) => {
    const [lastPoint] = points.slice(-1);
    const [prevPoint] = points.slice(-2);
    const angle = Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x) * (180 / Math.PI);

    return (
      <path d={`M${lastPoint.x},${lastPoint.y} L${lastPoint.x - 5},${lastPoint.y - 5} L${lastPoint.x - 5},${lastPoint.y + 5} Z`} fill={lineColor} transform={`rotate(${angle},${lastPoint.x},${lastPoint.y})`} />
    );
  };

  return (
    <div className="prediction-charts">
      <h4>Predictions</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="linear" dataKey="prediction" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrediction)" />
          <Line type="linear" dataKey="prediction" stroke="#8884d8" dot={false} isAnimationActive={false} activeDot={false} />
          <Line type="linear" dataKey="prediction" stroke="#8884d8" dot={false} isAnimationActive={false} activeDot={false}>
            {({ points }) => renderArrow(points, "#8884d8")}
          </Line>
        </AreaChart>
      </ResponsiveContainer>
      
      <h4>Trends</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" />
          <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} /> {/* Adjust this range as needed */}
          <Tooltip content={<CustomTooltip />} />
          <Area type="linear" dataKey="trend" stroke="#82ca9d" fillOpacity={1} fill="url(#colorTrend)" dot={false} />
          <Line type="linear" dataKey="trend" stroke="#82ca9d" dot={false} isAnimationActive={false} activeDot={false} />
          <Line type="linear" dataKey="trend" stroke="#82ca9d" dot={false} isAnimationActive={false} activeDot={false}>
            {({ points }) => renderArrow(points, "#82ca9d")}
          </Line>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PredictionChart;
