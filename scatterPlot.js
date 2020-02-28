
var size = 200,
    padding = 38;

var x = d3.scale.linear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scale.linear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(6);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(6);

var color = d3.scale.ordinal()
    .domain(["Four-year", "Two-year", "Less than Two-year"])
    .range(["#3DE631","#EEDE28","#E74C2A"]);

d3.tsv("mrc.csv", function(error, data) {
  if (error) throw error;

  // Convert string data to numeric
  data.forEach(function(d) {
    d["Kid Unemployment"] = +d["Kid Unemployment"];
    d["Kid Married Rate"] = +d["Kid Married Rate"];
    d["Kid Median Income"] = +d["Kid Median Income"];
    d["Mobility"] = +d["Mobility"];
    d["Parent Median Income"] = +d["Parent Median Income"];
  });

  var domainByTrait = {},
      traits = d3.keys(data[0]).filter(function(d) { return d !== "Iclevel"; }),
      n = traits.length;

  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
  });

  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);

  var brush = d3.svg.brush()
      .x(x)
      .y(y)

  var svg = d3.select("#vis").append("svg")
      .attr("width", size * n + padding +30)
      .attr("height", size * n + padding +30)
      .append("g")
      .attr("transform", "translate(" + padding + "," + (padding / 2 -10)+ ")");

  svg.selectAll(".x.axis")
      .data(traits)
      .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis")
      .data(traits)
      .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
      .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (d.i) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", "1em")
      .attr("font-size", "1.5em")
      .text(function(d) { return d.x; });

  cell.call(brush);

  // Add legend
  legend = svg.append("g")
    .attr("class","legendV")
    .attr("transform", "translate(660, -10)")
    .style("font-size","12px")
    .call(d3.legend.color()
    .scale(color));

  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 2)
        .style("fill", function(d) { return color(d.Iclevel); });
  }
});

function cross(a, b) {
  var c = [], n = a.length, m = b.length, i, j;
  for (i = 0; i < n; i++) for (j = 0; j < m; j++) c.push({x: a[i], i: i, y: b[j], j: j});
  return c;
}
