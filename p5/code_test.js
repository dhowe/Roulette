var img;
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

function preload() {
    img = loadImage("../src/data/1.png");
}

function setup() {
    createCanvas(700, 700, WEBGL);
    pg = createGraphics(img.width, img.height);
    pg.background(255, 64);
    pg.stroke(255);
    pg.strokeWeight(1);
    pg.noFill();
    pg.rect(0, 0, img.width, img.height);
    let c = color('#f4dc00');
    console.log(c);
    r = red(c);
    g = green(c);
    b = blue(c);
    cA = [r, g, b];
    console.log(r, g, b);
    cub = new Cube(1, 20, img);
    suc = new Cube(1, 100, img);
}

let v = [

    //front -> 0
    [-1, -1, 1, 0, 0], [1, -1, 1, 1, 0], [1, 1, 1, 1, 1], [-1, 1, 1, 0, 1],
    //left -> 1
    [-1, -1, 1, 0, 0], [-1, -1, -1, 1, 0], [-1, 1, -1, 1, 1], [-1, 1, 1, 0, 1],
    //right -> 2
    [1, -1, 1, 0, 0], [1, -1, -1, 1, 0], [1, 1, -1, 1, 1], [1, 1, 1, 0, 1],
    //back -> 3
    [-1, -1, -1, 0, 0], [1, -1, -1, 1, 0], [1, 1, -1, 1, 1], [-1, 1, -1, 0, 1],
    //top -> 4
    [-1, -1, 1, 0, 0], [-1, -1, -1, 1, 0], [1, -1, -1, 1, 1], [1, -1, 1, 0, 1],
    //bottom -> 5
    [-1, 1, 1, 0, 0], [-1, 1, -1, 1, 0], [1, 1, -1, 1, 1], [1, 1, 1, 0, 1]

];
function draw() {
    background(0);
    lights();


    // rotateY(millis()/1000);
    textureMode(NORMAL);

    //texture(img);

    //try using Pgraphic
    texture(pg);

    push();
    translate(125, 125, -50);
    noStroke();
    plane(50);
    pop();

    push();
    translate(125, 125, 0);
    noStroke();
    plane(250);
    pop();

    //tint(255, 0, 0, 122);

    rotateY(mouseX / 200);
    rotateZ(mouseY / 200);
    //box()
    //use verteice
    // for (i = 0; i < 6; i++) {
    //     beginShape();
    //     texture(img);
    //     for (j = 0; j < 4; j++) {
    //         vertex(v[i * 4 + j][0] * 50, v[i * 4 + j][1] * 50, v[i * 4 + j][2] * 50, v[i * 4 + j][3], v[i * 4 + j][4]);
    //     }
    //     endShape(CLOSE);
    // }

    //use plane
    push();
    noStroke();
    push();
    translate(100, 0, 0);
    fill(255, 0, 0);
    box(10);
    pop();
    push();
    translate(0, 100, 0);
    fill(0, 255, 0);
    box(10);
    pop();
    push();
    translate(0, 0, 100);
    fill(0, 0, 255);
    box(10);
    pop();

    push();
    fill(233, 0, 233);
    box(20);
    pop();


    // for (let i = 0; i < 6; i++) {
    //     noStroke();
    //     noFill();
    //     texture(img);
    //     tint(cA[0],cA[1],cA[2],100);
    //     //fill(255,64);
    //     //stroke(255);
    //     //texture(pg);
    //     let a = 100;
    //     let d = a / 2;
    //     push();
    //     if (i == 0) {
    //         //front
    //         rotateX(PI);
    //         translate(0,0,d);
    //     } else if (i == 1) {
    //         //left *
    //         translate(-d,0,0);  
    //         rotateY(-PI / 2); 
    //     } else if (i == 2) {
    //         //right
    //         translate(d,0,0);
    //         rotateY(PI / 2);
    //     } else if (i == 3) {
    //         //back *
    //         rotateX(PI);
    //         translate(0,0,-d);
    //     } else if (i == 4) {
    //         //top
    //         translate(0,-d,0);
    //         rotateX(-PI/2);
    //     } else if (i == 5) {
    //         //bottom
    //         translate(0,d,0);
    //         rotateX(PI/2);
    //     }
    //     plane(a, a);
    //     pop();
    // }

    // //use box()
    // push();
    // fill(255, 64);
    // stroke(255);
    // //texture(pg);
    // //noStroke();
    // box(100);
    // pop();

    //use class
    suc.draw();
    cub.draw();

    push();
    fill(233, 233, 0, 100);
    box(50);
    pop();

    pop();

    // //use box()
    // push();
    // fill(255,64);
    // stroke(255);
    // //texture(pg);
    // //noStroke();
    // box(100);
    // pop();

}

function mousePressed() {
    cub.setScale(1.1);
}

class Cube {
    constructor(name, a, texture) {
        this.id = name;
        this.w = this.h = this.d = a;
        this.tex = texture;
        this.scale = 1;
        this.tc = new Array(6);
        for (let i = 0; i < this.tc.length; i++) {
            this.tc[i] = color(colors[Math.floor(random(colors.length))]);
        }
        this.tcArray = new Array(this.tc.length);
        for (let i = 0; i < this.tcArray.length; i++) {
            let r = red(this.tc[i]);
            let g = green(this.tc[i]);
            let b = blue(this.tc[i]);
            let cArray = [r, g, b];
            this.tcArray[i] = cArray;
        }
    }

    draw() {
        let a = this.w * this.scale;
        //to zoom the cubes
        let d = a / 2
        for (let i = 0; i < 6; i++) {
            noStroke();
            //fill(255);
            if (this.scale <= 1) {
                tint(this.tc[i]);
            } else {
                tint(this.tcArray[i][0], this.tcArray[i][1], this.tcArray[i][2], 100);
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

    setScale(factor) {
        if (factor > 1 && this.scale >= 9) {
            return false;
        }
        if (factor < 1 && this.scale <= 1) {
            return false;
        }
        this.scale *= factor;
        return true;
    }
}