// var SHOW_BORDER, SHOW_TITLES, SHOW_IMAGES = true, SHOW_COPYRIGHT;
// var FONT_18 = "Modern-Regular-18.vlw", FONT_15 = "Modern-Regular-15.vlw", FONT_12 = "Modern-Regular-12.vlw", FONT_13 = "Modern-Regular-13.vlw", FONT_14 = "Modern-Regular-14.vlw";


var ROTATE, SHOW_GUIDES, UPPERCASE, DO_FADES = true,
    BLACK_BG = true;
var NUM_LG = 3,
    CUBE_ALPHA = 64,
    NUM_CUBES = 38,
    WALL_OFFSET = 15,
    MAX_CHARS_PER_LINE = 65,
    MAX_LINE_WIDTH = 500,
    TEXT_X_START = 200,
    TEXT_Y_START = 440;
// var DELIM = "<", SPC = " ", HEX_BG = "181828";

var INFO_IMAGES = ["instructions.png", "roulette.png", "copyright.png"];

//color
// var DEFAULT_BG, TEXT_COLOR, INFO_COLOR, HOT_COLOR;

var tex; //texture
var info = [],
    currentText = [],
    textFromFile;

var fadeOuts, rtLines;

var currentTextIdxs = [],
    largeCubes = [],
    cubes = [];

var textColor, hotColor, bgColor,
    // rotateX=[0,0,0], rotateY=[0,0,0], rotateZ=[0,0,0],
    selectedCubeIdx = -1,
    selectedParentIdx = 0,
    lgCubeSize = 140,
    maxSize = 9,
    firstTextCreation = true,
    spaceWidth, leading,
    currentSelectedWord = [],
    hotWords = [],
    homeUrl;

var colors = [
    '#f9f9f9', // white (text)
    '#eaf9f2', // light-teal
    '#f4dc00', // yellow
    '#6f84b1', // slate
    '#cee9e2', // teal
    '#de5e05', // orange
    '#bc4e8d', // pink
    '#1d6a0a', // green
    '#21378a', // blue
    '#7c0b00' // red      
];

// var defaultFont;

var imgs = [],
    blank; // test
var cubes = [],
    largeCubes = [];

// BGM
var mySound;

function preload() {

    // defaultFont = loadFont("data/"+FONT_18);

    //load images
    // words
    for (var i = 0; i < 109; i++) {
        var idx = i + 1;
        imgs[i] = loadImage("../src/data/" + idx + ".png");
    }

    blank = loadImage("../src/data/transparent.png");

    // info images
    // text

    soundFormats('mp3', 'ogg');
    mySound = loadSound('../src/data/rpeg.mp3');


}

function setup() {
    createCanvas(900, 670, WEBGL);
    frameRate(30);
    mySound.loop();

    //color palette
    // initializeColors();


    // textFont(defaultFont);]
    // for (var i = 0; i < riLines.length; i++)
    //   riLines[i] = new LinkedList();

    // spaceWidth = textWidth(SPC);
    // leading = textAscent()+textDescent()+8; 

    // RiText.disableAutoDraw();
    // RiText.setDefaultFont(FONT_18);

    // initColors();
    // updateText();
    // createTitles();

    createCubes();

}

function draw() {

    background(200);


    drawCubes();
    // if (mousePressed && mouseY > height * .2 && mouseY < height * .6)
    //     handleZoom();
    // TODO

}

