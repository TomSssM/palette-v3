import Tool from './Tool.js';

export default class extends Tool {
  constructor(data) {
    super(data);
    this.isMoving = false;
  }

  init() {
    this.events.mousedown = (e) => {
      this.onMouseDown(e);
    };
    this.events.mousemove = (e) => {
      this.onMouseMove(e);
    };
    this.events.mouseup = (e) => {
      this.onMouseUp(e);
    };
    this.events.mouseleave = () => {
      this.onMouseUp();
    };
    this.events.dragstart = (e) => {
      e.preventDefault();
    };
  }

  onMouseDown(e) {
    if (e.target === this.paint.canvas) return;
    this.isMoving = true;
    this.currElem = e.target;
    this.offsetsData = {
      left: 0,
      top: 0,
    };
  }

  onMouseMove(e) {
    if (!this.isMoving) return;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target === this.currElem) return;

    // for rounded elements:
    if (target === this.paint.canvas) return;

    this.onSwap(target);
  }

  onMouseUp() {
    if (!this.isMoving) return;
    this.isMoving = false;
    this.RebuildTheGrid();
  }

  onSwap(swapWith) {
    if (!this.paint.canvas.contains(swapWith)) return;
    const currI = +this.currElem.dataset.i;
    const currY = +this.currElem.dataset.y;
    const swapI = +swapWith.dataset.i;
    const swapY = +swapWith.dataset.y;
    if (swapI < currI) {
      this.swapLeft();
    } else if (swapI > currI) {
      this.swapRight();
    } else if (swapY < currY) {
      this.swapTop();
    } else {
      this.swapBottom();
    }
    this.offsetCanvas();
  }

  swapLeft() {
    this.offsetsData.left -= 1;
  }

  swapRight() {
    this.offsetsData.left += 1;
  }

  swapTop() {
    this.offsetsData.top -= 1;
  }

  swapBottom() {
    this.offsetsData.top += 1;
  }

  offsetCanvas() {
    const marginLeft = this.offsetsData.left * this.SIZE;
    const marginTop = this.offsetsData.top * this.SIZE;
    this.paint.canvas.style.transform = `translate(${marginLeft}px, ${marginTop}px)`;
  }

  RebuildTheGrid() {
    this.paint.canvas.style.transform = '';
    if (this.offsetsData.left === 0 && this.offsetsData.top === 0) return;

    this.offsetsData.left = +this.offsetsData.left;
    this.offsetsData.top = +this.offsetsData.top;

    const detail = {
      x: this.offsetsData.left,
      y: this.offsetsData.top,
    };

    if (this.offsetsData.left !== 0) {
      if (this.offsetsData.left < 0) {
        this.deleteColumnsLeft();
      } else {
        this.deleteColumnsRight();
      }
    }

    if (this.offsetsData.top !== 0) {
      if (this.offsetsData.top < 0) {
        this.deleteRowsTop();
      } else {
        this.deleteRowsBottom();
      }
    }

    this.setIndexes();
    this.genEvent('move-frames-via', detail);
  }

  deleteRowsTop() {
    let n = -this.offsetsData.top;
    let appendArr;
    let newElem;
    let item;
    const arr = this.paint.elmsArray;
    const { canvas } = this.paint;
    while (n) {
      appendArr = [];
      item = arr.shift();
      for (let i = 0; i < item.length; i += 1) {
        item[i].remove();
        newElem = this.paint.constructor.createElem();
        canvas.append(newElem);
        appendArr.push(newElem);
      }
      arr.push(appendArr);
      n -= 1;
    }
  }

  deleteRowsBottom() {
    let n = this.offsetsData.top;
    let item;
    let prependArr;
    let newElem;
    const arr = this.paint.elmsArray;
    const { canvas } = this.paint;
    while (n) {
      prependArr = [];
      item = arr.pop();
      for (let i = 0; i < item.length; i += 1) {
        item[i].remove();
        newElem = this.paint.constructor.createElem();
        canvas.prepend(newElem);
        prependArr.unshift(newElem);
      }
      arr.unshift(prependArr);
      n -= 1;
    }
  }

  deleteColumnsLeft() {
    let n = -this.offsetsData.left;
    let row;
    let newElem;
    const arr = this.paint.elmsArray;
    while (n) {
      for (let i = 0; i < arr.length; i += 1) {
        row = arr[i];
        newElem = this.paint.constructor.createElem();
        row[row.length - 1].after(newElem);
        row.shift().remove();
        row.push(newElem);
      }
      n -= 1;
    }
  }

  deleteColumnsRight() {
    let n = this.offsetsData.left;
    let row;
    let newElem;
    const arr = this.paint.elmsArray;
    while (n) {
      for (let i = 0; i < arr.length; i += 1) {
        row = arr[i];
        newElem = this.paint.constructor.createElem();
        row[0].before(newElem);
        row.pop().remove();
        row.unshift(newElem);
      }
      n -= 1;
    }
  }

  setIndexes() {
    const lengthColumn = this.paint.elmsArray.length;
    const lengthRow = this.paint.elmsArray[0].length;
    for (let y = 0; y < lengthColumn; y += 1) {
      for (let i = 0; i < lengthRow; i += 1) {
        this.paint.elmsArray[y][i].dataset.i = i;
        this.paint.elmsArray[y][i].dataset.y = y;
      }
    }
  }

  get SIZE() {
    return this.paint.SIZE;
  }
}
