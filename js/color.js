const gridContainer = document.getElementById("grid-container");
const colorPicker = document.getElementById("color-picker");

// Initialize colorArray with null values
const colorArray = Array.from({ length: 20 }, () => Array(20).fill(null));

for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 20; col++) {
        const gridItem = document.createElement("div");
        gridItem.className = "grid-item";
        gridItem.dataset.row = row;
        gridItem.dataset.col = col;
        gridItem.addEventListener("click", function () {
            // Trigger colorPicker
            colorPicker.click();
            colorPicker.oninput = function() {
                const color = colorPicker.value;
                gridItem.style.backgroundColor = color;
                updateColorArray(col, row, color);
            };
        });
        gridContainer.appendChild(gridItem);
    }
}

// Function to update colorArray
function updateColorArray(col, row, color) {
    colorArray[col][row] = color; // Note the correction in col and row order
}

// Debugging: Log colorArray
console.log(colorArray);