function drawCubes() {

    for (var j = 0; j < NUM_LG; j++) {
        push();

        var yOff = height / 3;
        switch (j) {
            case 0:
                yOff = height / 3 + 40;
                break;
            case 2:
                yOff = height / 3 + 55;
                break;
        }
        translate(largeCubes[j].x - width / 2, yOff - height / 2, 0); // -130);

        // rotate everything, including external large cube
        rotateX(rotateX[j] = (frameCount * PI / 225 + j));
        rotateY(rotateY[j] = (frameCount * PI / 250 - j));
        rotateZ(rotateZ[j] = (frameCount * PI / 275 + 2 * j));

        //ellipse(0,0,210,210);        

        for (var i = 0; i < cubes[j].length; i++) {
            var tc = cubes[j][i];
            push();

            if (!tc.selected && !tc.stopped)
                translate(tc.x, tc.y, tc.z);

            if (!tc.selected && tc.rotating) {
                rotateX(frameCount * PI / tc.xRot);
                rotateY(frameCount * PI / tc.yRot);
                rotateZ(frameCount * PI / tc.zRot);
            }
            if (tc.scale > 1 && !tc.selected)
                tc.setScale(.95);

            scale(tc.scale);
            tc.draw();
            pop();

            // adjust the speeds
            cubes[j][i].x += cubes[j][i].xSpeed;
            cubes[j][i].y += cubes[j][i].ySpeed;
            cubes[j][i].z += cubes[j][i].zSpeed;

            // check the walls
            if (cubes[j][i].x > lgCubeSize / 2 - WALL_OFFSET || cubes[j][i].x < -lgCubeSize / 2 + WALL_OFFSET)
                cubes[j][i].xSpeed *= -1;
            if (cubes[j][i].y > lgCubeSize / 2 - WALL_OFFSET || cubes[j][i].y < -lgCubeSize / 2 + WALL_OFFSET)
                cubes[j][i].ySpeed *= -1;
            if (cubes[j][i].z > lgCubeSize / 2 - WALL_OFFSET || cubes[j][i].z < -lgCubeSize / 2 + WALL_OFFSET)
                cubes[j][i].zSpeed *= -1;
        }
        largeCubes[j].draw();

        pop();
    }
}

var PointUV = function(x, y, z, u, v) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.u = u;
    this.v = v;
}

var Cube = function(name, sz, p) {

    var w, h, d, vertices = [];

    // var x, y, z,  
    //     xRot, yRot, zRot,
    //     xSpeed, ySpeed, zSpeed,
    //     selected, stopped, rotating = true;  

    this.tex = p;
    this.id = name;
    this.scale = 1;
    w = h = d = sz;

    //front
    vertices[0] = new PointUV(-w / 2, -h / 2, d / 2, 0, 0);
    vertices[1] = new PointUV(w / 2, -h / 2, d / 2, 1, 0);
    vertices[2] = new PointUV(w / 2, h / 2, d / 2, 1, 1);
    vertices[3] = new PointUV(-w / 2, h / 2, d / 2, 0, 1);

    //left
    vertices[4] = new PointUV(-w / 2, -h / 2, d / 2, 0, 0);
    vertices[5] = new PointUV(-w / 2, -h / 2, -d / 2, 1, 0);
    vertices[6] = new PointUV(-w / 2, h / 2, -d / 2, 1, 1);
    vertices[7] = new PointUV(-w / 2, h / 2, d / 2, 0, 1);

    //right
    vertices[8] = new PointUV(w / 2, -h / 2, d / 2, 0, 0);
    vertices[9] = new PointUV(w / 2, -h / 2, -d / 2, 1, 0);
    vertices[10] = new PointUV(w / 2, h / 2, -d / 2, 1, 1);
    vertices[11] = new PointUV(w / 2, h / 2, d / 2, 0, 1);

    //back
    vertices[12] = new PointUV(-w / 2, -h / 2, -d / 2, 0, 0);
    vertices[13] = new PointUV(w / 2, -h / 2, -d / 2, 1, 0);
    vertices[14] = new PointUV(w / 2, h / 2, -d / 2, 1, 1);
    vertices[15] = new PointUV(-w / 2, h / 2, -d / 2, 0, 1);

    //top
    vertices[16] = new PointUV(-w / 2, -h / 2, d / 2, 0, 0);
    vertices[17] = new PointUV(-w / 2, -h / 2, -d / 2, 1, 0);
    vertices[18] = new PointUV(w / 2, -h / 2, -d / 2, 1, 1);
    vertices[19] = new PointUV(w / 2, -h / 2, d / 2, 0, 1);

    //bottom
    vertices[20] = new PointUV(-w / 2, h / 2, d / 2, 0, 0);
    vertices[21] = new PointUV(-w / 2, h / 2, -d / 2, 1, 0);
    vertices[22] = new PointUV(w / 2, h / 2, -d / 2, 1, 1);
    vertices[23] = new PointUV(w / 2, h / 2, d / 2, 0, 1);

    this.vertices = vertices;


}

