// ==UserScript==
// @name         delivery-tracker
// @namespace    casto/scripts
// @version      1.3
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.listValues
// @grant        GM.deleteValue
// ==/UserScript==




//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

// Interface :


GM_addStyle(`

    .button-container {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
        left: 0px;
        width: 40px;
        height: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        gap: 48px;
        z-index:10000;

    }


    .circle-button {
    position: relative;
    left: 20px;
    width: 10px;
    height: 10px;
    border-radius: 5%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center; /* Centers children vertically */
    font-size: 7px;
    font-family: 'Segoe UI', Roboto, sans-serif;
    font-weight: bolder;
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
        height: 100%;
        width: 250px;
        z-index: 10000;
        justify-content: center;
        gap: 35px;

    }


     .overlay-details-container::-webkit-scrollbar {
     display: none;
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
        transform-origin: 0% 50%;
        margin: 0px 0px 0px 60px;
    }


    .overlay-menu-item:hover {
        color: white;
        cursor: pointer;
        transform: scale(1.1);
    }




    .overlay-details-container {
        position: fixed;
        box-sizing: border-box;
        height: 80%;
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
        overflow-y: auto;


    }






    .delivery-item {
        margin: 0px 5px 0px 10px;
        box-sizing: border-box;
        font-size: 14px;
        display: block;
        word-break: break-word;
        width: 100%;
        font-family: 'Segoe UI', Roboto, sans-serif;
        color: white;
        padding: 20px;


    }

`);



let overlay = null; // Holds the overlay element

let OverlayIsVisible = false; // Tracks the overlay's visibility

let detailsContainer1, detailsContainer2, detailsContainer3;


const storedDataString_CW = await GM.getValue('CW_deliveryItemList', '{}');
let CW_deliveryItemList = JSON.parse(storedDataString_CW);;


const storedDataString_19T = await GM.getValue('_19T_deliveryItemList', '{}');
let _19T_deliveryItemList = JSON.parse(storedDataString_19T);



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

        createDeliveryItems(detailsContainer1, CW_deliveryItemList, "allDeliveries");
        createDeliveryItems(detailsContainer2, CW_deliveryItemList, "tomorrowsDeliveries");
        createDeliveryItems(detailsContainer3, CW_deliveryItemList, "todaysDeliveries");

        createDeliveryItems(detailsContainer1, _19T_deliveryItemList, "allDeliveries");
        createDeliveryItems(detailsContainer2, _19T_deliveryItemList, "tomorrowsDeliveries");
        createDeliveryItems(detailsContainer3, _19T_deliveryItemList, "todaysDeliveries");

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







function createDeliveryItems(container, collection, dataSetKey) {
    console.log("Creating delivery items");

    if (!container) {
        console.log("Delivery details container not found");
        return;
    }

    console.log("Details container found : ", container);



    const dataSet = collection[dataSetKey];

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
        deliveryItem.innerHTML = `<strong>Commande :</strong> ${item.deliveryNumber}<br><strong>Client:</strong> ${item.deliveryClient}<br><strong>Date:</strong> ${item.date}`;
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




//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

// API call :

//Function to call an API
async function callAPI(url, method, headers, payload) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: method,
            url: url,
            headers: headers,
            data: payload,
            onload: function(response) {
                resolve(response.responseText);
            },
            onerror: function(error) {
                reject(error);
            }
        });
    });
}


// Function to add days to a Date object
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Function to format a Date object as an ISO string without time information
function toISOStringWithoutTime(date) {
    return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
}

//Fonctions accessoires poçur fetch19TAPI() :
// Function to format a Date object as YYYY-MM-DD

function formatDate(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Ensure two digits
    const day = ('0' + date.getDate()).slice(-2); // Ensure two digits
    return `${year}-${month}-${day}`;
}

