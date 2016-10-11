
import java.awt.Color;
import java.util.*;

import processing.core.*;
import rita.RiText;
import rita.RiTextWords;
import rita.util.Util;
import ddf.minim.Minim;

public class Roulette extends PApplet
{
  static boolean SHOW_BORDER, SHOW_TITLES, SHOW_IMAGES = true, SHOW_COPYRIGHT;

  static final String FONT_18 = "Modern-Regular-18.vlw", FONT_15 = "Modern-Regular-15.vlw", FONT_12 = "Modern-Regular-12.vlw", FONT_13 = "Modern-Regular-13.vlw", FONT_14 = "Modern-Regular-14.vlw";

  static int NUM_LG = 3, CUBE_ALPHA = 64, NUM_CUBES = 38, WALL_OFFSET = 15, MAX_CHARS_PER_LINE = 65;
  static boolean ROTATE, SHOW_GUIDES, UPPERCASE,  DO_FADES = true, BLACK_BG = true;
  static float MAX_LINE_WIDTH = 500, TEXT_X_START = 200, TEXT_Y_START = 440;
  static final String DELIM = "<", SPC = " ", HEX_BG = "181828";
  
  static String[] INFO_IMAGES = {"instructions.png","roulette.png" , "copyright.png"};
  
  static final float[] DEFAULT_BG = Util.unhex(0x181828);
  static final float[] TEXT_COLOR = Util.unhex(0xf9f9f9);
  static final float[] INFO_COLOR = Util.unhex(0xd9d9e9);
  static final float[] HOT_COLOR  = Util.unhex(0x7c0b00);

  PImage texture, info[];  
  String[] currentText;
  String[][] textFromFile;
  
  List fadeOuts = new LinkedList();  
  List[] riLines = new List[NUM_LG];  
  Cube[] largeCubes = new Cube[NUM_LG];
  Cube[][] cubes = new Cube[NUM_LG][NUM_CUBES];
  float[] textColor, hotColor, bgColor;
  float[] rotateX={0,0,0}, rotateY={0,0,0}, rotateZ={0,0,0};
  int selectedCubeIdx = -1, selectedParentIdx = 0;
  int[] currentTextIdxs = new int[NUM_LG];    
  float lgCubeSize = 140, maxSize = 9f;  
  boolean firstTextCreation = true;
  float spaceWidth, leading;  
  String[] currentSelectedWord;
  String[][] hotWords; 
  String homeUrl;
  
  RiText tleft, title,tright; 
    
  Minim minim;
  
  static final float[][] colors = {
      Util.unhex(0xf9f9f9),  // white (text)
      Util.unhex(0xeaf9f2),  // light-teal
      Util.unhex(0xf4dc00),  // yellow
      Util.unhex(0x6f84b1),  // slate
      Util.unhex(0xcee9e2),  // teal
      Util.unhex(0xde5e05),  // orange
      Util.unhex(0xbc4e8d),  // pink
      Util.unhex(0x1d6a0a),  // green
      Util.unhex(0x21378a),  // blue
      Util.unhex(0x7c0b00),  // red      
  };

  public void setup()
  {
    size(900, 670, OPENGL);
    frameRate(30);       
    
    hotWords = new String[NUM_LG][NUM_CUBES];
    currentText = new String[NUM_LG];
    currentSelectedWord = new String[NUM_LG];
    
    for (int i = 0; i < riLines.length; i++)
      riLines[i] = new LinkedList();
   
    textFont(loadFont(FONT_18));
    spaceWidth = textWidth(SPC);
    leading = textAscent()+textDescent()+8; 
    
    RiText.disableAutoDraw();
    RiText.setDefaultFont(FONT_18);

    hint(PGraphics.ENABLE_OPENGL_4X_SMOOTH);
    textureMode(NORMAL);
    
    this.loadResources();
    this.initColors();
    this.createCubes();
    this.updateText();
    this.createTitles();
    
    minim = new Minim(this);
    minim.loadFile("rpeg.mp3").loop();
  }
  
