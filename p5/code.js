// let SHOW_BORDER, SHOW_TITLES, SHOW_IMAGES = true, SHOW_COPYRIGHT;
// let FONT_18 = "Modern-Regular-18.vlw", FONT_15 = "Modern-Regular-15.vlw", FONT_12 = "Modern-Regular-12.vlw", FONT_13 = "Modern-Regular-13.vlw", FONT_14 = "Modern-Regular-14.vlw";


let ROTATE, SHOW_GUIDES, UPPERCASE, DO_FADES = true,
    BLACK_BG = true;
let NUM_LG = 3,
    CUBE_ALPHA = 64,
    NUM_CUBES = 38,
    WALL_OFFSET = 15,
    MAX_CHARS_PER_LINE = 65,
    MAX_LINE_WIDTH = 500,
    TEXT_X_START = 200,
    TEXT_Y_START = 440;
// let DELIM = "<", SPC = " ", HEX_BG = "181828";

let INFO_IMAGES = ["instructions.png", "roulette.png", "copyright.png"];

//color
// let DEFAULT_BG, TEXT_COLOR, INFO_COLOR, HOT_COLOR;

let tex; //texture
let info = [],
    currentText = [],
    textFromFile;

let fadeOuts, rtLines;

let currentTextIdxs = [];

let textColor, hotColor, bgColor,
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

