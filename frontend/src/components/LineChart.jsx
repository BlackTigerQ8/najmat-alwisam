import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { pulsar } from "ldrs";
import { useTranslation } from "react-i18next";

const types = ["car", "bike"];
const LineChart = ({
  isDashboard = false,
  monthlyStats = {},
  chartField,
  yAxisMin = 0,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const month_names = {
    1: t("Jan"),
    2: t("Feb"),
    3: t("Mar"),
    4: t("Apr"),
    5: t("May"),
    6: t("Jun"),
    7: t("Jul"),
    8: t("Aug"),
    9: t("Sep"),
    10: t("Oct"),
    11: t("Nov"),
    12: t("Dec"),
  };

  pulsar.register();
  if (!monthlyStats || Object.keys(monthlyStats).length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <l-pulsar
          size="70"
          speed="1.75"
          color={colors.greenAccent[500]}
        ></l-pulsar>
      </div>
    );
  }

  const formattedData = types.map((type) => ({
    id: type,
    color: type === "car" ? colors.greenAccent[500] : colors.blueAccent[500],
    data: Object.keys(monthlyStats)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((month) => ({
        x: month_names[month],
        y: Math.max(
          Number(monthlyStats[month][type][chartField]) || 0,
          yAxisMin
        ),
      })),
  }));

  return (
    <ResponsiveLine
      data={formattedData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            background: colors.primary[400],
            color: colors.grey[100],
            padding: 12,
          },
        },
      }}
      tooltip={({ point }) => (
        <div
          style={{
            background: colors.primary[400],
            padding: 12,
            color: colors.grey[100],
          }}
        >
          <strong>
            {point.serieId === "car" ? "Car" : "Bike"}:{" "}
            {point.data.y.toLocaleString("en-US", {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })}
            <br />
            {t("month")}: {point.data.x}
          </strong>
        </div>
      )}
      colors={{ datum: "color" }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: yAxisMin,
        max: "auto", // automatically calculate the max value
        stacked: false,
        reverse: false,
        clamp: true, // prevent going below zero
      }}
      enableBaseline={true}
      enableArea={true}
      baselineValue={yAxisMin}
      yFormat=" >-.2f"
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "transportation",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5,
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "count",
        legendOffset: -40,
        legendPosition: "middle",
        format: (value) => Math.max(value, yAxisMin),
      }}
      enableGridX={false}
      enableGridY={true}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;
