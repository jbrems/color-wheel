# Color wheel
A rudimentary color picker made with some Javascript and an HTML canvas 
element. [[Live demo]](https://jbrems.github.io/color-wheel/index.html)

<img src="https://jbrems.github.io/color-wheel/readme-img/color_wheel.png" width="400" height="300" alt=""/>

## Explanation

### 36 000 dots
The color wheel is drawn with 36 000 dots in different colors arranged in a
circle. Each 1° segment of the wheel represents a single hue and the
saturation of the color increases with the distance from the center of the
circle. Since there are 360 degrees in a circle (corresponding with 360 hues)
and since the saturation is expressed in percentages of which there are 100
we get 360 * 100 = 36 000 dots while working with integers.

### The color wheel
To draw these 36 000 dots in a circle pattern we make use of the sine 
function to determine the y value, and the cosine function to determine the
x value. In javascript the `Math.sin` and `Math.cos` functions expect the
angle in radians, so we need to do a quick conversion from degrees to radians
. A full circle is 360 degrees or 2π radians.

![](https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Sinus_und_Kosinus_am_Einheitskreis_1.svg/250px-Sinus_und_Kosinus_am_Einheitskreis_1.svg.png)  
*Image from wikimedia.org*

We use the saturation as the radius of our circle for each iteration
(0 - 100).

The color wheel consists of 100 circles with varying radius based on the
saturation. If we draw every 5th saturation circle, the wheel would look like
this.

<img src="https://jbrems.github.io/color-wheel/readme-img/saturation_circles.png" width="300" height="300" alt=""/>.  

Another way we can define the color wheel is by 360 1° segments with a 
different color. The angle (0 - 360) defines the hue (0 - 360) of the color.
If we draw every 5th hue segment, the wheel would look like this.

<img src="https://jbrems.github.io/color-wheel/readme-img/hue_slices.png" width="300" height="300" alt=""/>.  

The first color in the hue scale (value 0) is red and lies directly to the
right of the center of the wheel. This makes sense since we generally measure
angles relative to the positive x axis.

![](https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/TrigFunctionDiagram.svg/220px-TrigFunctionDiagram.svg.png)  
*Image from wikimedia.org*

### The color picker
When you hover over (or tap) a color in the color wheel its information is
displayed in the top left corner of the canvas. To achieve this, we need to
determine the color based on the relative x and y values of the cursur.

#### Saturation
Determining the saturation of the color based on the x and y values is quite
straight forward. We just need to calculate the distance of that point to the
center of the wheel which is conveniently positioned at the center of the
canvas. To calculate the distance between 2 points on a 2D plain we use the
Pythagorean theorem a² + b² = c² where a is the absolute difference in x 
values of the point and the center, b is the absolute difference y values and
the resulting c is the distance from the center of the wheel.

![](https://www.mathsisfun.com/algebra/images/dist-2-points-b.gif)  
*Image from mathsisfun.com*

#### Hue
To determine the hue of the color based on the x value of the cursor we need
to inverse the cosine function we used to calculate the position of the dot
in the color wheel. If we want to base ourselves on the y value we have to
inverse the sine function. In this case we use the x value, and we quickly
notice that there are always 2 colors for every given x value and distance
from the center of the wheel. To get around this issue, we add a check to
determine whether the cursor is above or below the vertical middle (y) of the
wheel, and we inverse the hue value of the color when the cursor is below.

<img src="https://jbrems.github.io/color-wheel/readme-img/2_colors_for_x.png" width="300" height="300" alt=""/>.  

If we base ourselves on the y value to determine the hue we will find 2
colors for every given y value and distance from the center, and we need to
adapt the hue value based on the position of the cursor to the left or right
of the horizontal middle (x) of the wheel.

### Color notations
For converting the colors in HSL (hue, saturation, lightness) notation to
RGB (red, green, blue) we use the formula as explained at
https://www.rapidtables.com/convert/color/hsl-to-rgb.html. To convert the
RGB value to the hexadecimal notation we just need to convert the base 10
integers (0 - 255) representing the red, green and blue values to their 
hexadecimal equivalent.

