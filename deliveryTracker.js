// ==UserScript==
// @name         ToggleBar
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
            transition: all 0.5s ease;
            z-index: 5000;
            display: flex;
            flex-direction: column;


    }


    .overlay-title {
         color: white;
         font-size: 24px;
         font-family: 'Segoe UI', Roboto, sans-serif;
         position: absolute;
         left: 125px;
         top : 25%;
         transform: translateX(-50%);
     }

    .overlay-menu-container {
        position: fixed;
        height: 100%;
        width: 250px;
        z-index: 10000;
    }


    .overlay-menu-container::after {
        content: ""; /* No actual content, used for styling purposes */
        z-index: 10000;
        position: relative;
        display: inline-block;
        top: 50%;
        transform: translateY(-50%);
        height: 70%;
        width: 1px;
        background: linear-gradient(
            to bottom,
            rgba(100, 100, 100, 0) 0%,
            rgba(100, 100, 100, 1) 50%,
            rgba(100, 100, 100, 0) 100%
        );
        margin-left: 249px;
    }



    .overlay-menu-item {

        left: 125px;
        position: fixed;
        justify-content: center;
        font-size: 10;
        font-family: 'Segoe UI', Roboto, sans-serif;
        color: #aeafb0;
        font-weight: bold;
        transition: all 0.3s ease;
        transform: translate(-50%,-3px);
        z-index: 10001;
    }


    .overlay-menu-item:hover {
        font-size: 10;
        cursor: pointer;
        color: white;
    }


    .overlay-details-container {
        position: fixed;
        height: 65%;
        width: 250px;
        right: 1px;
        justify-content: space-evenly;
        padding: 20px;
        z-index: 50;

    }

    .overlay-details-container::after {
    content: ""
    }


    .delivery-item {
    justify-content: center;
    font-size: 8;
    font-family: 'Segoe UI', Roboto, sans-serif;
    color: white;
    padding: 10 px;
    }

`);



let overlay = null; // Holds the overlay element

let OverlayIsVisible = false; // Tracks the overlay's visibility

let deliveryInfo = "";

const deliveryItemList = { //test Dataset for development
    allDeliveries: [
        { deliveryNumber: "D001", deliveryClient: "Client A" },
        { deliveryNumber: "D002", deliveryClient: "Client B" },
        { deliveryNumber: "D003", deliveryClient: "Client C" }
    ],
    tomorrowsDeliveries: [
        { deliveryNumber: "D004", deliveryClient: "Client D" },
        { deliveryNumber: "D005", deliveryClient: "Client E" }
    ],
    todaysDeliveries: [
        { deliveryNumber: "D006", deliveryClient: "Client F" },
        { deliveryNumber: "D007", deliveryClient: "Client G" }
    ]
};



const deliveriesData = { // Example data for deliveries
    toComeDeliveries: 5,
    tomorrowDeliveries: 2,
    todayDeliveries: 3
};



function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    console.log("Overlay appended to the body");

    const title = document.createElement('h1');
    title.className = 'overlay-title';
    title.textContent = 'Livraisons';

    overlay.appendChild(title);
    console.log("Title appended to the overlay");


    overlay.style.transform = 'translateX(-100%)';
    void overlay.offsetHeight;


    // Create menu items container
    let menuContainer = null;
    if (!document.querySelector(".overlay-menu-container")) {
        menuContainer = document.createElement('div');
        menuContainer.className = 'overlay-menu-container';
        overlay.appendChild(menuContainer);
        console.log("Menu Container appended to the overlay");
    }

    // Create details tab container
    if (!document.querySelector(".overlay-details-container")) {
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'overlay-details-container';
        overlay.appendChild(detailsContainer);
        console.log("details container appended to the overlay");
    }


    // Names for the menu items
    const menuNames = ['Prévues', 'Demain', 'Aujourd\'hui'];
    const buttonIds = ['toComeDeliveries', 'tomorrowDeliveries', 'todayDeliveries'];


    // Calculate the positions of the circle buttons
    const buttonPositions = ['toComeDeliveries', 'tomorrowDeliveries', 'todayDeliveries'].map(id => {
        const button = document.getElementById(id);
        return button ? button.offsetTop : 0; // Get the Y position of each button, if available

    });


    // Create menu items based on the button positions
    buttonPositions.forEach((posY, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'overlay-menu-item';
        menuItem.textContent = `${['Prévues', 'Demain', 'Aujourd\'hui'][index]} (${[5, 2, 3][index]})`; // Placeholder values
        menuItem.style.position = 'absolute';
        menuItem.style.top = `${posY}px`; // Align vertically with the corresponding button
        menuContainer.appendChild(menuItem);
        console.log("Menu item appended to the menu container");

        //onClick
        menuItem.addEventListener('click',() => {
            console.log("Menu button clicked");
            adjustOverlayWidth(500);

            const dataSetKeys = ['allDeliveries', 'tomorrowsDeliveries', 'todaysDeliveries'];
            console.log("Calling 'createDeliveryItems' with", dataSetKeys[index]);
            createDeliveryItems(dataSetKeys[index]);


        });
    });



    return overlay;
}



function createDeliveryItems(dataSetKey) {
    console.log("Creating delivery items");
    const deliveryDetailsContainer = document.querySelector(".overlay-details-container");
    if (!deliveryDetailsContainer) {
        console.log("Delivery details container not found");
        return;
    }

    console.log("Details container found : ", deliveryDetailsContainer);
    deliveryDetailsContainer.innerHTML = ''; // Clear previous items
    console.log("previous items cleared");

    const dataSet = deliveryItemList[dataSetKey];

    if (!dataSet) {
        console.log("No data set found to populate the container");
        return; // Exit if dataSetKey is not valid
    }
    console.log("data set found to populate the container", dataSet);

    dataSet.forEach((item) => {
        const deliveryItem = document.createElement('div');
        //console.log("div created");
        deliveryItem.className = 'delivery-item';
        //console.log("class assigned");
        // Format the text content to include both the delivery number and client name
        deliveryItem.textContent = `Delivery Number: ${item.deliveryNumber}, Client: ${item.deliveryClient}`;
        deliveryDetailsContainer.appendChild(deliveryItem);
        //console.log("deliveryItem appended to the details container");
    });
}






function toggleOverlay() {
    // if (!overlay) {
    //     overlay = createOverlay();
    //     void overlay.offsetHeight;
    // }
    OverlayIsVisible = !OverlayIsVisible; // Update visibility state
    overlay.style.transform = OverlayIsVisible ? 'translateX(0)' : 'translateX(-100%)';
    overlay.style.width = OverlayIsVisible ? '' : '250px';
    if (OverlayIsVisible) {deliveryInfo = ""};
}


function adjustOverlayWidth(value) {
    if (overlay) {
        overlay.style.width = `${value}px`;
    }
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
    createButtons();
    console.log("Buttons added");
    createOverlay()
    console.log("Overlay added");

})();