async function fetch19TAPI() {

    const _19T_lastTimeCheckKey = '_19T_lastTimeCheck';
    const _19T_lastTimeCheck = await GM.getValue(_19T_lastTimeCheckKey, 0); // Default to 0 if not set
    const currentTime = Date.now();

    // Check if more than an hour has passed
    if (currentTime - _19T_lastTimeCheck > 3600000 || Object.keys(_19T_deliveryItemList).length === 0 ) { //3600000
        const today = new Date();
        const tenDaysFromToday = addDays(today, 10);
        const start = formatDate(today); // Today as start date
        const end = formatDate(tenDaysFromToday); // Today + 10 days as end date

        const url = `https://castorama-api.minutpass.com/1/delivery/deliveries?ticketOfficeId=8716&start=${start}&end=${end}`;

        const method = "GET";
        const headers = {
            authorization: "Token eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXUyJ9.eyJleHAiOjE3MDg3MTQzNzAsImVtYWlsIjoiQXJuYXVkLkRlcmhhbkBjYXN0b3JhbWEuZnIiLCJzZXNzaW9uX3BsYWNlX2NvbnRleHRfa2V5IjoiQ0FTVE9SQU1BIiwiaWF0IjoiMTcwODQ1NTE3MCJ9.aEcKbe3ZxHlnA9j0WNC_9I2m9bs_yPwAAHdmX3gWIyG6tL80Q5LZ_nZLA0m-WoKQRR0VONTNsD4AUFRwrRuRPnjmZ1QnAjnLj_2SFMVbx6zj31AtyS4s7lYvJzXFv_x595HpMObgrpZ516-YAdciukb46j5Lt11KRgLKEcfKf-zP2hiJOXlQAdE-sk40Dpzgsne12vO_V38BrFb1zRL4Bv3OWGxUZmMgKi6kbbDy6ITATRNt1mnRPoDkbV1A1JrgE56j1Qu8pjECRayoXyuItrVSyZzoVlgElIs1ZVj0Psgy25WRSbB-knYziJTZ_SOY69l6CHAhLkgH0bLNfLEHBe9A87kyZP41efYUWe1mKdOc_4RHzW-qYsoAncLMRHMmBG7kONFLKX3ccppPMxd2vXWyqUiohDGM43X_rabudCX-A-3n477XdXYX9RMCRLPaYGfUT9a3XkIbZx6NueJPwOtkA7nHTv5OLbD9SDO2Ook4LpQ6jNzeUbsYshAXl20_-wyr0futoZXngTsL9hV9fPJP98-w4jvJfz0KdOvaA2boNeGd-1OOkfCpVzJ_1m1_ydJys2Ft9sQT03LaOd2LP4qIdVITW-ZWHp36Y_l6NjiNyW8CN5c4FTh8c_TS1vupzuUDLbQ2sUAMCAEw_KQp4wtN2Q4KweBBWz4XlJBHnDU"
        }; // Specify headers if needed

        try {
            const response = await callAPI(url, method, headers, null); // No payload for GET request
            console.log("API call successful:", response);
            await GM.setValue(_19T_lastTimeCheckKey, currentTime);
            return response;
        } catch (error) {
            console.error("API call failed:", error);
        }


    } else {
        console.log("API call bypassed: using stored data.");
        return "bypass";
    }
}


async function parse19TAPIResponse(responseText) {


    if (responseText !== "bypass") {
        const deliveries = JSON.parse(responseText);

        const allDeliveries = [];
        const todaysDeliveries = [];
        const tomorrowsDeliveries = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove time component for accurate comparison
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        deliveries.forEach(delivery => {
            const deliveryDate = new Date(delivery.date);
            deliveryDate.setHours(0, 0, 0, 0); // Normalize time for comparison

            const deliveryItem = {
                deliveryNumber: delivery.order.number,
                deliveryClient: delivery.customer.fullname,
                date: deliveryDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
                moment: delivery.moment,
                zone: delivery.zone.name,
                price: delivery.zone.price,
                pallets: delivery.order.pallets
            };

            // Add to all deliveries
            allDeliveries.push(deliveryItem);

            // Check if the delivery is for today or tomorrow
            if (deliveryDate.getTime() === today.getTime()) {
                todaysDeliveries.push(deliveryItem);
            } else if (deliveryDate.getTime() === tomorrow.getTime()) {
                tomorrowsDeliveries.push(deliveryItem);
            }
        });

        _19T_deliveryItemList = {
            allDeliveries,
            todaysDeliveries,
            tomorrowsDeliveries
        };


        console.log("_19T_deliveryItemList:", _19T_deliveryItemList);

        GM.setValue('_19T_deliveryItemList', JSON.stringify(_19T_deliveryItemList));

        return _19T_deliveryItemList;





    } else {
        const storedDataString = await GM.getValue('_19T_deliveryItemList', '{}'); // Retrieve the stored string
        //console.log("Retrieved string of stored data : ", storedDataString);
        _19T_deliveryItemList = JSON.parse(storedDataString);
        console.log("Retrieved_19T_deliveryItemList : ", _19T_deliveryItemList);
    }

}


