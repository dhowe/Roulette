var img;
function preload() {
    img = loadImage("../src/data/1.png");
}

function setup() {
    createCanvas(700,700, WEBGL);
}

function draw() {
    background(200);

    beginShape();
    tint(255,0,0,122);
    texture(img);
    vertex(0, 0, 0,0,0);
    vertex(0, 250, 0,1);
    vertex(250, 250, 0,1,1);
    vertex(250, 0, 0,1,0);
    endShape(CLOSE);

    tint(255,0,0,122);
    texture(img);
    box()

}