  public void draw()
  {
    background(bgColor[0],bgColor[1],bgColor[2]);
     
    this.drawCubes();    
    
    if (mousePressed && mouseY > height*.2f && mouseY < height*.6f) 
      handleZoom();
    
    this.drawText();
    
    if (SHOW_BORDER) {
      noFill();
      stroke(textColor[0],textColor[1],textColor[2], 127);
      rect(20,20,width-40,height-60);
    }
    
    if (SHOW_TITLES) {
      tleft.draw();
      tright.draw();
      title.draw();
    }
    
    if (SHOW_TITLES) {
      tleft.draw();
      tright.draw();
      title.draw();
    }
    if (SHOW_IMAGES)
    {
      int[] locs = { 40, 524, 750 };
      for (int i = 0; i < images.length; i++)
      {
        image(images[i], locs[i], height - 30);
      }
    }
  }
  
  public void destroy() {
    minim.stop();
    super.destroy();
  }
  
  private void createTitles()
  {
    if (!SHOW_TITLES) return;
    int th = height - 17;
    tleft = new RiText(this, "click on one of the larger"
        + " cubes and hold mouse down to select", 40, th+1);
    tleft.fill(INFO_COLOR);
    tleft.textFont(FONT_14);
    title = new RiText(this, "roulette", 526, th);
    title.fill(INFO_COLOR);
    title.textFont(FONT_15);
    tright = new RiText(this, "�2008 howe/molina", 750, th);
    tright.fill(INFO_COLOR);
    tright.textFont(FONT_13);
  }

  PImage[] images;
  private void loadResources()
  {
    homeUrl = "";
    images = new PImage[SHOW_COPYRIGHT ? INFO_IMAGES.length : INFO_IMAGES.length -1];
    for (int i = 0; i < images.length; i++)
      images[i] = loadImage(INFO_IMAGES[i]);
    
    this.loadLinesFromFile(homeUrl+"roulette.txt");
    this.loadWordsFromFile(homeUrl+"hotwords.txt");

    bgColor = colStringToHex(null);
  }

  private float[] colStringToHex(String bgColStr)
  {   
    if (bgColStr == null) return new float[]
      {DEFAULT_BG[0],DEFAULT_BG[1], DEFAULT_BG[2]};
    Color bgCol = null;
    try {
      bgCol = Color.decode(bgColStr);
      //System.out.println("OK: "+bgCol);
    }
    catch (NumberFormatException e) { 
      return new float[]
        {DEFAULT_BG[0],DEFAULT_BG[1], DEFAULT_BG[2]};
    }
    return new float[] {bgCol.getRed(), bgCol.getGreen(), bgCol.getBlue()};
  }
  
  private void initColors()
  {
    textColor = TEXT_COLOR;  
    hotColor = HOT_COLOR;
    RiTextWords.setDefaultColor(textColor);
    RiText.setDefaultColor(textColor);
  }

  private void drawText()
  {    
   // if (SHOW_GUIDES) drawGuides();
    
    for (int i = 0; i < riLines.length; i++) {
      List l = (List)riLines[i];
      for (Iterator it = l.iterator(); it.hasNext();) {
        RiTextWords rt = (RiTextWords)it.next();
        rt.draw();
      }
    }
    for (int i = 0; i < fadeOuts.size(); i++)      
      ((RiTextWords)fadeOuts.get(i)).draw();
  }

  private void loadWordsFromFile(String wordFile)
  {
    int idx = 0;
    this.hotWords = new String[NUM_LG][NUM_CUBES];
    String[] fromFile = loadStrings(wordFile);
    for (int x = 0; x < NUM_LG; x++) {
      for (int i = 0; i < NUM_CUBES; i++) {
        String s = fromFile[idx++];
        if (s != null && s.length()>0)
          hotWords[x][i] = UPPERCASE ? s.toUpperCase() : s;
        else 
          i--;
      }
    }
    if (true) {
      for (int x = 0; x < NUM_LG; x++) 
        for (int i = 0; i < NUM_CUBES; i++) {
          if (textFromFile[x][i]==null || hotWords[x][i]==null || textFromFile[x][i].indexOf(hotWords[x][i])<0) { 
            System.err.println("["+x+"]"+"["+i+"] MISS! '"+hotWords[x][i]+"' -> '"+textFromFile[x][i]+"'");
            System.exit(1);
      }}}
  }
  
  private void loadLinesFromFile(String lineFile)
  {
    int idx = 0;
    this.textFromFile = new String[NUM_LG][NUM_CUBES];
    String[] fromFile = loadStrings(lineFile);
    
    for (int x = 0; x < NUM_LG; x++)
      for (int i = 0; i < NUM_CUBES; i++) {
        String s = fromFile[idx++];         
        if (s != null && s.length()>0) {
          s.replaceAll("\\w\\w+", " ");
          textFromFile[x][i] = UPPERCASE ? s.toUpperCase() : s;
        }
        else 
          i--;
      }
/*    if (false) {for (int x = 0; x < NUM_LG; x++)
      for (int i = 0; i < NUM_CUBES; i++) 
        System.out.println(x+"."+i+")"+textFromFile[x][i]);
    }*/
  }
  