async function fetch_CW_API() {

    const CW_lastTimeCheckKey = 'CW_lastTimeCheck';
    const CW_lastTimeCheck = await GM.getValue(CW_lastTimeCheckKey, 0); // Default to 0 if not set
    const currentTime = Date.now();

    // Check if more than an hour has passed
    if (currentTime - CW_lastTimeCheck > 3600000 || Object.keys(CW_deliveryItemList).length === 0 ) { //3600000

        const url = "https://api.production.colisweb.com/api/v5/clients/249/stores/8481/deliveries";
        const method = "POST";
        const headers = {
            "Content-Type": "application/json"
        };

        // Constructing the dynamic payload
        const today = new Date();
        const tenDaysFromToday = addDays(today, 10);
        const payload = {
            filters: {
                timeSlot: {
                    start: toISOStringWithoutTime(today), // Today as start date
                    end: toISOStringWithoutTime(tenDaysFromToday) // Today + 10 days as end date
                },
                statusProvider: ["preOrdered", "confirmed", "pickedUp", "deliveryFailed", "deliveryReturnFailed"]
            },
            sort: {
                timeSlot: "asc"
            },
            page: "1",
            pageSize: "100"
        };

        try {
            const response = await callAPI(url, method, headers, JSON.stringify(payload));
            console.log("API call successful:", response);
            await GM.setValue(CW_lastTimeCheckKey, currentTime);
            return response;
        } catch (error) {
            console.error("API call failed:", error);
        }
    } else {
        console.log("API call bypassed: using stored data.");
        return "bypass";
    }
}


// Parse the delivery API response :
async function parse_CW_response(responseText) {

    if (responseText !== "bypass") {
        const response = JSON.parse(responseText);
        const deliveries = response.deliveries;

        const allDeliveries = [];
        const todaysDeliveries = [];
        const tomorrowsDeliveries = [];

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        deliveries.forEach((delivery) => {
            const deliveryNumber = [...new Set(['ref1', 'ref2', 'ref3', 'ref4']
                                               .map(ref => delivery[ref])
                                               .filter(ref => ref !== null))]
            .join(", ");
            const deliveryClient = `${delivery.shipping.firstName} ${delivery.shipping.lastName}`;
            const date = new Date(delivery.timeSlot.start);
            const status = delivery.statusOriginator;

            const formattedDelivery = {
                deliveryNumber,
                deliveryClient,
                date: date.toISOString().split('T')[0], // Extracting date part only for comparison
                status
            };

            // Add to all deliveries
            allDeliveries.push(formattedDelivery);

            // Check if the delivery is for today
            if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
                todaysDeliveries.push(formattedDelivery);
            }

            // Check if the delivery is for tomorrow
            if (date.toISOString().split('T')[0] === tomorrow.toISOString().split('T')[0]) {
                tomorrowsDeliveries.push(formattedDelivery);
            }
        });

        CW_deliveryItemList = {
            allDeliveries,
            todaysDeliveries,
            tomorrowsDeliveries
        };

        //console.log("Data about to be stored : ", JSON.stringify(CW_deliveryItemList));
        GM.setValue('CW_deliveryItemList', JSON.stringify(CW_deliveryItemList));

        console.log("Delivery Items List:", CW_deliveryItemList);
        return CW_deliveryItemList;

    } else {
        const storedDataString = await GM.getValue('CW_deliveryItemList', '{}'); // Retrieve the stored string
        //console.log("Retrieved string of stored data : ", storedDataString);
        CW_deliveryItemList = JSON.parse(storedDataString);
        console.log("Retrieved CW_deliveryItemList : ", CW_deliveryItemList);
    }
}


//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

// MAIN :



(async function() {
    'use strict';

    console.log("DOM Loaded");
    createButtons();
    console.log("Buttons added");

    const CWresponse = await fetch_CW_API();
    await parse_CW_response(CWresponse);

    const _19TResponse = await fetch19TAPI();
    await parse19TAPIResponse(_19TResponse);

    createOverlay()
    console.log("Overlay added");


})();
