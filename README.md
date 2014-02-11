Team Members:
Tianqi Chen: tqchen@uw.edu
Tianyi Zhou: tianyizh@uw.edu

Project Name：MovieNet - Interactive Visualization of Movie Similarity Graph

The data domain for our visualization a dataset combining the 10000054 ratings of 10681 movies by 71567 users from MovieLens 10M dataset and the meta information of those movies from HetRec 2011 dataset. We visualized movies as a graph of networks. The most similar movies of a movie are visualized by the links among them. The size of links encodes the magnitudes of similarities. 

User can manually select an arbitrary movie in the graph, and immediately find out the most similar movies in the same or different genres, as well as the detailed information of movies. User can also adjust the minimum average score and popularity of movies shown in the graph. Thus MovieNet provides an effective movie recommendation tool for users.

Running Instructions
Live Version:
http://cse512-14w.github.io/a3-tqchen-tianyizh/

Story Board:
https://www.dropbox.com/s/xy7rgblf4ob6iu5/a3-storyboard.pdf

Changes between Storyboard and the Final Implementation:

The changes we applied to final visualization includes: 

The number of movies in the dataset is still too large to show in a normal browser, so we select the top 200 movies from the full dataset with highest popularities and allow filtering of movies based on these two metrics.For the same reason, we allow the user to select 1-10 nearest neighbors for each movie.

Instead of allowing users to select a single genre of movies displaying in the graph, we allow the users to click arbitrary genres and remove the selected ones thus we can show different combination of different genres. This is better than selecting single genre in storyboard.

Due to the limit of space, we only display the movie name, rotten tomatoe ratings, rotten tomatoe popularity, and director as the meta information for each movie in the floating window. 

Instead of filtering by minimum average rating or popularity, we give more freedom to users to select arbitrary range of average rating or popularity to display in the graph.

Development Process

The visualization development started with discussion about how to develop interactive visualization tool to aid movie recommendation. Inspired from the visualization of social networks, we think it is interesting to show tens of thousands of movies as a network graph and encode their similarities by the edges in the graph. Then we tried different kinds of similarities measures estimated from ratings and find out they work pretty promising for recommendation. But the problem is how to show the recommendation result in the large graph.Thus we designed the "mouse hover, auto move, highlight, and floating window" style to show the recommended most similar movies as well as the movie details based on the movie user clicks. After this, we note that the users might expect to rule out some movies before selecting, so we make the system allowing users to at first define the minimum average rating and popularity of displayed movie, as well as the number of recommended movies. In addition, we allow the users to select a subset of movie genres to display in the graph.

The most time consuming parts are system implementation and data preprocessing. A total 51 hours are separated among teammates as follow.

Tianqi Chen:
-Major contribution to data selection & ideas: 4 hours
-Major contribution on system implementation: 20 hours
-Minor contribution to writeups: 3 hours.

Tianyi Zhou:
-Major contribution to data selection & ideas: 4 hours
-Major contribution on data proprocessing: 9 hours.
-Major contribution to sketching storyboard & system design: 6 hours.
-Major contribution on writeups: 5 hours.
