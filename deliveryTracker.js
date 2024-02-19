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

    .button-container {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
        left: 0px;
        width: 60px;
        height: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        gap: 46px;
        z-index:10000;
    }


    .circle-button {
    position: relative;
    left: 20px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center; /* Centers children vertically */
    font-size: 7px;
    font-family: 'Segoe UI', Roboto, sans-serif;
    font-weight: bold;
    z-index: 10001;
    transition: transform 0.3s ease, font-size 0.3s ease, color 0.5s ease;
    color: rgba(255, 255, 255, 0);
    }

    #toComeDeliveries {
        background-color: green;
    }

    #tomorrowDeliveries {
        background-color: orange;
    }

   #todayDeliveries {
      background-color: red;

   }

    .circle-button:hover {
        transform: scale(2);
        cursor: pointer;
        color: rgba(255, 255, 255, 1)
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
            justify-content: center;


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
        position: relative;
        display: flex;
        flex-direction: column;
        width: 250px;
        z-index: 10000;
        justify-content: center;
        gap: 40px;

    }


    .overlay-menu-container::after {
        content: ""; /* No actual content, used for styling purposes */
        z-index: 10000;
        position: fixed;
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
        font-size: 16px;
        font-family: 'Segoe UI', Roboto, sans-serif;
        color: #aeafb0;
        display: flex;
        font-weight: bold;
        transition: all 0.3s ease;
        z-index: 10001;

        margin: 0px 0px 0px 60px;
    }


    .overlay-menu-item:hover {
        font-size: 17px;
        cursor: pointer;
        color: white;
    }


    .overlay-details-container {
        position: fixed;
        box-sizing: border-box;
        height: 65%;
        width: 250px;
        right: 1px;
        justify-content: center;
        padding: 0px;
        z-index: 50;
        opacity: 0;
        transition: opacity 0.8s ease-in-out;
        display: none;
        flex-direction: column;
        top: 50%;
        transform: translateY(-50%);

    }

    .overlay-details-container::after {
    content: ""
    }


    .delivery-item {
        margin: 0px 10px 0px 20px;
        box-sizing: border-box;
        font-size: 14px;
        display: block;
        width: 100%;
        font-family: 'Segoe UI', Roboto, sans-serif;
        color: white;
        padding: 20px;


    }

`);



let overlay = null; // Holds the overlay element

let OverlayIsVisible = false; // Tracks the overlay's visibility

let detailsContainer1, detailsContainer2, detailsContainer3;

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

    // Create details tab containers
    if (document.querySelectorAll(".overlay-details-container").length === 0) {
        detailsContainer1 = document.createElement('div');
        detailsContainer2 = document.createElement('div');
        detailsContainer3 = document.createElement('div');

        detailsContainer1.className = 'overlay-details-container';
        detailsContainer2.className = 'overlay-details-container';
        detailsContainer3.className = 'overlay-details-container';

        detailsContainer1.id = 'detailsContainer1';
        detailsContainer2.id = 'detailsContainer2';
        detailsContainer3.id = 'detailsContainer3';

        overlay.appendChild(detailsContainer1);
        overlay.appendChild(detailsContainer2);
        overlay.appendChild(detailsContainer3);

        //Populating the details container :

        createDeliveryItems(detailsContainer1, "allDeliveries");
        createDeliveryItems(detailsContainer2, "tomorrowsDeliveries");
        createDeliveryItems(detailsContainer3, "todaysDeliveries");

        console.log("details containers appended to the overlay");
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
        menuItem.style.position = 'relative';
        // menuItem.style.top = `${posY}px`; // Align vertically with the corresponding button
        menuContainer.appendChild(menuItem);
        console.log("Menu item appended to the menu container");

        //onClick
        menuItem.addEventListener('click',() => {
            console.log("Menu button clicked");
            adjustOverlayWidth(500);

            switch (index) {
                case 0:
                    toggleDetailsContainer(detailsContainer1);
                    break;
                case 1:
                    toggleDetailsContainer(detailsContainer2);
                    break;
                case 2:
                    toggleDetailsContainer(detailsContainer3);
                    break;
                default:
                    //deliveryInfo = 'No information available';
            }


        });
    });

    return overlay;
}







function createDeliveryItems(container, dataSetKey) {
    console.log("Creating delivery items");

    if (!container) {
        console.log("Delivery details container not found");
        return;
    }

    console.log("Details container found : ", container);
    //container.innerHTML = ''; // Clear previous items


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
        deliveryItem.innerHTML = `<strong>Commande :</strong> ${item.deliveryNumber}<br><strong>Client:</strong> ${item.deliveryClient}`;
        container.appendChild(deliveryItem);
        //console.log("deliveryItem appended to the details container");
    });
}




function toggleDetailsContainer(visibleContainer) {
    const containers = [detailsContainer1, detailsContainer2, detailsContainer3]; // Array of containers
    containers.forEach(container => {
        if (container === visibleContainer) {
            container.style.display = 'flex'; // Make sure it's flex to keep your inner layout
            requestAnimationFrame(() => { // Ensures display is processed before starting opacity transition
                container.style.opacity = 1;
            });
        } else {
            // Wait for the opacity transition to finish before setting display to none
            container.style.opacity = 0;
            setTimeout(() => {
                container.style.display = 'none';
            }, 500); // Ensure this matches your CSS transition time
        }
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
    detailsContainer1.style.opacity = 0;
    detailsContainer2.style.opacity = 0;
    detailsContainer3.style.opacity = 0;
    setTimeout(() => {
        detailsContainer1.style.display = 'none';
        detailsContainer2.style.display = 'none';
        detailsContainer3.style.display = 'none';
    });
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
    const buttonContainer = document.createElement('div');

    buttonContainer.id = "buttonContainer";
    buttonContainer.className = 'button-container';
    document.body.appendChild(buttonContainer);

    // Calculate starting Y position to vertically center buttons
    const totalHeight = (buttonColors.length * 30) + ((buttonColors.length - 1) * 30); // Total height of buttons plus margin
    let startY = (window.innerHeight - totalHeight) / 2;


    // Create and position each button
    buttonColors.forEach((color, index) => {
        const button = document.createElement('div');
        button.id = buttonIds[index];
        button.textContent = deliveriesData[buttonIds[index]];
        button.className = 'circle-button';
        //button.style.top = `${startY}px`;
        startY += 40; // Move down for the next button; 10px height + 10px margin
        button.addEventListener('click', toggleOverlay);

        buttonContainer.appendChild(button);
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