  private void handleZoom()
  {
    if (selectedCubeIdx < 0) {
      selectedCubeIdx = (int)random(cubes[selectedParentIdx].length);
      selectCube(selectedParentIdx, selectedCubeIdx);  
    }
    cubes[selectedParentIdx][selectedCubeIdx].setScale(1.1f);
  }
    
  /*public void mouseClicked()
  {
    if (mouseEvent.getClickCount()==2 && mouseX<20 && mouseY<20) {
      BLACK_BG = !BLACK_BG;
      this.initColors();
      selectedCubeIdx = (int)random(NUM_CUBES);
      selectedParentIdx = 1;      
      String newText = textFromFile[selectedParentIdx][selectedCubeIdx];
      currentTextIdxs[selectedParentIdx] = selectedCubeIdx;
      this.handleTextReplace(newText, selectedParentIdx); 
    }
  }    */
  
  public void mousePressed()
  {
    selectedParentIdx = 1;
    if (mouseX < width/3)
      selectedParentIdx = 0;
    else if (mouseX > width*.66)
      selectedParentIdx = 2;  
  }
  
  public void mouseReleased()
  {    
    if (selectedParentIdx > -1 && selectedCubeIdx > -1) { // do we have a selection      
      if (cubes[selectedParentIdx][selectedCubeIdx].scale < maxSize) {        
        clear(selectedParentIdx);
        // unset the selected color here?
      }
      else 
        updateText();
    }
    selectedParentIdx = -1;
    selectedCubeIdx = -1;
  }

  private void updateText()
  {     
    if (firstTextCreation) {
      int[] positions = { (int)random(NUM_CUBES),
        (int)random(NUM_CUBES), (int)random(NUM_CUBES)};
      createRiTexts(positions);
      firstTextCreation= false;
    }
    else {              
      String newText = textFromFile[selectedParentIdx][selectedCubeIdx];
      currentTextIdxs[selectedParentIdx] = selectedCubeIdx;
      this.currentSelectedWord[selectedParentIdx] = hotWords[selectedParentIdx][selectedCubeIdx];
      //System.out.println("*** ["+selectedParentIdx+","+selectedCubeIdx+"] currentSelectedWord["+selectedParentIdx+"]='"+currentSelectedWord[selectedParentIdx]+"' newText="+newText+"\n");
      this.handleTextReplace(newText, selectedParentIdx);  
    }
  }  
  
  private void handleTextReplace(String newText, int position)
  {        
    List toAdd = null;
    switch(position) {
      case 0:                 
        toAdd = handleReplaceFirst(newText);
        fadeOutAt(0);
        break;
      case 1:
        //this.currentSelectedWord[1] = hotWords[1][selectedCubeIdx];
        for (int i = 0; i < NUM_LG; i++)      
          fadeOutAt(i);          
        createRiTexts(currentTextIdxs);
        return;
      case 2:        
        toAdd = handleReplaceLast(newText);
        fadeOutAt(2);
        break;      
    }    
    
    // add all the replacements
    for (int i = toAdd.size()-1; i >= 0; i--)  {
      RiTextWords rtw = (RiTextWords) toAdd.get(i);
      if (position==0 && i == 0) {        
        rtw.x -= spaceWidth;
        //System.out.println("ADDED SPC: ["+rtw.getText()+rtw.getText()+"]");
      }
      riLines[position].add(rtw);      
    }
    
    //printLineMap();        
  }

  private void fadeOutAt(int position)
  {
    if (DO_FADES)
    {
      for (Iterator i = riLines[position].iterator(); i.hasNext();) { 
        RiTextWords rt = (RiTextWords) i.next();      
        fadeOuts.add(rt);  
        rt.fadeOut(1);      
      }
    }
    riLines[position].clear();     
  }

