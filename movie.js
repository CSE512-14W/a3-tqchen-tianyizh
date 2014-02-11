// this is the java script file that deals with data manipulation
// no existing data yet, use TODO to mark things to be done

// class of movie data 
function mhelper( graph ){
    this.graph = graph;
    this.rate_min = 0;
    this.rate_max = 10;
    this.fgroup   = 0;
    this.maxknn   = 2;
    this.ratemax = 10;
    this.ratemin = 0;
    this.popmax   = 240;
    this.popmin   = 0; 
    this.knntype  = 'Jaccard';
    this.sizetype = 'rtNumReview';
    this.gmap = {}
    for( var i = 0; i < graph.genre.length; i ++ ){
        this.graph.genre[i].selected = true;
        this.gmap[ graph.genre[i].gid ] = true;
    }
}

mhelper.prototype = {
    set_fgroup: function( r ){
        this.fgroup = r;
    },
    chk_fgroup: function( d ){
        return !this.gmap[ d.gid ];
    },
    chk_rate: function( d ){
        var r = d.rtAvgRating;
        return r < this.ratemin || r> this.ratemax;
    },
    chk_pop: function( d ){
        var r = d.rtNumReview;
        return r < this.popmin || r> this.popmax;
    },
    isFiltered: function( d ){
        if( this.chk_fgroup( d ) ) return true;
        if( this.chk_rate( d ) ) return true;
        if( this.chk_pop( d ) ) return true;
        return false;
    },
    updateknn: function( v ){
        this.maxknn = v;
    },
    highlight_node: function( v, node, link ){
        node.style( "fill-opacity", 
                    function(d) {  
                        if( d.nid == v.nid ) return 1.0;
                        else return 0.2;
                    });

        link.style( "fill-opacity", 
                    function(d) {  
                        if( d.x1 == v.nid|| d.x2 == v.nid ){
                            return 1.0;
                        }
                        else return 0.0;
                    })
            .style( "stroke-width",
                    function(d) {  
                        if( d.x1 == v.nid|| d.x2 == v.nid ){
                            return 3.0;
                        }
                        else return 0.0;
                    });
    },
    recover_node: function( v, node, link ){
        node.style( "fill-opacity", 1 );
        link.style( "stroke-width", 1.5 );
    },    
    update_ratefilter: function( rmin, rmax ){
        this.ratemin = rmin;
        this.ratemax = rmax;
    },
    update_popfilter: function( rmin, rmax ){
        this.popmin = rmin;
        this.popmax = rmax;
    },
    getcharge: function( d ){
        return -50*this.maxknn;
    },
    num_genre: function(){
        return this.graph.genre.length;
    },
    list_genre: function(){
        var res = [];
        var genre = this.graph.genre;
        for( var i = 0; i < genre.length; i ++ ){
            res.push( {"name": genre[i].name, "gid":genre[i].gid, "selected" : this.gmap[genre[i].gid] } );
        }
        return res;
    },
    click_genre: function( d ){
        this.gmap[ d.gid ] = !this.gmap[ d.gid ];     
        d.selected = this.gmap[ d.gid ];
    },
    opacity_genre: function( d ){
        if( d.selected ) return 1;
        else return 0.2;
    },
    getsize: function( d ){
        if( this.sizetype == 'rtNumReview' ){
            return Math.sqrt( d.rtNumReview ) * 0.7;
        }else{
            return d.rtAvgRating;
        }
    },
    // get a filtered graph
    getgraph: function(){
        var nodes = this.graph.nodes;
        var res = { "nodes":[], "links":[] };
        var nmap = {}
        var ncnt = 0
        for( var i = 0; i < nodes.length; i ++ ){
            if( this.isFiltered( nodes[i] ) ) continue;
            // add data to map
            nmap[ nodes[i].nid ] =  ncnt; 
            res.nodes[ ncnt ] = nodes[i];
            ncnt ++;  
        }
                
        var links = this.graph.edgep;
        if( this.knntype != 'Pearson'){
            var links = this.graph.edgen;
        }
        for( var i = 0; i < links.length; i ++ ){            
            if( links[i].source in nmap && links[i].target in nmap && links[i].knn < this.maxknn ){          
                res.links.push( {"source":nmap[ links[i].source ], "target": nmap[ links[i].target ],  
                                 "x1": links[i].source, "x2":links[i].target } );
            }
        }
        return res;
    }
}; 
