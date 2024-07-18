// color grid
let selectedColor = "#ffffff";

const gridContainer = document.getElementById("gridContainer");
const colorList = document.getElementById("colorList");
const deleteColorButton = document.getElementById("delete-color");
const colorPicker = document.getElementById("colorPicker");
const canvas = document.getElementById("beadsCanvas");
const ctx = canvas.getContext("2d");

const rows = 30;
const cols = 30;
const cellSize = 11;
const colorArray = Array.from({ length: rows }, () =>
  Array(cols).fill(selectedColor)
);

gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
gridContainer.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

let isMouseDown = false;

gridContainer.addEventListener("mousedown", function () {
  isMouseDown = true;
});

gridContainer.addEventListener("mouseup", function () {
  isMouseDown = false;
});

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const gridItem = document.createElement("div");
    gridItem.className = "grid-item";
    gridItem.dataset.row = row;
    gridItem.dataset.col = col;

    gridItem.addEventListener("mousedown", function () {
      if (selectedColor) {
        applyBrush(row, col, selectedColor);
      }
    });

    gridItem.addEventListener("mousemove", function () {
      if (isMouseDown && selectedColor) {
        applyBrush(row, col, selectedColor);
      }
    });

    gridContainer.appendChild(gridItem);
  }
}

colorPicker.addEventListener("input", function () {
  selectedColor = colorPicker.value;
  colorPicker.style.color = colorPicker.value;
});

function updateColorArray(row, col, color) {
  if (row < rows && col < cols) {
    colorArray[row][col] = color;
  }
  window.app.updateRopes();
  console.log(`Updated colorArray:`, colorArray);
}

function updateColorList(color) {
  let colorItem = Array.from(colorList.children).find(
    (item) => item.dataset.color === color
  );
  if (!colorItem) {
    colorItem = document.createElement("li");
    colorItem.style.backgroundColor = color;
    colorItem.style.color = color;
    colorItem.dataset.color = color;
    
    colorItem.addEventListener("click", function () {
      selectedColor = color;
      Array.from(colorList.children).forEach(
        (item) => (item.style.fontWeight = "normal")
      );
      colorItem.style.fontWeight = "bold";
    });
    colorList.appendChild(colorItem);
  }
}

function applyBrush(row, col, color) {
  if (row < rows && col < cols) {
    const gridItem = document.querySelector(
      `.grid-item[data-row='${row}'][data-col='${col}']`
    );
    if (gridItem) {
      gridItem.style.backgroundColor = color;
    }
    updateColorArray(row, col, color);
    updateCanvas(row, col, color);
  }
  updateColorList(color);
}

function updateCanvas(row, col, color) {
  ctx.fillStyle = color;
  ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
}

export { selectedColor, colorArray };
