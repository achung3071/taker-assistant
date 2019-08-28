//SHAPE CLASS: Movable rectangles on canvas
class Shape {
  constructor(x, y, w, h, fill) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1;
    this.h = h || 1;
    this.fill = fill || '#AAAAAA';
  }
  //Draw the shape instance to a given context
  draw(ctx) {
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
  //Determine if a point (mx, my) is in a shape's bounds
  contains(mx, my) {
    return (this.x <= mx) && (this.x + this.w >= mx) &&
      (this.y <= my) && (this.y + this.h >= my);
  }
}

//CANVAS STATE CLASS: Manage canvas elements and interaction
class CanvasState {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    //Save background image as a canvas to redraw using this.draw()
    this.image = document.createElement('canvas');
    this.image.width = this.width;
    this.image.height = this.height;
    let imgCtx = this.image.getContext('2d');
    imgCtx.drawImage(this.canvas, 0, 0);
    this.valid = false; //when set to false, canvas will redraw everything
    this.shapes = []; //collection of shapes to be drawn
    this.colors = ['rgba(240,240,0,.5)', 'rgba(0,220,220,.5)', 'rgba(240,170,170,.5)',
      'rgba(150,130,230,.5)', 'rgba(50,240,50,.5)'] //shape colors
    this.colorIndex = 0; //index of the next shape's color
    this.shapeInProg = null; //shape currently being created
    this.startingCoord = null; //starting coordinates of shape being created
    this.dragging = false; //keep track of when mouse is dragging
    this.selection = null; //current selected object
    this.selectionIndex = null; //index of selection in this.shapes
    this.handles = []; //selection handles for selected shape
    this.handleSelected = false; //keep track of when handles are dragged
    this.handleIndex = null; //number of the handle being dragged
    this.dragoffx = 0; //x-offset between cursor and seleciton/handle
    this.dragoffy = 0; //y-offset between cursor and selection/handle
    this.cursorPosition = null; //cursor position for drawing guidelines
    this.labels = []; //object labels coresponding to this.shapes
    this.editMode = false; //whether label is being edited or created (see label-menu.js)
    let myState = this; //save canvasState b/c 'this' changes in eventListener

    canvas.addEventListener('mousedown', e => {
      myState.cursorUpdate(e); //Different cursor when clicking on selection
      let { mx, my } = myState.getMouse(e);
      let shapes = myState.shapes;
      let handles = myState.handles;
      if (canvas.style.cursor === 'crosshair') { //creating shape
        myState.startingCoord = { mx, my };
        myState.dragging = true;
        myState.valid = false;
        return;
      }
      for (let i = 0; i < handles.length; i++) {
        if (handles[i].contains(mx, my)) { //if handle clicked
          let mySel = handles[i];
          myState.dragoffx = mx - mySel.x;
          myState.dragoffy = my - mySel.y;
          myState.dragging = true;
          myState.handleSelected = true;
          myState.handleIndex = i;
          myState.valid = false;
          return; //skip to end of eventListener
        }
      }
      for (let i = shapes.length - 1; i >= 0; i--) { //upper shapes to bottom shapes
        if (shapes[i].contains(mx, my)) { //if shape clicked
          let mySel = shapes[i];
          myState.dragoffx = mx - mySel.x;
          myState.dragoffy = my - mySel.y;
          myState.dragging = true;
          myState.selection = mySel;
          myState.selectionIndex = i;
          myState.valid = false;
          return; //skip to end of eventListener
        }
      }
      //handle or shape has not been selected
      if (myState.selection) { //if selection exists, deselect
        myState.selection = null;
        myState.selectionIndex = null;
        myState.handles = [];
        myState.valid = false; //draw and clear selection border
      }
    });