  private List handleReplaceLast(String newText)
  {
    //System.out.println("NEW: " + newText);
    RiText next = null;
    String remaining = newText;
    List toAdd = new LinkedList();
    RiTextWords lastOld = lastRiTextFor(1);
    RiTextWords firstNew = firstRiTextFor(2);
    float maxWidth = ((TEXT_X_START + MAX_LINE_WIDTH) - firstNew.x);
    String firstLine = trimToWidth(remaining, maxWidth);
    if (firstLine.length() > 0) {
      next = new RiText(this, firstLine, firstNew.x, lastOld.y); 
      if (next.x == TEXT_X_START) {
        //System.out.println("HANDLING CORNER #1 ***");
        next.y += leading;
      }
      addToPositionList(toAdd, next, 2);
    }

    if (firstLine.length() < remaining.length())
    {
      remaining = newText.substring(firstLine.length());
      while (remaining.length() > 0)
      {
        firstLine = trimToWidth(remaining, MAX_LINE_WIDTH);
        float yAlign = firstNew.y;
        if (next != null) {
          yAlign = next.y;
        }
        else 
          System.err.println("("+selectedParentIdx+","+selectedCubeIdx+") HANDLING CORNER #2, next == null, using firstNew.y ***");
        next = new RiText(this, firstLine, lastOld.x, yAlign+leading);
        addToPositionList(toAdd, next, 2);

        // are there any words left?
        if (firstLine.length() >= remaining.length())
          break;
        remaining = remaining.substring(firstLine.length());
      }
    }
    Collections.reverse(toAdd);
    return toAdd;
  }

  private List handleReplaceFirst(String newText)
  {
    List toAdd = new LinkedList();
    
    // do the last line first
    RiText next = null;
    String remaining = newText;      
    RiTextWords firstNew = firstRiTextFor(1);
    float maxWidth = (firstNew.x-TEXT_X_START)+1;
    String lastLine = reverseTrimToWidth(remaining, maxWidth);     
    if (lastLine.length()>0) {      
      next = new RiText(this, lastLine, firstNew.x, firstNew.y, RIGHT);
      addToPositionList(toAdd, next, 0);         
    }
    
    // check if there are other lines if there are any
    int numLeftOver = remaining.length()-lastLine.length();
    if (numLeftOver > 0) {

      // process the rest of the text in a loop
      remaining = newText.substring(0, numLeftOver);      
      while (remaining.length() > 0) 
      {
        lastLine = reverseTrimToWidth(remaining, MAX_LINE_WIDTH);   
        float yAlign = next != null ? next.y : firstNew.y;
        float xAlign = firstNew.x+textWidth(firstNew.getText());  
        next = new RiText(this, lastLine, xAlign+5, yAlign-leading,RIGHT);
        addToPositionList(toAdd, next, 0); 
        
        // are there any words left?
        numLeftOver = remaining.length()-lastLine.length();
        if (numLeftOver <= 0) break;
        remaining = newText.substring(0, numLeftOver);                                        
      }      
    }
    return toAdd;
  }

  private void addToPositionList(List toAdd, RiText rt, int position) 
  {
    
    int align = rt.alignment;
    String text = rt.getText();
    while (text.startsWith(" "))
      text = text.substring(1);
    
    while (text.endsWith(" "))
      text = text.substring(0,text.length()-1);
    
    //System.out.println(position+"->("+text+")");
    RiTextWords next = new RiTextWords(this, text, rt.x, rt.y, align);   
    text = next.getText();
    //System.out.println(position+": TEXT: "+text);
    
    String hot = currentSelectedWord[position];    
    if (!firstTextCreation) {      
      if (hot == null)
        System.err.println("Null hotword: "+" for " + text + "position="+position);   
        
      String[] words = text.split(" "); 
      
      boolean isSelected = getSelected(position)>-1;
      for (int i = 0; i < words.length; i++) {        
        if (isSelected && words[i].startsWith(hot))
          next.setColor(i, hotColor);        
        else 
          next.setColor(i, textColor);
      }  
    }
   
    RiText.delete(rt);  
    next.align(align);
    //if (align==LEFT && next.x == TEXT_X_START && next.getText());//.startsWith(SPC))
      //next.x = next.x - spaceWidth;  // what about punctuation!?
    //else if (align==RIGHT && next.getText().endsWith(SPC))
      //next.x = next.x + spaceWidth;    
    if (DO_FADES) {
      next.setAlpha(0);           
      next.fadeIn(.5f, 1f);
    }
    toAdd.add(next);
  }

  private RiTextWords firstRiTextFor(int position) {
    return (RiTextWords)riLines[position].get(0);
  }
  
