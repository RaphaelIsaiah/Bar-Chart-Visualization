document.addEventListener("DOMContentLoaded", function () {
  const width = 800;
  const height = 400;
  const padding = 40;

  const svg = d3
    .select("#bar-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.json(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  ).then((data) => {
    const dataset = data.data;

    // Scales
    const xScale = d3
      .scaleTime()
      .domain([
        new Date(d3.min(dataset, (d) => d[0])), // earliest date
        new Date(d3.max(dataset, (d) => d[0])), // latest date
      ])
      .range([padding, width - padding]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d[1])]) // 0 - highest GDP
      .range([height - padding, padding]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis);

    // Bars
    svg
      .selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(new Date(d[0])))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", (width - 2 * padding) / dataset.length)
      .attr("height", (d) => height - padding - yScale(d[1]))
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .on("mouseover", function (e, d) {
        tooltip
          .attr("data-date", d[0])
          .style("opacity", 1)
          .html(`Date: ${d[0]}<br>GDP: $${d[1]} Billion`)
          .style("left", `${e.pageX + 10}px`)
          .style("top", `${e.pageY - 40}px`);
        d3.select(this).style("fill", "ghostwhite");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
        d3.select(this).style("fill", "initial");
      });

    // Tooltip
    const tooltip = d3
      .select("#bar-chart")
      .append("div")
      .attr("id", "tooltip")
      .style("background-color", "rgba(0, 0, 0, 0.9")
      .style("color", "gainsboro")
      .style("padding", "10px")
      .style("border", "1px solid grey")
      .style("border-radius", "5px")
      .style("box-shadow", "2px 2px 5px rgba(245, 235, 235, 0.48)")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("position", "absolute");
  });
});