    canvas.addEventListener('mousemove', e => {
      myState.cursorUpdate(e); //Update cursor when hovering over element
      let { mx, my } = myState.getMouse(e);
      let mySel = myState.selection;
      if (myState.dragging && canvas.style.cursor === 'crosshair') { //shape creation
        let startX = myState.startingCoord.mx;
        let startY = myState.startingCoord.my;
        let x, y, w, h;
        if (mx >= startX) {
          x = startX;
          w = mx - startX;
        } else {
          x = mx;
          w = startX - mx;
        }
        if (my >= startY) {
          y = startY;
          h = my - startY;
        } else {
          y = my;
          h = startY - my;
        }
        myState.shapeInProg = new Shape(x, y, w, h, 'rgba(170, 170, 170, .5)');
        myState.valid = false; //update canvas
      } else if (myState.dragging && myState.handleSelected) { //handle is being moved
        let centerX = mx - myState.dragoffx + 5; //new x-coord of handle center
        let centerY = my - myState.dragoffy + 5; //new y-coord of handle center
        let changeX, changeY; //translation: old handle center -> new handle center
        if (myState.handleIndex === 0) { //upper left
          changeX = centerX - mySel.x;
          changeY = centerY - mySel.y;
          //negative changeX/changeY w/ expansion (left, up)
          mySel.w -= changeX;
          mySel.h -= changeY;
          mySel.x = centerX;
          mySel.y = centerY;
        } else if (myState.handleIndex === 1) { //upper right
          changeX = centerX - (mySel.x + mySel.w);
          changeY = centerY - mySel.y;
          //positive changeX, negative changeY w/ expansion (right, up)
          mySel.w += changeX;
          mySel.h -= changeY;
          mySel.y = centerY;
        } else if (myState.handleIndex === 2) { //lower right
          changeX = centerX - (mySel.x + mySel.w);
          changeY = centerY - (mySel.y + mySel.h);
          //positive changeX/changeY w/ expansion (right, down)
          mySel.w += changeX;
          mySel.h += changeY;
        } else if (myState.handleIndex === 3) { //lower left
          changeX = centerX - mySel.x;
          changeY = centerY - (mySel.y + mySel.h);
          //negative changeX, positive changeY w/ expansion (left, down)
          mySel.w -= changeX;
          mySel.h += changeY;
          mySel.x = centerX;
        }
        //If handle is dragged to opposite side of shape:
        if (mySel.w < 0) { //dragged horizontally
          mySel.x += mySel.w; //mySel.x goes back to left side
          mySel.w = Math.abs(mySel.w); //positive width
          //change current handleIndex to account for new shape
          (myState.handleIndex === 0 || myState.handleIndex === 2) ?
            myState.handleIndex++ : myState.handleIndex--;
        }
        if (mySel.h < 0) { //dragged vertically
          mySel.y += mySel.h; //mySel.y goes back to top side
          mySel.h = Math.abs(mySel.h); //positive height
          //change current handleIndex to account for new shape
          myState.handleIndex = 3 - myState.handleIndex;
        }
        myState.valid = false; //update canvas
      } else if (myState.dragging && mySel) { //shape being moved
        let initX = mx - myState.dragoffx;
        let initY = my - myState.dragoffy;
        mySel.x = initX;
        mySel.y = initY;
        if (initX + mySel.w > myState.width) {
          mySel.x = myState.width - mySel.w;
        } else if (initX < 0) {
          mySel.x = 0;
        }
        if (initY + mySel.h > myState.height) {
          mySel.y = myState.height - mySel.h;
        } else if (initY < 0) {
          mySel.y = 0;
        }
        myState.valid = false; //update canvas
      }
    });

    canvas.addEventListener('mouseup', e => {
      if (canvas.style.cursor === 'crosshair') {
        canvas.style.cursor = 'default';
        if (!myState.shapeInProg) { } //Has not been drawn
        //Otherwise, should exceed size threshold
        else if (myState.shapeInProg.w > 15 || myState.shapeInProg.h > 15) {
          myState.shapeInProg.fill = myState.colors[myState.colorIndex];
          (myState.colorIndex === 4) ? myState.colorIndex = 0 : myState.colorIndex++; //change colorIndex
          myState.shapes.push(myState.shapeInProg);
          document.querySelector('.bg-modal.create-label').style.display = 'block'; //open popup
          document.querySelector('.create-label .label-input').select(); //keep input selected
        }
        myState.shapeInProg = null;
        myState.startingCoord = null;
        myState.valid = false;
      }
      myState.handleSelected = false;
      myState.handleIndex = null;
      myState.dragging = false;
    });

