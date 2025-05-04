"use strict";

const container = document.getElementById(`diamond-container`);

const createDiamond = (size) => {
    container.innerHTML = ``;

    const isEven = size % 2 === 0;
    const totalRows = isEven ? size + 1 : size;
    const middleRow = Math.floor(totalRows / 2);

    for (let i = 0; i < totalRows; i++) {
        const row = document.createElement(`div`);
        row.classList.add(`row`);

        const distanceFromMiddle = Math.abs(middleRow - i);

        let starsInRow;
        if (isEven) {
            if (distanceFromMiddle === middleRow) {
                starsInRow = 1;
            } else {
                starsInRow = size - distanceFromMiddle * 2;
            }
        } else {
            starsInRow = size - distanceFromMiddle * 2;
        }

        const spaces = middleRow - Math.floor(starsInRow / 2);

        for (let s = 0; s < spaces; s++) {
            const space = document.createElement(`span`);
            space.classList.add(`space`);
            row.appendChild(space);
        }

        for (let j = 0; j < starsInRow; j++) {
            const star = document.createElement(`span`);
            star.classList.add(`star`);
            star.textContent = `*`;
            row.appendChild(star);

            if (j !== starsInRow - 1) {
                const innerSpace = document.createElement(`span`);
                innerSpace.classList.add(`space`);
                row.appendChild(innerSpace);
            }
        }

        for (let s = 0; s < spaces; s++) {
            const space = document.createElement(`span`);
            space.classList.add(`space`);
            row.appendChild(space);
        }

        container.appendChild(row);
    }
};

const slideDiamond = () => {
    let direction = 1;
    let position = 0;

    // Function to calculate maxOffset and containerWidth
    const calculateOffsets = () => {
        const containerWidth = container.offsetWidth;
        const viewportWidth = window.innerWidth;
        return viewportWidth - containerWidth;
    };

    // Initial maxOffset
    let maxOffset = calculateOffsets();


    setInterval(() => {
        maxOffset = calculateOffsets();

        if (position >= maxOffset) {
            direction = -1;
        } else if (position <= 0) {
            direction = 1;
        }

        position += direction * 2;
        container.style.left = `${position}px`;
    }, 5); // milliseconds (can adjust for speed)
};

const promptAndStart = () => {
    let size;

    let isValidInput = false;
    while (!isValidInput) {
        size = parseInt(prompt(`Enter the size of your diamond as a number:`), 10);

        if (!isNaN(size) && size > 0) {
            isValidInput = true; // valid input, exit loop
        } else {
            alert(`Please enter a valid number greater than 0`);
        }
    }

    createDiamond(size);
    slideDiamond();
};

// Run the promptAndStart function directly
promptAndStart();
