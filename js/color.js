// color.js

let selectedColor = "#000"; // 초기 기본 색상 설정

const gridContainer = document.getElementById("grid-container");
const colorList = document.getElementById("color-list");
const deleteColorButton = document.getElementById("delete-color");
const colorPicker = document.getElementById("color-picker");

const rows = 20;
const cols = 20;
const colorArray = Array.from({ length: rows }, () => Array(cols).fill(null));

gridContainer.style.gridTemplateColumns = `repeat(${cols}, 20px)`;
gridContainer.style.gridTemplateRows = `repeat(${rows}, 20px)`;

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const gridItem = document.createElement("div");
        gridItem.className = "grid-item";
        gridItem.dataset.row = row;
        gridItem.dataset.col = col;
        gridItem.addEventListener("click", function () {
            if (selectedColor) {
                gridItem.style.backgroundColor = selectedColor;
                updateColorArray(row, col, selectedColor);
                updateColorList(selectedColor);
            }
        });
        gridContainer.appendChild(gridItem);
    }
}

colorPicker.addEventListener("input", function () {
    selectedColor = colorPicker.value;
});

function updateColorArray(row, col, color) {
    colorArray[row][col] = color;
    console.log(`Updated colorArray:`, colorArray);
}

function updateColorList(color) {
    let colorItem = Array.from(colorList.children).find(item => item.dataset.color === color);
    if (!colorItem) {
        colorItem = document.createElement("li");
        colorItem.textContent = color;
        colorItem.dataset.color = color;
        colorItem.addEventListener("click", function () {
            selectedColor = color;
            Array.from(colorList.children).forEach(item => item.style.fontWeight = "normal");
            colorItem.style.fontWeight = "bold";
        });
        colorList.appendChild(colorItem);
    }
}

deleteColorButton.addEventListener("click", function () {
    if (!selectedColor) return;
    Array.from(gridContainer.children).forEach(item => {
        const row = item.dataset.row;
        const col = item.dataset.col;
        if (item.style.backgroundColor === selectedColor) {
            item.style.backgroundColor = "white";
            updateColorArray(row, col, null);
        }
    });
    const colorItem = Array.from(colorList.children).find(item => item.dataset.color === selectedColor);
    if (colorItem) {
        colorList.removeChild(colorItem);
    }
    selectedColor = null;
});

export { selectedColor, colorArray }; // selectedColor와 colorArray를 export
