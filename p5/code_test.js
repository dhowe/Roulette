var img;
function preload() {
    img = loadImage("../src/data/1.png");
}

function setup() {
    createCanvas(700, 700, WEBGL);
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
    background(200);


    beginShape();
    // rotateY(millis()/1000);
    textureMode(NORMAL);
    texture(img);
    tint(255, 0, 0, 122);
    vertex(0, 0, 0, 0, 0);
    vertex(0, 250, 0, 0, 1);
    vertex(250, 250, 0, 1, 1);
    vertex(250, 0, 0, 1, 0);
    endShape(CLOSE);

    tint(255, 0, 0, 122);

    rotateY(millis() / 1000);
    rotateZ(millis() / 1000);
    //box()
    //use verteice
    for (i = 0; i < 6; i++) {
        beginShape();
        texture(img);
        for (j = 0; j < 4; j++) {
            vertex(v[i * 4 + j][0] * 50, v[i * 4 + j][1] * 50, v[i * 4 + j][2] * 50, v[i * 4 + j][3], v[i * 4 + j][4]);
        }
        endShape(CLOSE);
    }
    //use plane
    push();
    translate(-200, 0, 0);
    noStroke();
    push();
    translate(100,0,0);
    fill(255,0,0);
    box(10);
    pop();
    push();
    translate(0,100,0);
    fill(0,255,0);
    box(10);
    pop();
    push();
    translate(0,0,100);
    fill(0,0,255);
    box(10);
    pop();

    for (i = 0; i < 6; i++) {
        noStroke();
        noFill();
        texture(img);
        let a = 100;
        let d = a / 2;
        push();
        if (i == 0) {
            //front
            translate(0,0,d);
        } else if (i == 1) {
            //left
            translate(-d,0,0);  
            rotateY(-PI / 2); 
        } else if (i == 2) {
            //right
            translate(d,0,0);
            rotateY(PI / 2);
        } else if (i == 3) {
            //back
            translate(0,0,-d);
            rotateX(PI);
        } else if (i == 4) {
            //top
            translate(0,-d,0);
            rotateX(-PI/2);
        } else if (i == 5) {
            //bottom
            translate(0,d,0);
            rotateX(PI/2);
        }
        plane(a, a);
        pop();
    }
    pop();

}
