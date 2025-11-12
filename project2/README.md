# Data Acquisition and Processing:
What brings me even more joy than actually watching a movie is meticulously logging every single film I watch on Letterboxd. I wanted to create a data portrait from this information. Thankfully, Letterboxd allows you to export all of your data on file by navigating to settings. For this project, I worked with the “diary.csv” file that is automatically updated each time you write a review. 

Much of the information I wanted to access was already available in the dataframe columns. However, a significant amount of data could only be accessed from the TMDB. I applied for personal/academic use API credentials, so that I could access the database for each film. This allowed me to find the movie classifications of: genre, language, and runtime. When searching the database, results are sorted by popularity. So, I cleaned the titles and adjusted the search query to account for the release year. Despite this, one movie continues to be incorrect – House (1977) is continually misclassified as Beach House (1977). 

Additionally, TMDB API gave the ability to import every movie poster, which I then used for color palette analysis. I selected the top 3 colors from each movie’s poster with getpalette from the PIL library. From here, I ran a basic K-means clustering algorithm from scikit-learn to find the approximate color scheme groupings. I stored each palette (formatted as a list of RGB values) and the movie’s cluster classification in a new dataframe. 

I then exported 3 csv files for use in p5.js –  a full dataframe including genre, language and runtime, a smaller csv file of summary statistics, and the K-means color dataframe. 

# Development and Functionality:
I wanted to have multiple views of the data available to the viewer. One of my favorite projects for music listening stats is Receiptify, which outputs your top tracks in a grocery receipt format. Here is the GitHub for that: https://github.com/michellexliu/receiptify.git. Similarly, I knew that I wanted to have a general summary stats page that reported top genres, overall watchtime, and so on. 

Aside from very general statistics, I wanted to see if I could visualize and pattern recognize something more abstract, such as color palettes. In media signal processing, we learned to generate movie barcodes, where it is possible to extract the primary color values from scenes and lay them out in a barcode format. Initially, I planned to create a movie barcode for every entry in my diary. This would have been really computationally expensive, and also I was having a hard time accessing full length versions of movies. 

Instead, as described above, color palettes were extracted from each movie poster. The p5.js sketch shows the films in palette-sorted clusters. I also implemented a select feature that allows the user to view all of the movies with a common genre (only selected from the top 5 that are reported in summary stats).  



# Reflection/Further work:
I am interested in the possibility of making this project publicly available, similar to how Receiptify is. I think it would be very fun for people to view their overall stats, as well as their own color palette analysis of films. 

I originally planned to have a tertiary data visualization, based on common movie tags. In this graph, each movie would be an individual node, with a connection to other nodes with a common tag (tags are custom, mine include locations and the people who I watch movies with). This would create a weblike structure. If I have time in the future, I would really like to expand the project to include this other viewing mode. 