Cube.prototype.draw = function() {

    if (this.tex == null)
        noFill();
    else
        fill(250);

    //stroke for shapes in 3D not yet implemented
    // stroke(230,230,230); 

    var vt = this.vertices;

    for (var i = 0; i < 6; i++) {
        beginShape();
        if (this.tex != null) {
            tint(255, CUBE_ALPHA);
            texture(this.tex);
        }
        for (var j = 0; j < 4; j++)
            vertex(vt[j + 4 * i].x, vt[j + 4 * i].y, vt[j + 4 * i].z, vt[j + 4 * i].u, vt[j + 4 * i].v);
        endShape(CLOSE);
    }

}

var TextCube = function(id, cube, sz, texture) {
    Cube.apply(this, [id, sz, texture]);

    this.tc = new Array(6);

    for (var i = 0; i < this.tc.length; i++) {
        this.tc[i] = color(colors[Math.floor(random(colors.length))]);
    }
    this.parent = cube;
}

TextCube.prototype = {
    toString: function() {
        return "[" + this.parent.id + "," + id + "]=" + scale;
    },

    setScale: function(factor) {
        if (factor > 1 && this.scale >= maxSize)
            return false;
        if (factor < 1 && this.scale <= 1)
            return false;
        this.scale *= factor;
        return true;
    },

    draw: function() {
        noStroke();
        var vt = this.vertices;
        for (var i = 0; i < 6; i++) {
            fill(255);
            beginShape();
            tint(this.tc[i]);
            texture(this.tex);

            for (var j = 0; j < 4; j++)
                vertex(vt[j + 4 * i].x, vt[j + 4 * i].y, vt[j + 4 * i].z, vt[j + 4 * i].u, vt[j + 4 * i].v);
            endShape(CLOSE);
        }
    }
};

function createCubes() {
    var idx = 0;

    for (var j = 0; j < NUM_LG; j++) {
        largeCubes[j] = new Cube(NUM_LG, lgCubeSize, blank);
        largeCubes[j].x = (j + 1) * width / 4;
        //console.log("CUBE "+j+":\n");
        cubes[j] = new Array(NUM_CUBES);
        for (var i = 0; i < NUM_CUBES; i++) {
            var cubeSz = 15; /// random(15, 15);

            cubes[j][i] = new TextCube(i, largeCubes[j], cubeSz, imgs[i]);

            //console.log(" "+(i+1)+".png");

            //cubes[j][i].x = largeCubes[j].x; 
            cubes[j][i].x = cubes[j][i].y = cubes[j][i].z = 0;

            cubes[j][i].xSpeed = random(-5, 5);
            cubes[j][i].ySpeed = random(-5, 5);
            cubes[j][i].zSpeed = random(-5, 5);

            cubes[j][i].xRot = random(40, 100);
            cubes[j][i].yRot = random(40, 100);
            cubes[j][i].zRot = random(40, 100);
        }
    }
}

/*********************************************/
/**** INTERACTION *******/
/*********************************************/
function handleZoom() {
    if (selectedCubeIdx < 0) {
        console.log(selectedParentIdx, cubes[selectedParentIdx]);
        selectedCubeIdx = Math.floor(Math.random(cubes[selectedParentIdx].length));
        selectCube(selectedParentIdx, selectedCubeIdx);
    }
    cubes[selectedParentIdx][selectedCubeIdx].setScale(1.1);
}

