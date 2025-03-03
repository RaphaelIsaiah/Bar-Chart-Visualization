document.addEventListener("DOMContentLoaded", function () {
  const padding = 40;
  let dataset;

  // Create tooltip element once
  const tooltip = d3
    .select("#bar-chart")
    .append("div")
    .attr("id", "tooltip")
    .style("background-color", "#EBEBE8")
    .style("color", "#31352E")
    .style("padding", "10px")
    .style("border", "1px solid #D1E2C4")
    .style("border-radius", "5px")
    .style("box-shadow", "2px 2px 5px #31352E")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("position", "absolute");

  // Fetch the data
  d3.json(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  ).then((data) => {
    dataset = data.data;
    renderChart();
    // Redraw chart on window resize
    window.addEventListener("resize", renderChart);
  });

  function renderChart() {
    // Remove any existing SVG
    d3.select("#bar-chart").select("svg").remove();

    const container = d3.select("#bar-chart");
    const { width, height } = container.node().getBoundingClientRect();

    // Create responsive SVG with viewBox and preserveAspectRatio
    const svg = container
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

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
      .domain([0, d3.max(dataset, (d) => d[1])]) // GDP from 0 to max value
      .range([height - padding, padding]);

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(d3.timeYear.every(10)) // Show a tick every 10 years
      .tickFormat(d3.timeFormat("%Y")); // Format as year only

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
    const barWidth = Math.max((width - 2 * padding) / dataset.length, 2); // Ensure bars are at least 2px wide

    svg
      .selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .style("fill", "#778A35")
      .attr("x", (d) => xScale(new Date(d[0])))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", barWidth)
      .attr("height", (d) => height - padding - yScale(d[1]))
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .attr("aria-label", (d) => `Date: ${d[0]}, GDP: $${d[1]} Billion`) // Accessibility
      .on("mouseover", function (e, d) {
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipHeight = tooltip.node().offsetHeight;

        let left = e.pageX + 10;
        let top = e.pageY - 40;

        // Prevent tooltip overflow
        if (left + tooltipWidth > window.innerWidth) {
          left = e.pageX - tooltipWidth - 10;
        }
        if (top < 0) {
          top = e.pageY + 10;
        }

        // Format date to quarters
        const date = new Date(d[0]);
        const year = date.getFullYear();
        const month = date.getMonth();
        let quarter;

        if (month <= 2) {
          quarter = "Q1";
        } else if (month <= 5) {
          quarter = "Q2";
        } else if (month <= 8) {
          quarter = "Q3";
        } else {
          quarter = "Q4";
        }

        // Format GDP value to billions with commas
        const gdpFormatted = `$${(d[1] / 1000)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Billion`;

        tooltip
          .attr("data-date", d[0])
          .style("opacity", 1)
          .html(`${year} ${quarter}<br>${gdpFormatted}`)
          .style("left", `${left}px`)
          .style("top", `${top}px`);

        d3.select(this).style("fill", "#31352E");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
        d3.select(this).transition().duration(50).style("fill", "#778A35");
      });
  }
});
