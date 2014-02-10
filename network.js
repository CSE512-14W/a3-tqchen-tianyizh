// this is the java script file that works creates the network
// no existing data yet, use TODO to mark things to be done

var width = 860;
var height = 800;

var color = d3.scale.category20();
var colorList = [];
for( var i = 0; i < 20; i ++ ){
    colorList.push( color(i) );
}

var force = d3.layout.force()
    .charge( function (d){ if( d.fixed ) return -2000; else return -200; } )
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
        if( !is_init ) return;
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