function selectCube(parentIdx, idx) {
    if (idx >= 0) {
        //console.log("SELECTED ["+parentIdx+", "+idx+"]");
        cubes[parentIdx][idx].selected = true;
    }
}

function getSelected(i) {
    var selectedIdx = -1;
    var all = cubes[i];
    for (var j = 0; j < all.length; j++)
        if (all[j].selected) selectedIdx = j;
    return selectedIdx;
}

function clearAll() {
    selectedParentIdx = -1;
    selectedCubeIdx = -1;
    for (var j = 0; j < NUM_LG; j++)
        clearCube(j);
}

function clearCube(j) {
    for (var i = 0; i < cubes[j].length; i++)
        cubes[j][i].selected = false;
}

// function updateText() {
//     if (firstTextCreation) {
//         var positions = [Math.floor(random(NUM_CUBES)),
//             Math.floor(random(NUM_CUBES)), Math.floor(random(NUM_CUBES))
//         ];
//         createRiTexts(positions);
//         firstTextCreation = false;
//     } else {
//         var newText = textFromFile[selectedParentIdx][selectedCubeIdx];
//         currentTextIdxs[selectedParentIdx] = selectedCubeIdx;
//         this.currentSelectedWord[selectedParentIdx] = hotWords[selectedParentIdx][selectedCubeIdx];
//         //console.log("*** ["+selectedParentIdx+","+selectedCubeIdx+"] currentSelectedWord["+selectedParentIdx+"]='"+currentSelectedWord[selectedParentIdx]+"' newText="+newText+"\n");
//         this.handleTextReplace(newText, selectedParentIdx);
//     }
// }

// function handleTextReplace(newText, position) {
//     var toAdd = null;
//     switch (position) {
//         case 0:
//             toAdd = handleReplaceFirst(newText);
//             fadeOutAt(0);
//             break;
//         case 1:
//             //this.currentSelectedWord[1] = hotWords[1][selectedCubeIdx];
//             for (var i = 0; i < NUM_LG; i++)
//                 fadeOutAt(i);
//             createRiTexts(currentTextIdxs);
//             return;
//         case 2:
//             toAdd = handleReplaceLast(newText);
//             fadeOutAt(2);
//             break;
//     }

//     // add all the replacements
//     for (var i = toAdd.length - 1; i >= 0; i--) {
//         var rtw = toAdd[i]; //(RiTextWords)
//         if (position == 0 && i == 0) {
//             rtw.x -= spaceWidth;
//             //console.log("ADDED SPC: ["+rtw.getText()+rtw.getText()+"]");
//         }
//         riLines[position].add(rtw);
//     }

//     //printLineMap();        
// }

// function handleReplaceLast(newText) {
//     // console.log("NEW: " + newText);
//     var next = null,
//         toAdd;
//     var remaining = newText;

//     var lastOld = lastRiTextFor(1);
//     var firstNew = firstRiTextFor(2);

//     var maxWidth = ((TEXT_X_START + MAX_LINE_WIDTH) - firstNew.x),
//         firstLine = trimToWidth(remaining, maxWidth);

//     if (firstLine.length() > 0) {
//         next = new RiText(this, firstLine, firstNew.x, lastOld.y);
//         if (next.x == TEXT_X_START) {
//             //console.log("HANDLING CORNER #1 ***");
//             next.y += leading;
//         }
//         addToPositionList(toAdd, next, 2);
//     }

//     if (firstLine.length() < remaining.length()) {
//         remaining = newText.substring(firstLine.length());
//         while (remaining.length() > 0) {
//             firstLine = trimToWidth(remaining, MAX_LINE_WIDTH);
//             var yAlign = firstNew.y;
//             if (next != null) {
//                 yAlign = next.y;
//             } else
//                 console.log("(" + selectedParentIdx + "," + selectedCubeIdx + ") HANDLING CORNER #2, next == null, using firstNew.y ***");
//             next = new RiText(this, firstLine, lastOld.x, yAlign + leading);
//             addToPositionList(toAdd, next, 2);

