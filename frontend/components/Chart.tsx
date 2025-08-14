"use client";

import { useEffect, useState } from "react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { calculatePercentage, convertFileSize } from "@/lib/utils";

const chartConfig = {
  size: {
    label: "Size",
  },
  used: {
    label: "Used",
    color: "white",
  },
} satisfies ChartConfig;

export const Chart = ({ used = 0 }: { used: number }) => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const tablet = width >= 641 && width <= 1024;
        setIsTablet(tablet);
        console.log('Screen size check:', { width, tablet });
      }
    };

    checkScreenSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, []);

  // Debug logging
  const total = 2 * 1024 * 1024 * 1024; // 2GB total
  const percentage = calculatePercentage(used, total);
  
  // Ensure percentage is a valid number and within bounds
  const validPercentage = isNaN(Number(percentage)) ? 0 : Math.max(0, Math.min(100, Number(percentage)));
  const endAngle = Math.max(90, Math.min(450, validPercentage * 3.6 + 90)); // 3.6 degrees per 1%
  
  // Additional safety check for NaN values
  const safeEndAngle = isNaN(endAngle) ? 90 : endAngle;
  
  // Optimized circle for tablet
  const innerRadius = isTablet ? 90 : 80;
  const outerRadius = isTablet ? 120 : 110;
  
  console.log('Chart Debug:', {
    used,
    percentage: validPercentage,
    endAngle,
    isTablet,
    innerRadius,
    outerRadius,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'SSR'
  });

  // Show actual percentage, even if 0
  const displayPercentage = validPercentage;
  const displayEndAngle = safeEndAngle;

  const chartData = [{ storage: "used", 10: used, fill: "white" }];
  
  console.log('Chart Data:', chartData);
  console.log('Display Percentage:', displayPercentage);
  console.log('Display End Angle:', displayEndAngle);

  return (
    <Card className="chart">
      <CardContent className="flex-1 p-0">
        <ChartContainer config={chartConfig} className="chart-container">
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={displayEndAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="polar-grid"
              polarRadius={isTablet ? [96, 84] : [86, 74]}
            />
            <RadialBar dataKey="storage" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="chart-total-percentage"
                        >
                          {displayPercentage === 0 ? "0%" : `${displayPercentage.toFixed(1)}%`}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-white/70"
                        >
                          Space used
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardHeader className="chart-details">
        <CardTitle className="chart-title">Available Storage</CardTitle>
        <CardDescription className="chart-description">
          {convertFileSize(used)} / 2GB
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
