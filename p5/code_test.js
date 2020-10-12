var img;
function preload() {
    img = loadImage("../src/data/transparent.png");
}

function setup() {
    createCanvas(700, 700, WEBGL);
    pg = createGraphics(img.width,img.height);
    pg.background(255,64);
    pg.stroke(255);
    pg.strokeWeight(1);
    pg.noFill();
    pg.rect(0,0,img.width,img.height);
     v = PI;

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
    translate(125,125,-50);
    noStroke();
    plane(50);
    pop();
    
    push();
    translate(125,125,0);
    rotateX(v);
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
    // push();
    // noStroke();
    // push();
    // translate(100,0,0);
    // fill(255,0,0);
    // box(10);
    // pop();
    // push();
    // translate(0,100,0);
    // fill(0,255,0);
    // box(10);
    // pop();
    // push();
    // translate(0,0,100);
    // fill(0,0,255);
    // box(10);
    // pop();

    // for (i = 0; i < 6; i++) {
    //     //noStroke();
    //     //noFill();
    //     fill(255,64);
    //     stroke(255);
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
    // pop();

    //use box()
    push();
    fill(255,64);
    stroke(255);
    //texture(pg);
    //noStroke();
    box(100);
    pop();

}

function mounsePressed(){
    v += PI;
}
