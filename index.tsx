// @ts-nocheck

"use client"

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export interface DataPoint {
    x: string; // Date in string format, e.g., '2024-07-08'
    y: number; // Numerical value associated with the date
}

interface ControlChartProps {
    data?: DataPoint[]; // Optional array of DataPoint
    goal?: number | null; // Optional goal, could be a number or null
    xName?: string; // Optional name for x-axis
    yName?: string; // Optional name for y-axis
}

export const ControlChart: React.FC<ControlChartProps> = ({ data = [], goal = null, xName = "x", yName = "y" }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        // Set up SVG dimensions
        const margin = { top: 20, right: 30, bottom: 100, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Remove any existing content in the SVG before drawing a new chart
        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const mean: any = d3.mean(data, (d: any) => d.y);
        const stdDev: any = d3.deviation(data, (d: any) => d.y);
        const upperControlLimit = mean + stdDev;
        const lowerControlLimit = mean - stdDev;

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain([1, d3.max(data, (d: any) => d.x)])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(data, (d: any) => d.y) - 2, d3.max(data, (d: any) => d.y) + 2])
            .range([height, 0]);

        // Add X and Y axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(data.length))
            .attr("transform", "rotate(-90)")  // Rotate the text vertically
            .style("text-anchor", "end")       // Adjust the text anchor for proper alignment
            .attr("dy", "-0.5em")              // Adjust the vertical spacing
            .attr("dx", "-0.8em");

        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Add the data line (actual values)
        const line = d3.line()
            .x((d: any) => xScale(d.x))
            .y((d: any) => yScale(d.y));

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("stroke", "red")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add the goal line (if provided)
        if (goal !== null) {
            svg.append("line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", yScale(goal))
                .attr("y2", yScale(goal))
                .attr("stroke", "green")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5");
        }

        // Add the mean line
        svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(mean))
            .attr("y2", yScale(mean))
            .attr("stroke", "orange")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        // Add the upper control limit line
        svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(upperControlLimit))
            .attr("y2", yScale(upperControlLimit))
            .attr("stroke", "yellow")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        // Add the lower control limit line
        svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(lowerControlLimit))
            .attr("y2", yScale(lowerControlLimit))
            .attr("stroke", "yellow")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        const calculateTrendline = (data: any) => {
            const n = data.length;
            const sumX = d3.sum(data, (d: any) => d.x);
            const sumY = d3.sum(data, (d: any) => d.y);
            const sumXY = d3.sum(data, (d: any) => d.x * d.y);
            const sumX2 = d3.sum(data, (d: any) => d.x * d.x);

            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            // Return two points that define the trendline (from min to max x)
            return [
                { x: d3.min(data, (d: any) => d.x), y: slope * d3.min(data, (d: any) => d.x) + intercept },
                { x: d3.max(data, (d: any) => d.x), y: slope * d3.max(data, (d: any) => d.x) + intercept }
            ];
        };

        // Calculate the trendline using least squares method
        const trendlineData = calculateTrendline(data);
        const trendline = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));

        // Add the trendline to the chart
        svg.append("path")
            .datum(trendlineData)
            .attr("class", "line")
            .attr("stroke", "blue")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("d", trendline)
            .attr("stroke-dasharray", "4,4");


        // Add a legend
        const legendData = [
            { color: "red", text: xName },
            { color: "green", text: "Goal" },
            { color: "orange", text: "Mean" },
            { color: "yellow", text: "Control Limits" },
            { color: "blue", text: "Trend Line" }
        ];

        const legend = svg.selectAll(".legend")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => d.color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(d => d.text);


        // Clean up the SVG before unmounting
        return () => {
            d3.select(svgRef.current).selectAll('*').remove();
        };
    }, [data, goal]);  // Re-run the effect whenever data or goal changes

    return (
        <svg ref={svgRef}></svg>
    );
};