// @ts-nocheck
"use client";
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
export var ControlChart = function (_a) {
    var _b = _a.data, data = _b === void 0 ? [] : _b, _c = _a.goal, goal = _c === void 0 ? null : _c, _d = _a.xName, xName = _d === void 0 ? "x" : _d, _e = _a.yName, yName = _e === void 0 ? "y" : _e;
    var svgRef = useRef(null);
    useEffect(function () {
        // Set up SVG dimensions
        var margin = { top: 20, right: 30, bottom: 100, left: 50 };
        var width = 800 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;
        // Remove any existing content in the SVG before drawing a new chart
        var svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', "translate(".concat(margin.left, ",").concat(margin.top, ")"));
        var mean = d3.mean(data, function (d) { return d.y; });
        var stdDev = d3.deviation(data, function (d) { return d.y; });
        var upperControlLimit = mean + stdDev;
        var lowerControlLimit = mean - stdDev;
        // Set up scales
        var xScale = d3.scaleLinear()
            .domain([1, d3.max(data, function (d) { return d.x; })])
            .range([0, width]);
        var yScale = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return d.y; }) - 2, d3.max(data, function (d) { return d.y; }) + 2])
            .range([height, 0]);
        // Add X and Y axes
        svg.append("g")
            .attr("transform", "translate(0,".concat(height, ")"))
            .call(d3.axisBottom(xScale).ticks(data.length))
            .attr("transform", "rotate(-90)") // Rotate the text vertically
            .style("text-anchor", "end") // Adjust the text anchor for proper alignment
            .attr("dy", "-0.5em") // Adjust the vertical spacing
            .attr("dx", "-0.8em");
        svg.append("g")
            .call(d3.axisLeft(yScale));
        // Add the data line (actual values)
        var line = d3.line()
            .x(function (d) { return xScale(d.x); })
            .y(function (d) { return yScale(d.y); });
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
        var calculateTrendline = function (data) {
            var n = data.length;
            var sumX = d3.sum(data, function (d) { return d.x; });
            var sumY = d3.sum(data, function (d) { return d.y; });
            var sumXY = d3.sum(data, function (d) { return d.x * d.y; });
            var sumX2 = d3.sum(data, function (d) { return d.x * d.x; });
            var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            var intercept = (sumY - slope * sumX) / n;
            // Return two points that define the trendline (from min to max x)
            return [
                { x: d3.min(data, function (d) { return d.x; }), y: slope * d3.min(data, function (d) { return d.x; }) + intercept },
                { x: d3.max(data, function (d) { return d.x; }), y: slope * d3.max(data, function (d) { return d.x; }) + intercept }
            ];
        };
        // Calculate the trendline using least squares method
        var trendlineData = calculateTrendline(data);
        var trendline = d3.line()
            .x(function (d) { return xScale(d.x); })
            .y(function (d) { return yScale(d.y); });
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
        var legendData = [
            { color: "red", text: xName },
            { color: "green", text: "Goal" },
            { color: "orange", text: "Mean" },
            { color: "yellow", text: "Control Limits" },
            { color: "blue", text: "Trend Line" }
        ];
        var legend = svg.selectAll(".legend")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(0, ".concat(i * 20, ")"); });
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d) { return d.color; });
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) { return d.text; });
        // Clean up the SVG before unmounting
        return function () {
            d3.select(svgRef.current).selectAll('*').remove();
        };
    }, [data, goal]); // Re-run the effect whenever data or goal changes
    return (<svg ref={svgRef}></svg>);
};
