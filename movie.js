// this is the java script file that deals with data manipulation
// no existing data yet, use TODO to mark things to be done

// class of movie data 
function mhelper( graph ){
    this.graph = graph;
    this.rate_min = 0;
    this.rate_max = 10;
    this.fgroup   = 8;
}

mhelper.prototype = {
    isFiltered: function( d ){
        return d.group == this.fgroup;
    },
    // get a filtered graph
    getgraph: function(){
        var nodes = this.graph.nodes;
        var res = { "nodes":[], "links":[] };
        var nmap = {}
        var ncnt = 0
        for( var i = 0; i < nodes.length; i ++ ){
            // TODO: more filter conditions
            if( this.isFiltered( nodes[i] ) ) continue;
            // add data to map
            nmap[ i ] =  ncnt; 
            res.nodes[ ncnt ] = nodes[i];
            ncnt ++;  
        }
                
        var links= this.graph.links;
        for( var i = 0; i < links.length; i ++ ){            
            if( links[i].source in nmap && links[i].target in nmap ){
                res.links.push( {"source":nmap[ links[i].source ], "target": nmap[ links[i].target ] } );
            }
        }
        return res;
    }
}; 
