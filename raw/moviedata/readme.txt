ScorePopularity.csv:
Format: ID Old_ID AvgScore NumRatings

100NNmovieID.csv: 
Format: ID Old_ID ID_NN1 ID_NN2 ... ID_NN100

100NNEdgeWeight.csv: 
Format: ID Old_ID Weight_NN1 Weight_NN2 ... Weight_NN100

movie_meta.dat:
From original hetrec2011-movielens dataset
Format: Old_ID Meta informations (name, ...)

movieID_meta.csv:
ID aligned with Old_ID in movie_meta.dat
Have same number of rows as movie_meta.dat
0 in ID means the corresponding movie should be removed from movie_meta.dat

Other pairs of "dat" and "csv" files have similar relationship

There are totally 10193 movies with all other attributes except:
director, country or actor information is possible to be not available.
