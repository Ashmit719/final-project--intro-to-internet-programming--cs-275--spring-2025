"use strict";

var container = document.getElementById(`diamond-container`);
var createDiamond = function createDiamond(size) {
    container.innerHTML = ``;
    var midpoint = Math.floor(size / 2);
    for (var i = 0; i < size; i++) {
        var row = document.createElement(`div`);
        row.classList.add(`row`);
        var distanceFromCenter = Math.abs(midpoint - i);
        var blocksInRow = size - 2 * distanceFromCenter;
        for (var j = 0; j < blocksInRow; j++) {
            var block = document.createElement(`div`);
            block.classList.add(`block`);
            row.appendChild(block);
        }
        container.appendChild(row);
    }
};
var slideDiamond = function slideDiamond() {
    var direction = 1;
    var position = 0;
    var _updateSlide = function updateSlide() {
        var containerWidth = container.offsetWidth;
        var viewportWidth = window.innerWidth;
        var maxOffset = viewportWidth - containerWidth;
        if (position >= maxOffset || position <= 0) {
            direction *= -1;
        }
        position += direction * 2;
        container.style.transform = `translateX(`.concat(position, `px)`);
        requestAnimationFrame(_updateSlide);
    };
    _updateSlide();
};
var promptAndStart = function promptAndStart() {
    var size = parseInt(prompt(`Enter diamond size (odd or even number >= 3):`), 10);
    if (isNaN(size) || size < 3) {
        alert(`Please enter a valid number >= 3`);
        return;
    }
    if (size % 2 === 0) {
    // Even size is valid, no center duplication
    }
    createDiamond(size);
    slideDiamond();
};
window.addEventListener(`load`, function () {
    promptAndStart();
});
window.addEventListener(`resize`, function () {
    container.style.transform = `translateX(0px)`;
});
//# sourceMappingURL=app.js.map