  private RiTextWords lastRiTextFor(int position) {
    return (RiTextWords)riLines[position].get(riLines[position].size()-1);
  }

  private String reverseTrimToWidth(final String newText, float maxWidth)
  {    
    String[] words = newText.split(" ");    
    Stack s = new Stack();
    for (int i = 0; i < words.length; i++)
      s.push(words[i]);    
    String newStr = "";
    while (!s.isEmpty()) {            
      String newWord = (String)s.peek();      
      String check = newWord + " "+newStr;
      if (textWidth(check) > maxWidth)
        break;    
      newStr = check;
      s.pop();
    } 
    return newStr;
  }
  
  private String trimToWidth(final String newText, float maxWidth)
  {    
    String[] words = newText.split(" ");    
    String newStr = "";
    for (int i = 0; i < words.length; i++)
    {
      String check = newStr+" "+words[i];
      if (textWidth(check) > maxWidth) 
        break;
      newStr = check;
    } 
    return newStr;
  }
    
  private void createRiTexts(int[] positions)
  {        
    for (int i = 0; i < positions.length; i++) {
      currentTextIdxs[i] = positions[i]; // store the indexes
      currentText[i] = textFromFile[i][positions[i]]+DELIM+i;     
      currentSelectedWord[i] = hotWords[i][positions[i]];
    }
    RiText[] rts = RiText.createLines(this, 
      currentText, TEXT_X_START, TEXT_Y_START, MAX_CHARS_PER_LINE);
     
    Stack s = new Stack();
    for (int i = rts.length-1; i >= 0; i--) 
      s.push(rts[i]);

    int currentKey = 0;
    while (!s.isEmpty()) 
    {
      RiText rt = (RiText)s.pop(); 
      boolean foundSplit = false;
      if (rt.getText().contains(DELIM+currentKey)) {
        foundSplit = true;
        RiText[] tmp = rt.split(DELIM+currentKey);
        if (tmp==null || tmp.length <1) {
          System.err.println("INVALID SPLIT: "+Util.asList(currentText));
        }
        rt = tmp[0];
        if (tmp.length==2) 
          s.push(tmp[1]);
      }
      addToPositionList(riLines[currentKey], rt, currentKey);//(currentKey, rt);

      if (foundSplit) currentKey++;
    }
    //printLineMap();
  }

 /* // returns added RiText
  private RiText addToLine(int currentKey, RiText tmp)
  {    
    tmp.fill(gray)
    riLines[currentKey].add(tmp);
    return tmp;
  }*/

  private void printLineMap() {
    System.out.println("----------------------------------------------");
    for (int i = 0; i < riLines.length; i++) {
      List l = riLines[i];
      for (Iterator it = l.iterator(); it.hasNext();) {
        RiTextWords rt = (RiTextWords) it.next();
        System.out.println(i+") "+rt.getText());
  }}}
  
  private int getSelected(int i)
  {
    int selectedIdx = -1;
    Cube[] all = cubes[i];
    for (int j = 0; j < all.length; j++)
      if (all[j].selected) selectedIdx = j;
    return selectedIdx;
  }

  private void clearAll() {
    selectedParentIdx = -1;
    selectedCubeIdx = -1;
    for (int j = 0; j < NUM_LG; j++)
      clear(j);
  }
  
  void clear(int j) {       
    for (int i = 0; i < cubes[j].length; i++)
      cubes[j][i].selected = false;
  }
  

  private void replaceInline(RiTextWords rt, String newText)
  {
    float oldLen = textWidth(rt.getText());
    String newStr = "";
    //System.out.println("newText: "+newText);
    while (newText.length() > 0) {      
      char newChar = newText.charAt(newText.length()-1);
      String check = newStr + newChar;
      if (textWidth(check)> oldLen) {
        break;
      }
      newText = newText.substring(0,newText.length()-1);
      newStr = newChar + newStr;
    }
    //System.out.println("NEW="+newStr+" len="+textWidth(newStr)+" vs. "+textWidth(rt.getText()));      
    rt.fadeToText(newStr, 3);
  }

  void selectCube(int parentIdx, int idx) {
    if (idx >= 0) {
      //System.out.println("SELECTED ["+parentIdx+", "+idx+"]");
      cubes[parentIdx][idx].selected = true;
    }
  }