//             // are there any words left?
//             if (firstLine.length() >= remaining.length())
//                 break;
//             remaining = remaining.substring(firstLine.length());
//         }
//     }
//     Collections.reverse(toAdd);
//     return toAdd;
// }

// function handleReplaceFirst(newText) {
//     var toAdd;

//     // do the last line first
//     var next = null;
//     var remaining = newText;
//     var firstNew = firstRiTextFor(1);

//     var maxWidth = (firstNew.x - TEXT_X_START) + 1,
//         lastLine = reverseTrimToWidth(remaining, maxWidth);
//     if (lastLine.length() > 0) {
//         next = new RiText(this, lastLine, firstNew.x, firstNew.y, RIGHT);
//         addToPositionList(toAdd, next, 0);
//     }

//     // check if there are other lines if there are any
//     var numLeftOver = remaining.length() - lastLine.length();
//     if (numLeftOver > 0) {

//         // process the rest of the text in a loop
//         remaining = newText.substring(0, numLeftOver);
//         while (remaining.length() > 0) {
//             lastLine = reverseTrimToWidth(remaining, MAX_LINE_WIDTH);
//             var yAlign = next != null ? next.y : firstNew.y,
//                 xAlign = firstNew.x + textWidth(firstNew.getText());
//             next = new RiText(this, lastLine, xAlign + 5, yAlign - leading, RIGHT);
//             addToPositionList(toAdd, next, 0);

//             // are there any words left?
//             numLeftOver = remaining.length() - lastLine.length();
//             if (numLeftOver <= 0) break;
//             remaining = newText.substring(0, numLeftOver);
//         }
//     }
//     return toAdd;
// }


// function addToPositionList(toAdd, rt, position) {

//     var align = rt.alignment;
//     var text = rt.getText();
//     while (text.startsWith(" "))
//         text = text.substring(1);

//     while (text.endsWith(" "))
//         text = text.substring(0, text.length() - 1);

//     //console.log(position+"->("+text+")");
//     var next = new RiTextWords(this, text, rt.x, rt.y, align);
//     text = next.getText();
//     //console.log(position+": TEXT: "+text);

//     var hot = currentSelectedWord[position];
//     if (!firstTextCreation) {
//         if (hot == null)
//             console.log("Null hotword: " + " for " + text + "position=" + position);

//         var words = text.split(" ");

//         var isSelected = getSelected(position) > -1;

//         for (var i = 0; i < words.length; i++) {
//             if (isSelected && words[i].startsWith(hot))
//                 next.setColor(i, hotColor);
//             else
//                 next.setColor(i, textColor);
//         }
//     }

//     RiText.delete(rt);
//     next.align(align);
//     //if (align==LEFT && next.x == TEXT_X_START && next.getText());//.startsWith(SPC))
//     //next.x = next.x - spaceWidth;  // what about punctuation!?
//     //else if (align==RIGHT && next.getText().endsWith(SPC))
//     //next.x = next.x + spaceWidth;    
//     if (DO_FADES) {
//         next.setAlpha(0);
//         next.fadeIn(.5, 1);
//     }
//     toAdd.push(next);
// }

function mousePressed() {
    selectedParentIdx = 1;
    if (mouseX < width / 3)
        selectedParentIdx = 0;
    else if (mouseX > width * .66)
        selectedParentIdx = 2;
    // console.log(selectedParentIdx);
}

function mouseReleased() {
    if (selectedParentIdx > -1 && selectedCubeIdx > -1) { // do we have a selection      
        if (cubes[selectedParentIdx][selectedCubeIdx].scale < maxSize) {
            clear(selectedParentIdx);
            // unset the selected color here?
        } else
            updateText(); // TODO
    }
   
    selectedParentIdx = -1;
    selectedCubeIdx = -1;

}