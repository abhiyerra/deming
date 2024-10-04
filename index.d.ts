import React from 'react';
export interface DataPoint {
    x: string;
    y: number;
}
interface ControlChartProps {
    data?: DataPoint[];
    goal?: number | null;
    xName?: string;
    yName?: string;
}
export declare const ControlChart: React.FC<ControlChartProps>;
export {};