let colors = [
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

// let defaultFont;

let imgs = [],
    blank; // test
let cubes = [],
    largeCubes = [];
let selectedTextCubes = [];
let selectedTextCubesIdx = [];
// the selectedCubes should be draw fist among the textcubes or it will
// cover other cubes

let changingCubes = [];
// this array store cubes zooming, when the process is done they should be erased

// BGM
let mySound;

function preload() {

    // defaultFont = loadFont("data/"+FONT_18);

    //load images
    // words
    for (let i = 0; i < 109; i++) {
        let idx = i + 1;
        imgs[i] = loadImage("../src/data/" + idx + ".png");
    }

    blank = loadImage("../src/data/transparent.png");

    // info images
    // text
    // TODO?

    soundFormats('mp3', 'ogg');
    mySound = loadSound('../src/data/rpeg.mp3');

}

function setup() {
    createCanvas(900, 670, WEBGL);
    frameRate(30);
    mySound.loop();
    //color palette
    //initializeColors();


    // textFont(defaultFont);]
    // for (let i = 0; i < riLines.length; i++)
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

    if (changingCubes.length > 0) {
        for (let i = 0; i < changingCubes.length; i++) {
            zooming(i);
        }
    }

}

function drawCubes() {
    textureMode(NORMAL);

    for (let j = 0; j < NUM_LG; j++) {
        push();

        let yOff = height / 3;
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
        let skipIdx = -1;

        for (let i = 0; i < selectedTextCubesIdx.length; i++) {
            let idxPair = selectedTextCubesIdx[i];
            if (idxPair[0] == j) {
                skipIdx = idxPair[1];
            }
        }
        //draw the selected text cubes last find it and skip it first

        for (let i = 0; i < cubes[j].length; i++) {
            if (i == skipIdx) {
                //don't draw
            } else {
                //draw
                let tc = cubes[j][i];
                push();

                if (!tc.selected && !tc.stopped)
                    translate(tc.x, tc.y, tc.z);

                if (!tc.selected && tc.rotating) {
                    rotateX(frameCount * PI / tc.xRot);
                    rotateY(frameCount * PI / tc.yRot);
                    rotateZ(frameCount * PI / tc.zRot);
                }

                //scale(tc.scale);
                tc.draw();
                pop();
            }
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
        //now draw the selected cube
        if (skipIdx > -1) {
            let selectedTc = cubes[j][skipIdx];
            push();
            if (!selectedTc.selected && !selectedTc.stopped)
                translate(selectedTc.x, selectedTc.y, selectedTc.z);

            if (!selectedTc.selected && selectedTc.rotating) {
                rotateX(frameCount * PI / selectedTc.xRot);
                rotateY(frameCount * PI / selectedTc.yRot);
                rotateZ(frameCount * PI / selectedTc.zRot);
            }
            selectedTc.draw();
            pop();
        }

        if (!largeCubes[j].showingTextCube || largeCubes[j].inAnimation) {
            largeCubes[j].draw();
        }

        pop();
    }
}


//redo below with class
class PointUV {
    constructor(x, y, z, u, v) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.u = u;
        this.v = v;
    }
}

class Cube {
    constructor(name, sz, p) {
        //for zooming
        this.showingTextCube = null;
        this.inAnimation = false;

        this.tex = p;
        this.id = name;
        this.scale = 1;
        this.w = this.h = this.d = sz;
        this.vertices = [];
        //front
        this.vertices[0] = new PointUV(-this.w / 2, -this.h / 2, this.d / 2, 0, 0);
        this.vertices[1] = new PointUV(this.w / 2, -this.h / 2, this.d / 2, 1, 0);
        this.vertices[2] = new PointUV(this.w / 2, this.h / 2, this.d / 2, 1, 1);
        this.vertices[3] = new PointUV(-this.w / 2, this.h / 2, this.d / 2, 0, 1);
        //left
        this.vertices[4] = new PointUV(-this.w / 2, -this.h / 2, this.d / 2, 0, 0);
        this.vertices[5] = new PointUV(-this.w / 2, -this.h / 2, -this.d / 2, 1, 0);
        this.vertices[6] = new PointUV(-this.w / 2, this.h / 2, -this.d / 2, 1, 1);
        this.vertices[7] = new PointUV(-this.w / 2, this.h / 2, this.d / 2, 0, 1);

        //right
        this.vertices[8] = new PointUV(this.w / 2, -this.h / 2, this.d / 2, 0, 0);
        this.vertices[9] = new PointUV(this.w / 2, -this.h / 2, -this.d / 2, 1, 0);
        this.vertices[10] = new PointUV(this.w / 2, this.h / 2, -this.d / 2, 1, 1);
        this.vertices[11] = new PointUV(this.w / 2, this.h / 2, this.d / 2, 0, 1);

        //back
        this.vertices[12] = new PointUV(-this.w / 2, -this.h / 2, -this.d / 2, 0, 0);
        this.vertices[13] = new PointUV(this.w / 2, -this.h / 2, -this.d / 2, 1, 0);
        this.vertices[14] = new PointUV(this.w / 2, this.h / 2, -this.d / 2, 1, 1);
        this.vertices[15] = new PointUV(-this.w / 2, this.h / 2, -this.d / 2, 0, 1);

        //top
        this.vertices[16] = new PointUV(-this.w / 2, -this.h / 2, this.d / 2, 0, 0);
        this.vertices[17] = new PointUV(-this.w / 2, -this.h / 2, -this.d / 2, 1, 0);
        this.vertices[18] = new PointUV(this.w / 2, -this.h / 2, -this.d / 2, 1, 1);
        this.vertices[19] = new PointUV(this.w / 2, -this.h / 2, this.d / 2, 0, 1);

        //bottom
        this.vertices[20] = new PointUV(-this.w / 2, this.h / 2, this.d / 2, 0, 0);
        this.vertices[21] = new PointUV(-this.w / 2, this.h / 2, -this.d / 2, 1, 0);
        this.vertices[22] = new PointUV(this.w / 2, this.h / 2, -this.d / 2, 1, 1);
        this.vertices[23] = new PointUV(this.w / 2, this.h / 2, this.d / 2, 0, 1);
    }

    draw() {
        //use vertices
        // if (this.tex == null) {
        //     noFill();
        // }
        // else {
        //     fill(250);
        //     tint(255, CUBE_ALPHA);
        //     texture(this.tex);
        // }
        // // the 6 plane should have the same texture
        // stroke(230, 230, 230);
        // let vt = this.vertices;
        // for (let i = 0; i < 6; i++) {
        //     //what if using plane?
        //     beginShape();
        //     for (let j = 0; j < 4; j++)
        //         vertex(vt[j + 4 * i].x, vt[j + 4 * i].y, vt[j + 4 * i].z, vt[j + 4 * i].u, vt[j + 4 * i].v);
        //     endShape(CLOSE);
        // }

        //use plane => seems ok, dont need vertices
        //fill(250);
        //tint(255, CUBE_ALPHA);
        //texture(this.tex);
        fill(255, CUBE_ALPHA);
        //noStroke();
        stroke(255);
        strokeWeight(1.5);
        let a = this.w;
        let d = a / 2;
        // for (let i = 0; i < 6; i++) {
        //     push();
        //     if (i == 0) {
        //         //front
        //         translate(0, 0, d);
        //     } else if (i == 1) {
        //         //left
        //         translate(-d, 0, 0);
        //         rotateY(-PI / 2);
        //     } else if (i == 2) {
        //         //right
        //         translate(d, 0, 0);
        //         rotateY(PI / 2);
        //     } else if (i == 3) {
        //         //back
        //         translate(0, 0, -d);
        //         rotateX(PI);
        //     } else if (i == 4) {
        //         //top
        //         translate(0, -d, 0);
        //         rotateX(-PI / 2);
        //     } else if (i == 5) {
        //         //bottom
        //         translate(0, d, 0);
        //         rotateX(PI / 2);
        //     }
        //     plane(a);
        //     pop();
        // }

        //utimate form: use box()
        box(a);

    }
}

class TextCube {
    constructor(id, cube, sz, texture) {
        this.tc = new Array(6);
        for (let i = 0; i < this.tc.length; i++) {
            this.tc[i] = color(colors[Math.floor(random(colors.length))]);
        }
        this.parent = cube;

        this.tcArray = new Array(this.tc.length);
        for (let i = 0; i < this.tcArray.length; i++) {
            let r = red(this.tc[i]);
            let g = green(this.tc[i]);
            let b = blue(this.tc[i]);
            let cArray = [r, g, b];
            this.tcArray[i] = cArray;
        }
        //for zooming tint

        this.rotating = true;
        //to rotate the cubes
        this.selected = false;
        //for zooming

        this.tex = texture;
        this.id = id;
        this.scale = 1;
        this.w = this.h = this.d = sz;
        this.vertices = [];
        //front
        this.vertices[0] = new PointUV(-this.w / 2, -this.h / 2, this.d / 2, 0, 0);
        this.vertices[1] = new PointUV(this.w / 2, -this.h / 2, this.d / 2, 1, 0);
        this.vertices[2] = new PointUV(this.w / 2, this.h / 2, this.d / 2, 1, 1);
        this.vertices[3] = new PointUV(-this.w / 2, this.h / 2, this.d / 2, 0, 1);
        //left
        this.vertices[4] = new PointUV(-this.w / 2, -this.h / 2, this.d / 2, 0, 0);
        this.vertices[5] = new PointUV(-this.w / 2, -this.h / 2, -this.d / 2, 1, 0);
        this.vertices[6] = new PointUV(-this.w / 2, this.h / 2, -this.d / 2, 1, 1);
        this.vertices[7] = new PointUV(-this.w / 2, this.h / 2, this.d / 2, 0, 1);

        //right
        this.vertices[8] = new PointUV(this.w / 2, -this.h / 2, this.d / 2, 0, 0);
        this.vertices[9] = new PointUV(this.w / 2, -this.h / 2, -this.d / 2, 1, 0);
        this.vertices[10] = new PointUV(this.w / 2, this.h / 2, -this.d / 2, 1, 1);
        this.vertices[11] = new PointUV(this.w / 2, this.h / 2, this.d / 2, 0, 1);

        //back
        this.vertices[12] = new PointUV(-this.w / 2, -this.h / 2, -this.d / 2, 0, 0);
        this.vertices[13] = new PointUV(this.w / 2, -this.h / 2, -this.d / 2, 1, 0);
        this.vertices[14] = new PointUV(this.w / 2, this.h / 2, -this.d / 2, 1, 1);
        this.vertices[15] = new PointUV(-this.w / 2, this.h / 2, -this.d / 2, 0, 1);

        //top
        this.vertices[16] = new PointUV(-this.w / 2, -this.h / 2, this.d / 2, 0, 0);
        this.vertices[17] = new PointUV(-this.w / 2, -this.h / 2, -this.d / 2, 1, 0);
        this.vertices[18] = new PointUV(this.w / 2, -this.h / 2, -this.d / 2, 1, 1);
        this.vertices[19] = new PointUV(this.w / 2, -this.h / 2, this.d / 2, 0, 1);

        //bottom
        this.vertices[20] = new PointUV(-this.w / 2, this.h / 2, this.d / 2, 0, 0);
        this.vertices[21] = new PointUV(-this.w / 2, this.h / 2, -this.d / 2, 1, 0);
        this.vertices[22] = new PointUV(this.w / 2, this.h / 2, -this.d / 2, 1, 1);
        this.vertices[23] = new PointUV(this.w / 2, this.h / 2, this.d / 2, 0, 1);
    }

    toString() {
        return "[" + this.parent.id + "," + id + "]=" + scale;
    }

    setScale(factor) {
        //need to id whether it's shrink false or enlarge false
        if (factor > 1 && this.scale >= maxSize) {
            return 2;
        }
        if (factor < 1 && this.scale <= 1) {
            return -1;
        }
        this.scale *= factor;
        return 1;
    }

    draw() {
        //use vertices
        // noStroke();
        // let vt = this.vertices;

        // for (let i = 0; i < 6; i++) {
        //     fill(255);
        //     beginShape();
        //     tint(this.tc[i]);
        //     texture(this.tex);
        //     for (let j = 0; j < 4; j++) {
        //         vertex(vt[j + 4 * i].x, vt[j + 4 * i].y, vt[j + 4 * i].z, vt[j + 4 * i].u, vt[j + 4 * i].v);
        //     }
        //     endShape(CLOSE);
        // }

        //use plane => no need veritces
        let a = this.w * this.scale;
        //to zoom the cubes
        let d = a / 2
        for (let i = 0; i < 6; i++) {
            noStroke();
            //fill(255);
            if (!this.selected) {
                tint(this.tc[i]);
            } else {
                tint(this.tcArray[i][0], this.tcArray[i][1], this.tcArray[i][2], map(this.scale * this.scale, 1, maxSize * maxSize, 255, 180));
            }
            texture(this.tex);
            push();
            if (i == 0) {
                //front
                translate(0, 0, d);
            } else if (i == 1) {
                //left
                translate(-d, 0, 0);
                rotateY(-PI / 2);
            } else if (i == 2) {
                //right
                translate(d, 0, 0);
                rotateY(PI / 2);
            } else if (i == 3) {
                //back
                translate(0, 0, -d);
                rotateX(PI);
            } else if (i == 4) {
                //top
                translate(0, -d, 0);
                rotateX(-PI / 2);
            } else if (i == 5) {
                //bottom
                translate(0, d, 0);
                rotateX(PI / 2);
            }
            plane(a, a);
            pop();
        }
    }

}

function createCubes() {
    let idx = 0;

    for (let j = 0; j < NUM_LG; j++) {
        largeCubes[j] = new Cube(NUM_LG, lgCubeSize, blank);
        largeCubes[j].x = (j + 1) * width / 4;
        //console.log("CUBE "+j+":\n");
        cubes[j] = new Array(NUM_CUBES);
        for (let i = 0; i < NUM_CUBES; i++) {
            let cubeSz = 15; /// random(15, 15);

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
function zooming(ind) {
    let dealingArray = changingCubes[ind];
    let lcIndex = dealingArray[0];
    let lcTochange = largeCubes[lcIndex];
    if (dealingArray.length > 1) {
        //no text is showing on this large cube 
        //text cube enlarge
        let tcIndex = dealingArray[1];
        let tcToZoom = cubes[lcIndex][tcIndex];
        tcToZoom.selected = true;
        lcTochange.inAnimation = true;
        //selectedTextCubes.push(tcToZoom);
        let idxPair = [lcIndex, tcIndex];
        selectedTextCubesIdx.push(idxPair);
        let mouseXInRange = (mouseX > lcIndex * width / 3 && mouseX < (lcIndex + 1) * width / 3);
        if (mouseIsPressed && mouseXInRange) {
            //mouse pressing, enlarge
            if (tcToZoom.setScale(map(tcToZoom.scale,0,maxSize,1.09,1.1)) == 2) {
                //zooming is done
                lcTochange.showingTextCube = tcToZoom;
                lcTochange.inAnimation = false;
                //erase this pair in changingCubes
                changingCubes.splice(ind, 1);
            }
        } else {
            //mouse released, shrink
            if (tcToZoom.setScale(map(tcToZoom.scale,0,maxSize,.89,.9)) == -1) {
                //back to small
                lcTochange.inAnimation = false;
                tcToZoom.selected = false;
                //erase this pair in changingCubes
                changingCubes.splice(ind, 1);
            }
        }
    } else {
        //text cube shrink
        lcTochange.inAnimation = true;
        lcTochange.showingTextCube.selected = false;
        if (lcTochange.showingTextCube.setScale(map(lcTochange.showingTextCube.scale,maxSize,0,0.89,0.9)) == -1) {
            //animation end
            lcTochange.inAnimation = false;
            lcTochange.showingTextCube = null;
            let idx;
            for (let i = 0; i < selectedTextCubesIdx; i++) {
                if (selectedTextCubesIdx.indexOf(lcIndex) > -1) {
                    idx = i;
                    break;
                }
            }
            selectedTextCubesIdx.splice(idx, 1);
            //erase this pair in changingCubes
            changingCubes.splice(ind, 1);
        }

    }
}

function selectCube(parentIdx, idx) {
    if (idx >= 0) {
        //console.log("SELECTED ["+parentIdx+", "+idx+"]");
        cubes[parentIdx][idx].selected = true;
    }
}

function getSelected(i) {
    let selectedIdx = -1;
    let all = cubes[i];
    for (let j = 0; j < all.length; j++)
        if (all[j].selected) selectedIdx = j;
    return selectedIdx;
}

function clearAll() {
    selectedParentIdx = -1;
    selectedCubeIdx = -1;
    for (let j = 0; j < NUM_LG; j++)
        clearCube(j);
}

function clearCube(j) {
    for (let i = 0; i < cubes[j].length; i++)
        cubes[j][i].selected = false;
}

// function updateText() {
//     if (firstTextCreation) {
//         let positions = [Math.floor(random(NUM_CUBES)),
//             Math.floor(random(NUM_CUBES)), Math.floor(random(NUM_CUBES))
//         ];
//         createRiTexts(positions);
//         firstTextCreation = false;
//     } else {
//         let newText = textFromFile[selectedParentIdx][selectedCubeIdx];
//         currentTextIdxs[selectedParentIdx] = selectedCubeIdx;
//         this.currentSelectedWord[selectedParentIdx] = hotWords[selectedParentIdx][selectedCubeIdx];
//         //console.log("*** ["+selectedParentIdx+","+selectedCubeIdx+"] currentSelectedWord["+selectedParentIdx+"]='"+currentSelectedWord[selectedParentIdx]+"' newText="+newText+"\n");
//         this.handleTextReplace(newText, selectedParentIdx);
//     }
// }

// function handleTextReplace(newText, position) {
//     let toAdd = null;
//     switch (position) {
//         case 0:
//             toAdd = handleReplaceFirst(newText);
//             fadeOutAt(0);
//             break;
//         case 1:
//             //this.currentSelectedWord[1] = hotWords[1][selectedCubeIdx];
//             for (let i = 0; i < NUM_LG; i++)
//                 fadeOutAt(i);
//             createRiTexts(currentTextIdxs);
//             return;
//         case 2:
//             toAdd = handleReplaceLast(newText);
//             fadeOutAt(2);
//             break;
//     }

//     // add all the replacements
//     for (let i = toAdd.length - 1; i >= 0; i--) {
//         let rtw = toAdd[i]; //(RiTextWords)
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
//     let next = null,
//         toAdd;
//     let remaining = newText;

//     let lastOld = lastRiTextFor(1);
//     let firstNew = firstRiTextFor(2);

//     let maxWidth = ((TEXT_X_START + MAX_LINE_WIDTH) - firstNew.x),
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
//             let yAlign = firstNew.y;
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
//     let toAdd;

//     // do the last line first
//     let next = null;
//     let remaining = newText;
//     let firstNew = firstRiTextFor(1);

//     let maxWidth = (firstNew.x - TEXT_X_START) + 1,
//         lastLine = reverseTrimToWidth(remaining, maxWidth);
//     if (lastLine.length() > 0) {
//         next = new RiText(this, lastLine, firstNew.x, firstNew.y, RIGHT);
//         addToPositionList(toAdd, next, 0);
//     }

//     // check if there are other lines if there are any
//     let numLeftOver = remaining.length() - lastLine.length();
//     if (numLeftOver > 0) {

//         // process the rest of the text in a loop
//         remaining = newText.substring(0, numLeftOver);
//         while (remaining.length() > 0) {
//             lastLine = reverseTrimToWidth(remaining, MAX_LINE_WIDTH);
//             let yAlign = next != null ? next.y : firstNew.y,
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

//     let align = rt.alignment;
//     let text = rt.getText();
//     while (text.startsWith(" "))
//         text = text.substring(1);

//     while (text.endsWith(" "))
//         text = text.substring(0, text.length() - 1);

//     //console.log(position+"->("+text+")");
//     let next = new RiTextWords(this, text, rt.x, rt.y, align);
//     text = next.getText();
//     //console.log(position+": TEXT: "+text);

//     let hot = currentSelectedWord[position];
//     if (!firstTextCreation) {
//         if (hot == null)
//             console.log("Null hotword: " + " for " + text + "position=" + position);

//         let words = text.split(" ");

//         let isSelected = getSelected(position) > -1;

//         for (let i = 0; i < words.length; i++) {
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

// function mousePressed() {
//     // selectedParentIdx = 1;
//     // if (mouseX < width / 3)
//     //     selectedParentIdx = 0;
//     // else if (mouseX > width * .66)
//     //     selectedParentIdx = 2;
//     // console.log(selectedParentIdx);
// }

function mouseReleased() {
    // if (selectedParentIdx > -1 && selectedCubeIdx > -1) { // do we have a selection      
    //     if (cubes[selectedParentIdx][selectedCubeIdx].scale < maxSize) {
    //         clear(selectedParentIdx);
    //         // unset the selected color here?
    //     } else
    //         updateText(); // TODO
    // }

    // selectedParentIdx = -1;
    // selectedCubeIdx = -1;

}

function mousePressed() {
    if (mouseY > height * .2 && mouseY < height * .6) {
        let largeCubeToChangeIdx = 1;
        if (mouseX < width / 3) {
            largeCubeToChangeIdx = 0;
        } else if (mouseX > width * 2 / 3) {
            largeCubeToChangeIdx = 2;
        }
        if (!largeCubes[largeCubeToChangeIdx].inAnimation) {
            if (largeCubes[largeCubeToChangeIdx].showingTextCube == null) {
                let chosenTcIdx = floor(random(cubes[largeCubeToChangeIdx].length));
                let idxPair = [largeCubeToChangeIdx, chosenTcIdx];
                changingCubes.push(idxPair);
            } else {
                changingCubes.push([largeCubeToChangeIdx]);
            }
        }
    }
}