    //KEYBOARD SHORTCUTS
    document.addEventListener('keyup', e => {
      let popupsInvisible = true;
      document.querySelectorAll('.bg-modal').forEach(modal => {
        popupsInvisible = (popupsInvisible && modal.style.display !== 'block');
      });
      if (canvas.style.display === 'block' && popupsInvisible) { //on visible canvas
        if (e.keyCode === 8 && myState.selection) { //delete with backspace
          myState.selection = null;
          myState.handles = [];
          let labelList = document.querySelector('.list-items'); //delete corresponding label
          labelList.removeChild(labelList.childNodes[myState.selectionIndex]);
          myState.labels.splice(myState.selectionIndex, 1); //delete label
          myState.shapes.splice(myState.selectionIndex, 1); //delete shape
          myState.selectionIndex = null;
          myState.valid = false; //update deleted selection
          myState.cursorUpdate(e); //update cursor hovering over deleted selection
        } else if (e.keyCode === 87) { //crosshair cursor when pressing w
          (canvas.style.cursor === 'crosshair') ? canvas.style.cursor = 'default' : canvas.style.cursor = 'crosshair';
          myState.cursorUpdate(e); //change cursor to/from crosshair
        }
      } else if (document.querySelector('.bg-modal.create-label').style.display === 'block' && e.keyCode === 13) {
        document.querySelector('.confirm-label').click(); //add label to right with enter
      }
    });

    this.selectionColor = '#CC0000';
    this.selectionWidth = 2;
    this.interval = 20; //redraw canvas every 20ms
    setInterval(() => myState.draw(), myState.interval);
  }

  clear() { //clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  cursorUpdate(event) { //change selection and handle cursor design
    let { mx, my } = this.getMouse(event);
    let mySel = this.selection;
    let handles = this.handles;
    let resizeCursors = ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize'];
    if (this.canvas.style.cursor !== 'crosshair' && mySel) {
      for (let i = 0; i < handles.length; i++) {
        if (handles[i].contains(mx, my)) {
          this.canvas.style.cursor = resizeCursors[i];
          return;
        }
      }
      if (mySel.contains(mx, my)) {
        this.canvas.style.cursor = 'move';
      } else {
        this.canvas.style.cursor = 'default';
      }
    }
    this.cursorPosition = { mx, my }; //save cursor pos for guidelines
    this.valid = false; //update cursor on canvas
  }

  draw() {
    if (!this.valid) {
      let ctx = this.ctx;
      let shapes = this.shapes;
      this.clear();
      ctx.drawImage(this.image, 0, 0); //keep background image
      if (this.canvas.style.cursor === 'crosshair') { //create guidelines
        let { mx, my } = this.cursorPosition;
        this.ctx.beginPath();
        this.ctx.moveTo(mx, 0);
        this.ctx.lineTo(mx, this.canvas.height);
        this.ctx.moveTo(0, my);
        this.ctx.lineTo(this.canvas.width, my);
        this.ctx.stroke();
        this.cursorPosition = null;
      }
      if (this.shapeInProg !== null) {
        this.shapeInProg.draw(ctx);
      }
      for (let i = 0; i < shapes.length; i++) {
        let shape = shapes[i];
        shape.draw(ctx); //draw shapes
      }
      if (this.selection !== null) { //Draw selection border and handles
        //Highlight the option with the selected shape
        document.querySelector('#labels-menu .list-items').selectedIndex = this.selectionIndex;
        ctx.strokeStyle = this.selectionColor;
        ctx.lineWidth = this.selectionWidth;
        let mySel = this.selection;
        ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
        this.handles = [];
        this.handles.push(new Shape(mySel.x - 5, mySel.y - 5, 10, 10));
        this.handles.push(new Shape(mySel.x + mySel.w - 5, mySel.y - 5, 10, 10));
        this.handles.push(new Shape(mySel.x + mySel.w - 5, mySel.y + mySel.h - 5, 10, 10));
        this.handles.push(new Shape(mySel.x - 5, mySel.y + mySel.h - 5, 10, 10));
        for (let i = 0; i < 4; i++) {
          let cur = this.handles[i];
          cur.draw(ctx);
        }
      }
      this.valid = true;
    }
  }

  getMouse(event) { //get cursor coordinates wrt canvas
    let bbox = this.canvas.getBoundingClientRect();
    let offsetX = bbox.left;
    let offsetY = bbox.top;
    let mx = event.clientX - offsetX;
    let my = event.clientY - offsetY;
    return { mx, my };
  }
}