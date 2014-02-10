// this is the java script file that works creates the network
// no existing data yet, use TODO to mark things to be done

var width = 860;
var height = 800;
var barWidth = 90;
var barHeight = 20;

var marginKNN = {top: 20, right: 10, bottom: 20, left: 10};
var brushKNNWidth = 250 - marginKNN.left - marginKNN.right;
var brushKNNHeight = 50 - marginKNN.top - marginKNN.bottom;

var color = d3.scale.category20();
var colorList = [];
for( var i = 0; i < 20; i ++ ){
    colorList.push( color(i) );
}

var force = d3.layout.force()
    .charge( function (d){ return -150; } )
    .linkDistance( 30 )
    .size( [width, height] )
    .on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
            
            node.attr("cx", function(d) { return d.x; } )
                .attr("cy", function(d) { return d.y; } )
        });

var svg = d3.select("#netgraph").append("svg")
    .attr("width", width)
    .attr("height", height);

var link = svg.selectAll(".link");
var node = svg.selectAll(".node");
//---------tool tips------------
var tooltip = d3.tip()
    .attr("class", "d3-tip")
    .offset( [-10, 0] )
    .html( function( d ){
        var content = "<span>" + "" + d.title + "</span></br></br>";
        content += "<span>" + "Rotten Tomato Rating: " + d.rtAvgRating +"</span></br></br>";
        content += "<span>" + "Rotten Tomato Popularity: " + d.rtNumReview +"</span></br></br>";
        content += "<span>" + "Director: " + d.director +"</span>";        
        return content;
    } );
svg.call( tooltip )
// show detailed text
var showNodeInfo = function( d, i ){
    tooltip.show(d,i);
};
var hideNodeInfo = function( d, i ){
    tooltip.hide(d,i);
};

// legend for genre
var legend = d3.select("#genre_legend").append("svg")
    .attr("width", barWidth*2);
var bar = legend.selectAll('g');

//------------------------------------
// user click, mark one node as fixed
//------------------------------------
var dblClickNode = function( d ){
    // reset the other nodes to be false
    nodes = force.nodes()
        .forEach( function (d) { d.fixed = false; } );    
    d.fixed = true;
    d.px = d.x = width / 2;
    d.py = d.y = height / 2;
    force.start();
}
// brush for range
var marginRate = {top: 20, right: 10, bottom: 20, left: 10};
var brushRate = new brushSlider( marginRate, 200, 60, "#rate_brush", [ 0, 10] );

// brush adapted from  from example in 
var xKNN = d3.scale.linear()
    .domain([1,10])
    .range([0, brushKNNWidth])
    .clamp(true);
var brushKNN = d3.svg.brush()
    .x(xKNN)
    .extent([0, 0]);
var brushKNNGraph = d3.select("#knn_brush").append("svg")
    .attr("width", brushKNNWidth + marginKNN.left + marginKNN.right )
    .attr("height", brushKNNHeight + marginKNN.top+ marginKNN.bottom )
    .append("g")
    .attr("transform", "translate(" + marginKNN.left + "," + marginKNN.top + ")");

brushKNNGraph.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + brushKNNHeight/ 2 + ")")
    .call( d3.svg.axis()
           .scale(xKNN)
           .orient("bottom")
           .tickFormat(function(d) { return d; })
           .tickSize(0)
           .tickPadding(12));

var sliderKNN = brushKNNGraph.append("g")
    .attr("class", "slider")
    .call(brushKNN);
sliderKNN.selectAll(".extent,.resize")
    .remove();
sliderKNN.select(".background")
    .attr("height", brushKNNHeight );

var handleKNN = sliderKNN.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate("+ brushKNNHeight  + ")")
    .attr("r", 9);

sliderKNN
    .call(brushKNN.event)
    .transition() 
    .duration(750)
    .call(brushKNN.extent([2, 2]))
    .call(brushKNN.event);

//------------------------------------
// helper functions
//------------------------------------

d3.json( "data/movie.json", function(error, gdata) {
    var helper = new mhelper( gdata );    

    var update = function( is_init ){
        var graph = helper.getgraph();
        force
            .nodes( graph.nodes )
            .links( graph.links )
            .charge( function (d){ return helper.getcharge(d); } )
            .start()
        link = link.data( graph.links );
        
        link.exit().remove();
        link.enter().append("line")
            .attr( "class", "link" );
    
        node = node.data( graph.nodes );
        
        node.exit().remove();
        node
            .enter().append("circle")
            .attr( "class", "node" )
            .call( force.drag )
            .on("mouseover", showNodeInfo )
            .on("mouseout", hideNodeInfo )
            .on("dblclick", dblClickNode );
        node
            .attr( "r", function(d) { return helper.getsize(d); } )
            .style("fill", function(d) { return colorList[ d.gid ]; });

        // legend
        legend.attr("height", barHeight * helper.num_genre()+10 );
        bar = bar
            .data( helper.list_genre() );    
        bar.exit().remove();
        var barx = bar.enter().append("g");
        barx
            .attr("transform", function(d, i) { return "translate(0," + (i * barHeight+4) + ")"; })
            .append("rect")
            .on( "click", function( d ){
                helper.click_genre(d);
                force.stop();
                update( false );
            })
            .attr("width", barWidth )
            .attr("height", barHeight - 1.5 )
        bar
            .style("fill", function(d){ return colorList[d.gid]; } )
            .style("fill-opacity", function(d){ return helper.opacity_genre( d ); } );
        barx
            .append("text")
            .on( "click", function( d ){
                helper.click_genre(d);                
                force.stop();
                update( false );            
            })
            .attr("x", function(d) { return barWidth+2; })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });

        if( !is_init ) return;
       
        brushKNN.on( "brush",
                     function () {
                         var value = brushKNN.extent()[0];                
                         if (d3.event.sourceEvent) { 
                             value = xKNN.invert(d3.mouse(this)[0]);
                             brushKNN.extent([value, value]);
                         }                         
                         handleKNN.attr("cx", xKNN(value));
                         helper.updateknn( value );
                         force.stop();
                         update( false );                   
                     });
        
        // the following only needs to be called during initialization
        // start show the graph                 
        // add event listeners
        // genere change
        d3.selectAll("#knn_select")
            .on( "change", function (){
                helper.knntype = this.value;
                force.stop();
                update( false );
            });

        d3.selectAll("#size_select")
            .on( "change", function (){
                helper.sizetype = this.value;
                force.stop();
                update( false );
            });
    }
    update( true );
}); 
