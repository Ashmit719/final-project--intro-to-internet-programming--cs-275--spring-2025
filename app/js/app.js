"use strict";

const container = document.getElementById(`diamond-container`);

const createDiamond = (size) => {
    container.innerHTML = ``;

    const midpoint = Math.floor(size / 2);

    for (let i = 0; i < size; i++) {
      const row = document.createElement(`div`);
      row.classList.add(`text-row`);

      const distance = Math.abs(midpoint - i);
      const starsCount = size - 2 * distance;

      if (starsCount <= 0) continue; // skip invalid rows for even sizes

      const stars = (`* `).repeat(starsCount).trim();
      const totalChars = size * 2 - 1;
      const rowChars = stars.length;
      const paddingSize = Math.floor((totalChars - rowChars) / 2);
      const padding = `\u00A0`.repeat(paddingSize);

      row.textContent = `${padding}${stars}`;
      container.appendChild(row);
    }
  };


const slideDiamond = () => {
  let direction = 1;
  let position = 0;

  const updateSlide = () => {
    const containerWidth = container.offsetWidth;
    const viewportWidth = window.innerWidth;
    const maxOffset = viewportWidth - containerWidth;

    if (position >= maxOffset || position <= 0) {
      direction *= -1;
    }

    position += direction * 2;
    container.style.transform = `translate(${position}px, -50%)`;
    requestAnimationFrame(updateSlide);
  };

  updateSlide();
};

const promptAndStart = () => {
  const size = parseInt(prompt(`Enter the size of your diamond as a number:`), 10);

  if (Number.isNaN(size) || size <= 0) {
    alert(`Please enter a valid number greater than 0`);
    return;
  }

  createDiamond(size);
  slideDiamond();
};

window.addEventListener(`load`, () => {
  promptAndStart();
});

window.addEventListener(`resize`, () => {
  container.style.transform = `translate(0px, -50%)`;
});
