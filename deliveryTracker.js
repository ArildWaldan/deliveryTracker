// ==UserScript==
// @name         deliveryTracker
// @namespace    http://tampermonkey.net/
// @version      2024-02-16
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// ==/UserScript==


GM_addStyle(`
    .circle-button {
        position: fixed;
        left: 15px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        cursor: pointer;
        color: white; /* Text color */
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0;
        font-family: 'Segoe UI', Roboto, sans-serif;
        font-weight: bold;
        z-index: 10001; /* Ensure a high z-index */
        transition: transform 0.3s ease, font-size 0.3s ease;
        transform: scale(1); /* Initial scale */
    }

    #toComeDeliveries { background-color: green; }
    #tomorrowDeliveries { background-color: orange; }
    #todayDeliveries { background-color: red; }

    .circle-button:hover {
        transform: scale(2.3);
        font-size: 6px;
        cursor: pointer;
}


    .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 250px;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            transform: translateX(-100%);
            transition: transform 0.5s ease;
            z-index: 5000;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 220px;
    }

    .overlay-title {
             color: white;
             font-size: 24px; /* Adjust size as needed */
             font-family: 'Segoe UI', Roboto, sans-serif; /* This is an example; adjust as needed */
             margin: 0 0 20px 0; /* Add some margin below the title */
     }

    .overlay-menu-container {
        display: flex;
        flex-direction: row;
        justify-content: space-around; /* Adjust spacing as needed */
        width: 100%; /* Ensure it spans the full width of the overlay */
        padding: 10px 0; /* Add some vertical padding */

    }

    .overlay-menu-item {
        align-items: left;
        justify-content: left;
        font-size: 8;
        font-family: 'Segoe UI', Roboto, sans-serif;
        color: #aeafb0;
        font-weight: bold;
        transition: all 0.3s ease;
        transform: translateY(-3px);

    }

    .overlay-menu-item:hover {
        font-size: 10;
        cursor: pointer;
        color: white;
    }
`);



let overlay = null; // Holds the overlay element

let OverlayIsVisible = false; // Tracks the overlay's visibility


const deliveriesData = { // Example data for deliveries
    toComeDeliveries: 5,
    tomorrowDeliveries: 2,
    todayDeliveries: 3
};



function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

     const title = document.createElement('h1');
    title.className = 'overlay-title';
    title.textContent = 'Livraisons';

    // Append the title to the overlay
    overlay.appendChild(title);


    overlay.style.transform = 'translateX(-100%)';
    void overlay.offsetHeight;
    document.body.appendChild(overlay);

    // Create menu items container
    const menuContainer = document.createElement('div');
    menuContainer.className = 'overlay-menu-container';

    // Names for the menu items
    const menuNames = ['Prévues', 'Demain', 'Aujourd\'hui'];
    const buttonIds = ['toComeDeliveries', 'tomorrowDeliveries', 'todayDeliveries'];

    // Create and append menu items
    buttonIds.forEach((id, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'overlay-menu-item';
        menuItem.textContent = `${menuNames[index]} (${deliveriesData[id]})`; // Set text with count
        //menuContainer.appendChild(menuItem);
    });
     // Calculate the positions of the circle buttons
    const buttonPositions = ['toComeDeliveries', 'tomorrowDeliveries', 'todayDeliveries'].map(id => {
        const button = document.getElementById(id);
        return button ? button.offsetTop : 0; // Get the Y position of each button, if available
    });

    // Create menu items based on the button positions
    buttonPositions.forEach((posY, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'overlay-menu-item';
        // Example text, replace with actual content as needed
        menuItem.textContent = `${['Prévues', 'Demain', 'Aujourd\'hui'][index]} (${[5, 2, 3][index]})`; // Placeholder values
        // Set the style to position each menu item according to its corresponding button
        menuItem.style.position = 'absolute';
        menuItem.style.top = `${posY}px`; // Align vertically with the corresponding button
        overlay.appendChild(menuItem);
    });


    overlay.appendChild(menuContainer);
    document.body.appendChild(overlay);
    return overlay;


}



function toggleOverlay() {
    if (!overlay) {
        overlay = createOverlay();
        void overlay.offsetHeight;
    }
    OverlayIsVisible = !OverlayIsVisible; // Update visibility state
    overlay.style.transform = OverlayIsVisible ? 'translateX(0)' : 'translateX(-100%)';
}


//Close the overlay on click outside
document.addEventListener('click', function(event) {
    if (OverlayIsVisible && !overlay.contains(event.target)) {
        toggleOverlay();
        event.preventDefault(); // Prevents the default event action
        event.stopPropagation(); // Stops the event from propagating further
    }
}, true); // Using the capturing phase



function createButtons() {
    const buttonColors = ['green', 'orange', 'red']; // Colors in the desired order
    const buttonIds = ['toComeDeliveries', 'tomorrowDeliveries', 'todayDeliveries']; // IDs in the desired order

    // Calculate starting Y position to vertically center buttons
    const totalHeight = (buttonColors.length * 30) + ((buttonColors.length - 1) * 30); // Total height of buttons plus margin
    let startY = (window.innerHeight - totalHeight) / 2;


    // Create and position each button
    buttonColors.forEach((color, index) => {
        const button = document.createElement('div');
        button.id = buttonIds[index];
        button.textContent = deliveriesData[buttonIds[index]];
        button.className = 'circle-button';
        button.style.top = `${startY}px`;
        startY += 40; // Move down for the next button; 10px height + 10px margin
        button.addEventListener('click', toggleOverlay);

        document.body.appendChild(button);
        return (button);
    });


}





(function() {
    'use strict';
    console.log("DOM Loaded");
    createOverlay()
    console.log("Overlay added");
    createButtons();
    console.log("Buttons added");
})();
