function brushSlider( margin, width, height, tag, domain ){
    this.margin = margin;
    this.width = width - margin.left - margin.right;
    this.height = height - margin.top - margin.bottom;
    this.x = d3.scale.linear()
        .domain( domain )
        .range([0, this.width])
        .clamp(true);
    
    this.brush = d3.svg.brush()
        .x(this.x)
        .extent( domain );

    this.svg = d3.select( tag ).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");    

    this.svg.append("rect")
        .attr("class", "grid-background")
        .attr("width", width)
        .attr("height", height);    
    this.svg.append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
              .scale(this.x)
              .orient("bottom")
              .tickSize(-height)
              .tickFormat(""))
        .selectAll(".tick")
        .classed("minor", function(d) { return d; });

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
              .scale(this.x)
              .orient("bottom")
              .tickPadding(0))
        .selectAll("text")
        .attr("x", 6)
        .style("text-anchor", null);    

    this.gBrush = this.svg.append("g")
        .attr("class", "brush")
        .call(this.brush)
        .call(this.brush.event);
    
    this.gBrush.selectAll("rect")
        .attr("height", height);
}


