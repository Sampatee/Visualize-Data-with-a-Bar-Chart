import "./style.css";
import * as d3 from "d3";

const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const initRender = () => {
  //html render
  d3.select("#app").html(`
<div class="chart-container">
  <h1 id="title">United States GDP</h1>
  <svg id="chart"></svg>
  <p id="more-info">More Information: http://www.bea.gov/national/pdf/nipaguid.pdf</p>
  <div id="tooltip"></div>
</div>
`);
};

const renderChart = () => {
  //define margins and chart dimensions
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = 920 - margin.left - margin.right;
  const height = 535 - margin.top - margin.bottom;

  //append chart in svg
  const chart = d3
    .select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //define scale
  const xScale = d3.scaleTime().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);

  //define axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  d3.json(url).then(({ data }) => {
    //map the data as objects
    //covert date string into dates
    const mappedData = data.map((d) => ({ date: new Date(d[0]), gdp: d[1] }));

    //set axis domain
    xScale.domain(d3.extent(mappedData, (d) => d.date));
    yScale.domain([0, d3.max(mappedData, (d) => d.gdp)]);

    //set axes
    chart
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    chart
      .append("g")
      .attr("id", "y-axis")
      .call(yAxis)
      .append("text")
      .attr("x", -20)
      .attr("y", 20)
      .attr("transform", "rotate(-90)")
      .style("font-size", 16)
      .attr("text-anchor", "end")
      .style("fill", "black")
      .text("Gross Domestic Product");

    //set data
    chart
      .append("g")
      .selectAll("rect")
      .data(mappedData)
      .join("rect")
      .attr("class", "bar")
      .attr("data-date", (_, i) => data[i][0])
      .attr("data-gdp", (d) => d.gdp)
      .attr("width", (d) => width / mappedData.length)
      .attr("height", (d) => height - yScale(d.gdp))
      .attr("x", (d) => xScale(d.date))
      .attr("y", (d) => yScale(d.gdp))
      .on("mouseover", function () {
        const hoveredBar = d3.select(this);
        const d = hoveredBar.datum();
        const timeFormatter = d3.timeFormat("%Y Q%q");
        const gdpFormatter = d3.format("$,.1f");

        d3.select("#tooltip")
          .html(`${timeFormatter(d.date)}<br>${gdpFormatter(d.gdp)} Billion`)
          .attr("data-date", hoveredBar.attr("data-date"))
          .style("left", `${Number(hoveredBar.attr("x")) + 80}px`)
          .transition()
          .style("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select("#tooltip").transition().style("opacity", 0);
      });
  });
};

d3.select(document).on("DOMContentLoaded", () => {
  initRender();
  renderChart();
});
