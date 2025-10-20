## Concept 
This tool forces the user to vocally control their paintbrush. Horizontal movement is determined by the position of the mouse, but the vertical movement is dictated by frequency of the user's voice. Thus, the user must carefully modulate their voice in order to create any sort of vertical brushstroke. Additionally, brushstroke size is determined by volume and the color is user-selected with the GUI colorpicker. Due to the vocal controls, the resulting program is challenging and often frustrating to use. 

## Function
The screen is initially text, with basic instructions (isDrawing = false). Pressing space bar toggles to the drawing screen. If nothing is showing up on the screen, the user needs to click once with keypad/mouse to manually trigger the audio input to start. 

The basis for this tool is the built-in p5 js sound library. Audio input is read in from the computer's microphone. Volume is found with getlevel() function, and the fft.analyze() function is called in order to isolate the spectrum of frequencies. Within the draw function, smoothed volume and frequency are both calculated and assigned to their corresponding visual outputs. Curve smoothing logic involves using a "cursor" that gets very close to the target stroke, but generating a natural curve. For spacing purposes, points are sampled every N frames (set to be 3 currently). The brushstrokes are continually updated and displayed within draw.

The GUI colorpicker is very simple, defined with createColorPicker function. There is a brushstrokes class, which takes in the user-selected hue, saturation, and brightness (determined by GUI colorpicker). Brushstrokes includes the addPoint and display functions, as referenced within draw.


## Process 
I had a very specific concept in mind when starting this project, which I definitely had to tweak as I progressed! With audio, there was a clear disconnect between how I imagined the features of the audio being represented and the resulting visual. In the initial stages of development, I had all movement aspects controlled by sound features. Here, vertical movement still corresponded to frequency, but horizontal movement was controlled by volume. In an attempt to create smoother lines, I then tried to use the spectral centroid for vertical strokes, since it's the average of frequencies. This ultimately did not produce the intended visual effect. I also experimented with different mappings for the hue: for example, having it correspond to rate change of volume. However, I couldn't find a dynamic enough audio feature. All of the different controls started to get very muddled, so I ended up simplifying to the current version. 

As mentioned above, it was really challenging to scale audio features correctly. In the first prototype, all of the generated lines fell in the lower left hand quadrant of the screen since I couldn't figure out how to scale frequency and volume. Currently, the higher frequency range is relatively challenging to achieve vocally , but I find this to be a particularly interesting part of user interaction (forcing users to pitch their voice up as much as possible!).

Another very challenging aspect to this project was creating fluid strokes, rather than harsh jumps between frequencies. For a long time, all of the points were connected by sharp angles, so that a lot of triangles and square shapes emerged. I didn't like this from an aesthetic standpoint. I used AI to help create smoother curves and eventually got a "good enough" visual.   

## Areas for Improvement/Future Additions
Cohesive aesthetic quality: I would ultimately prefer a more "painterly" appearance, where brushtrokes fade into one another. I am also interested in "animating" brushstrokes by storing them in an array, working off the animation examples presented in class. 

I was thinking about implementing a backspace or erase button. However, I ultimately decided not to include one. This is both due to time constraints, as well as the conceptual basis of audio being permanent and irreversible.  
