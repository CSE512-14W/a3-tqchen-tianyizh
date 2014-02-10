import sys
# mk json data from the hecrec dataset


def loadmeta():
    meta = {}
    nfield = None

    # load a map that maps old id to movie 
    fi = open( 'moviedata/ScorePopularity.csv', 'r' ).read().split('\r')
    print len(fi)
    fi = fi[1:len(fi)]
    for l in fi:
        arr = l.split(',')
        mid = int( arr[1] )
        dat = {}
        dat["oldID"] = mid
        dat['nid']   = int( arr[0].strip() )
        dat['avgRating'] = arr[2].strip()
        dat['numRating'] = int( arr[3].strip() )
        meta[ mid ] = dat

    # directors
    fi = open( 'moviedata/movie_directors.dat' )
    fi.readline()
    ncnt = 0
    for l in fi:
        arr = l.split('\t')
        mid = int( arr[0] )
        if mid not in meta:
            continue
        dat = meta[ mid ] 
        dat["director"] = '\"'+arr[2].strip()+'\"'
        meta[ mid ] = dat
        ncnt += 1
    fi.close()
    for dat in meta.values():
        if 'director' not in dat:
            dat['director'] = 'unknown' 
    print 'ncnt=%d, dat=%d' % (ncnt, len(meta))    

    scnt  = 0
    ncnt  = 0
    # load a map that maps old id to movie 
    fi = open( 'moviedata/movies_meta.dat', 'r' )
    fi.readline()
    for l in fi:
        arr = l.split('\t')
        assert( nfield == None or len(arr) == nfield );
        mid   = int(arr[0])
        if mid not in meta:
            scnt += 1
            continue
        dat = meta[ mid ]
        dat["title"] = '\"'+arr[1].strip()+'\"'
        dat["year" ] = arr[5].strip()
        
        #dat["rtAvgRating"] = "\'"+arr[7].strip()+'\"'
        #dat["rtNumReview"] = "\'"+arr[8].strip()+"\'"
        
        if nfield == None:
            print dat
            nfield = len(arr)
        meta[ mid ] = dat        
        ncnt += 1
    fi.close()
    assert ncnt == len( meta )
    


    gmap = {}
    # load a map that maps old id to movie 
    ncnt = 0
    fi = open( 'moviedata/movie_genres.dat', 'r' )
    fi.readline()
    for l in fi:
        arr = l.split('\t')
        mid = int(arr[0])
        if mid not in meta:
            continue        
        dat = meta[ mid ]
        if 'genre' not in dat:
            gtype = arr[1].strip()
            if gtype == 'Short':
                continue
            if gtype not in gmap:
                gmap[ gtype ] = (1, len(gmap))
            else:
                gmap[ gtype ] = (gmap[gtype][0]+1, gmap[gtype][1])

            dat[ 'genre' ] = "\""+gtype+'\"'
            dat[ 'gid' ] = gmap[ gtype ][ 1 ]
            ncnt += 1
    print 'ncnt=%d, dat=%d' % (ncnt, len(meta))        
    fi.close()

    print 'skip %d movies' % scnt
    return meta, gmap

def remap_meta( meta, topn ):
    fmap = {}
    res = [ d for d in sorted( meta.values(), key = lambda x: -x['numRating'])  if 'gid' in d ]
    for d in res[ 0 : min(topn,len(res)) ]:
        fmap[ d['nid'] ] = d
    return fmap

def getknn( fname, fweight, fmap, topn ):
    edge = {}
    fi = open( fname, 'r' ).read().split('\r')
    fw = open( fweight, 'r' ).read().split()
    print len( fw)
    print len( fi )
    for i in xrange( 1 , len(fi) ):
        arr = fi[i].split(',')
        ewt = fw[i].split(',')
        assert( len(arr) == len(ewt))
        assert( len(arr) == 102)
        source = int( arr[0] )        
        if source not in fmap:
            continue
        ncnt = 0
        for i in xrange( 0, 100 ):
            target = int( arr[i+2] )
            weight = float( ewt[i+2] )
            if target not in fmap:
                continue
            #if source > target:
            #target, source = source, target
            key = (source, target)
            if key not in edge:
                edge[ key ] = (ncnt,weight)
            ncnt += 1
            if ncnt >= topn:
                break
    return edge

topnode = 150;
topedge = 50;

meta, gmap = loadmeta()
fmap = remap_meta( meta, topnode )
# remap gmap
gcnt = {}
for d in fmap.values():
    if d['gid'] not in gcnt:
        gcnt[ d['gid'] ] = 1
    else:
        gcnt[ d['gid'] ] += 1  
ggmap = {}
for k, v in gmap.iteritems():
    if v[1] in gcnt:
        ggmap[ k ] = (  gcnt[v[1]], v[1] )
gmap = ggmap
print gmap

edgep = getknn( 'moviedata/P100NNMovieID.csv', 'moviedata/P100NNEdgeWeight.csv', fmap, topedge )
edgen = getknn( 'moviedata/100NNmovieID.csv', 'moviedata/100NNEdgeWeight.csv', fmap, topedge )
print '%d nodes, %d edgep, %d edgen' %(len(fmap), len(edgep),len(edgen))

# write data 
fo = open( '../data/movie.json', 'w' )
fo.write('{\n');
# genere
fo.write('  \"genre\":[\n')
resg = ',\n'.join( ('    {\"name\":\"%s\", \"count\":%d, \"gid\":%d}' % (k,v[0],v[1]) ) for k,v in gmap.iteritems() )
fo.write( resg )
fo.write('\n  ],\n');

nodes = sorted( fmap.values(), key = lambda x: -x['numRating'] ) 
res = ',\n'.join( ('    {%s}' % ','.join( '\"%s\":%s' %(k, str(v)) for k, v in d.iteritems() )) for d in nodes )
fo.write('  \"nodes\":[\n')
fo.write( res )
fo.write('\n  ],\n');

# edgep
fo.write('  \"edgep\":[\n')
redgep = ',\n'.join( ('    {\"source\":%d, \"target\":%d, "knn":%d, \"value\":\"%f\"}' % (k[0],k[1],v[0],v[1]) ) for k,v in edgep.iteritems() )
fo.write( redgep )
fo.write('\n  ],\n');

# edgep
fo.write('  \"edgen\":[\n')
redgen = ',\n'.join( ('    {\"source\":%d, \"target\":%d, "knn":%d, \"value\":\"%f\"}' % (k[0],k[1],v[0],v[1]) ) for k,v in edgen.iteritems() )
fo.write( redgen )
fo.write('\n  ]\n');

fo.write('}\n');

fo.close()
