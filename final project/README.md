# Concept
Extend Project 2, an interactive representation of movie watching history, providing insight into two features: 1. color palette/genre trends, 2. node representation of common locations/people (looks like a web, with the edges being shared tags).

Visual extensions: 1. Improving the current representation of color trends by integrating the actual palette into k-means clustering space (just centroids? Or for each point?)   2. Adding an additional mode with node connections based on tags 3. Making the interface more visually appealing (custom fonts, formatting…)

Universality: anyone can easily use the tool with their own data

# Key technical considerations: 
still working in p5.js to generate the visuals. However, instead of doing preprocessing in a separate notebook, will integrate. Either: Javascript preprocessing in browser (haven’t done this before), or Python backend (also haven’t done this. Does anyone have advice…?)

# Key design considerations: 
needs to be visually interpretable and engaging, so that user understands what they are seeing and feels like it provides useful insight 

# Success: 
viewers are entertained and drawn to use this tool

# Biggest challenges: 
API issues: ideally, user could search for their username. However, Letterboxd does not provide free public API for diary data - have to apply/pay :( 
Integrating preprocessing - see above