  private void createCubes()
  {
    int idx=0;
    PImage blank = loadImage("blank.png");
    for (int j = 0; j < NUM_LG; j++)
    { 
      largeCubes[j] =  new Cube(NUM_LG, lgCubeSize, blank);  
      largeCubes[j].x = (j+1) * width/4;
      
      //System.err.println("CUBE "+j+":\n");
      for (int i = 0; i < NUM_CUBES; i++)
      {
        float cubeSz = 15;/// random(15, 15);
        cubes[j][i] = new TextCube(i, largeCubes[j], cubeSz, loadImage((++idx)+".png"));
        
        //System.err.println(" "+(i+1)+".png");
        
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

  private void drawCubes()
  {
    for (int j = 0; j < NUM_LG; j++)
    {       
      pushMatrix();
      
        float yOff = height/3f;
        switch(j) {
          case 0:
            yOff = height/3f+40;
            break;
          case 2:
            yOff = height/3f+55;
            break;
        }
        translate(largeCubes[j].x, yOff, 0);// -130);
            
        // rotate everything, including external large cube
        rotateX(rotateX[j]=(frameCount*PI/225+j));
        rotateY(rotateY[j]=(frameCount*PI/250-j));
        rotateZ(rotateZ[j]=(frameCount*PI/275+2*j));

        //ellipse(0,0,210,210);        
         
        for (int i=0; i < cubes[j].length; i++)
        {
          TextCube tc = (TextCube)cubes[j][i];
          pushMatrix();          
            
            if (!tc.selected && !tc.stopped) 
              translate(tc.x, tc.y, tc.z);
            
            if (!tc.selected && tc.rotating) {
              rotateX(frameCount*PI/tc.xRot);
              rotateY(frameCount*PI/tc.yRot);
              rotateZ(frameCount*PI/tc.zRot);
            }       
            if (tc.scale>1 && !tc.selected)
              tc.setScale(.95f);
            
            scale(tc.scale);
            tc.draw();                      
          popMatrix();
          
          // adjust the speeds
          cubes[j][i].x += cubes[j][i].xSpeed;
          cubes[j][i].y += cubes[j][i].ySpeed;
          cubes[j][i].z += cubes[j][i].zSpeed;
          
          // check the walls
          if (cubes[j][i].x > lgCubeSize/2-WALL_OFFSET || cubes[j][i].x < -lgCubeSize/2+WALL_OFFSET)
            cubes[j][i].xSpeed *=-1;
          if (cubes[j][i].y > lgCubeSize/2-WALL_OFFSET || cubes[j][i].y < -lgCubeSize/2+WALL_OFFSET)
            cubes[j][i].ySpeed *=-1;
          if (cubes[j][i].z > lgCubeSize/2-WALL_OFFSET || cubes[j][i].z < -lgCubeSize/2+WALL_OFFSET)
            cubes[j][i].zSpeed *=-1; 
        }        
        largeCubes[j].draw(); 
        
      popMatrix();
    }
  }

  class Cube  
  {    
    int id;
    float x, y, z;
    float w, h, d, scale=1;        
    float xRot, yRot, zRot;
    float xSpeed, ySpeed, zSpeed;
    boolean selected, stopped, rotating=true;    
    PointUV[] vertices = new PointUV[24];
    PImage tex;

    public Cube(int id, float sz) {
      this(id, sz, sz, sz, null);
    }

    public Cube(int id, float sz, PImage p) {
      this(id, sz, sz, sz, p);
    }
    
    public boolean setScale(float scale) {
      if (1==1) throw new RuntimeException("not implemented");
      return false;
    }

    private Cube(int id, float w, float h, float d, PImage p) {
      this.tex = p;
      this.id = id;
      this.w = w;
      this.h = h;
      this.d = d;

      //front
      vertices[0] = new PointUV(-w/2,-h/2,d/2, 0, 0);
      vertices[1] = new PointUV(w/2,-h/2,d/2, 1, 0);
      vertices[2] = new PointUV(w/2,h/2,d/2, 1, 1);
      vertices[3] = new PointUV(-w/2,h/2,d/2, 0, 1);
      
      //left
      vertices[4] = new PointUV(-w/2,-h/2,d/2, 0, 0);
      vertices[5] = new PointUV(-w/2,-h/2,-d/2, 1, 0);
      vertices[6] = new PointUV(-w/2,h/2,-d/2, 1, 1);
      vertices[7] = new PointUV(-w/2,h/2,d/2, 0, 1);
      
      //right
      vertices[8] = new PointUV(w/2,-h/2,d/2, 0, 0);
      vertices[9] = new PointUV(w/2,-h/2,-d/2, 1, 0);
      vertices[10] = new PointUV(w/2,h/2,-d/2, 1, 1);
      vertices[11] = new PointUV(w/2,h/2,d/2, 0, 1);
      
      //back
      vertices[12] = new PointUV(-w/2,-h/2,-d/2, 0, 0); 
      vertices[13] = new PointUV(w/2,-h/2,-d/2, 1, 0);
      vertices[14] = new PointUV(w/2,h/2,-d/2, 1, 1);
      vertices[15] = new PointUV(-w/2,h/2,-d/2, 0, 1);
      
      //top
      vertices[16] = new PointUV(-w/2,-h/2,d/2, 0, 0);
      vertices[17] = new PointUV(-w/2,-h/2,-d/2, 1, 0);
      vertices[18] = new PointUV(w/2,-h/2,-d/2, 1, 1);
      vertices[19] = new PointUV(w/2,-h/2,d/2, 0, 1);
      
      //bottom
      vertices[20] = new PointUV(-w/2,h/2,d/2, 0, 0);
      vertices[21] = new PointUV(-w/2,h/2,-d/2, 1, 0);
      vertices[22] = new PointUV(w/2,h/2,-d/2, 1, 1);
      vertices[23] = new PointUV(w/2,h/2,d/2, 0, 1);
    }      
   
    public void draw(){
      if (tex == null) noFill(); else fill(255); 
      //stroke(colors[0][0],colors[0][1],colors[0][2]); 
      stroke(230,230,230); 
      //noStroke();      
      for (int i=0; i<6; i++){
        beginShape(QUADS);             
        if (tex != null) {
          //fill(255);
          tint(255, CUBE_ALPHA);
          texture(tex);
        }
        for (int j=0; j<4; j++)
          vertex(vertices[j+4*i].x, vertices[j+4*i].y, vertices[j+4*i].z);
        endShape();
      }
    }    
  }   
  
/*  static final float[][] cubeCols = {  
      Util.unhex(0xf4dc00), // yellow 
      Util.unhex(0x6f84b1), // slate
      Util.unhex(0xcee9e2), // teal
      Util.unhex(0xde5e05), // orange
      Util.unhex(0xbc4e8d), // pink      
      Util.unhex(0xca9500), // mauve
  };*/
  class TextCube extends Cube {
    
    Cube parent;
    float[][] tc;
    
    TextCube(int id, Cube cube, float sz, PImage texture) {
      super(id, sz);
      this.tc = new float[6][4];
      //tc[0] = colors[2]; // teal
      for (int i = 0; i < tc.length; i++)
      {
        tc[i] = colors[(int)random(colors.length)];
      }
      
      this.parent = cube;
      this.tex = texture;
    }
    
    public String toString()
    {    
      return "["+parent.id+","+id+"]="+scale;
    }   
    
    // returns true if a scale-change was made
    public boolean setScale(float factor) {     
      if (factor>1 && scale >= maxSize)
        return false;
      if (factor<1 && scale <= 1)
        return false;           
      scale *= factor;
      return true; 
     // if (factor<1)
      //System.err.println("scale="+scale+ "  fac="+factor);
    }
    
    public void draw(){
      noStroke();
      for (int i=0; i<6; i++){
        fill(255);
        //stroke(0);
        beginShape(QUADS);
        tint(tc[i][0], tc[i][1], tc[i][2], 128);
        texture(tex);
        for (int j=0; j<4; j++) {
          vertex(vertices[j+4*i].x, vertices[j+4*i].y,
            vertices[j+4*i].z, vertices[j+4*i].u, vertices[j+4*i].v);
        }
        endShape();
      }
    }
  }

  class PointUV {
    float x, y, z, u, v;

    PointUV(float x, float y, float z){
      this.x = x;
      this.y = y;
      this.z = z;
    }
    PointUV(float x, float y, float z, float u, float v){
      this.x = x;
      this.y = y;
      this.z = z;
      this.u = u;
      this.v = v;
    }
  }
  
  public static void main(String[] args)
  {
    //DEFAULT_HOME_URL = System.getProperty("user.dir")+"/src/data/";
    PApplet.main(new String[]{"--present", "--hide-stop", "--bgcolor="+HEX_BG ,Roulette.class.getName()});      
  }
}
