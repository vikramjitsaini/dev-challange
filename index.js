/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = false

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

client.connect({}, connectCallback, function(error) {
  alert(error.headers.message)
})

let midPriceList = {};

function connectCallback() {
  // subscribe to the channel for updates after it is connected
  //messageHandler method is a callback method which will be executed for every update
  client.subscribe("/fx/prices", messageHandler);
}

function messageHandler(message) {

  // parse the input message
  var inputMessage = JSON.parse(message.body);

  // this method will calculate the midPrice and will save it in an object
  calculateMidPrice(inputMessage);

  const table = document.getElementById('myTable');

  // as 1 row is header, we will check whether there is any data row or not. if not we will directly add one
  if (table.rows.length != 1) {
    let rowFound = false;

    // we will loop through the table to check if the row is existing one, if yes we w
    for (let i = 0; i < table.rows.length; i++) {
      if (inputMessage.name === table.rows[i].cells[0].innerHTML) {
        rowFound = true; 
        if (inputMessage.bestBid !== table.rows[i].cells[1]) {
          table.rows[i].cells[1].innerHTML = inputMessage.bestBid;
        }
        if (inputMessage.bestAsk !== table.rows[i].cells[2]) {
          table.rows[i].cells[2].innerHTML = inputMessage.bestAsk;
        }
        if (inputMessage.openBid !== table.rows[i].cells[3]) {
          table.rows[i].cells[3].innerHTML = inputMessage.openBid;
        }
        if (inputMessage.openAsk !== table.rows[i].cells[4]) {
          table.rows[i].cells[4].innerHTML = inputMessage.openAsk;
        }
        if (inputMessage.lastChangeAsk !== table.rows[i].cells[5]) {
          table.rows[i].cells[5].innerHTML = inputMessage.lastChangeAsk;
        }
        if (inputMessage.lastChangeBid !== table.rows[i].cells[6]) {
          table.rows[i].cells[6].innerHTML = inputMessage.lastChangeBid;
        }
        const sparkElement = document.createElement('span');
        Sparkline.draw(sparkElement, midPriceList[inputMessage.name]);
        console.log(table.rows[i].cells.length);
        table.rows[i].cells[table.rows[i].cells.length -1].removeChild(table.rows[i].cells[table.rows[i].cells.length -1].childNodes[0]);
        table.rows[i].cells[table.rows[i].cells.length -1].appendChild(sparkElement);
      }
    }
    if (!rowFound) {
      addRowsToTable(table, inputMessage);
    }
  } else {
    addRowsToTable(table, inputMessage);
  }
}


// calculating the midprice by adding the bestBid and bestAsk fields together and dividing by 2
// i will use an object where key will be the name and value will be an Array containing all values
function calculateMidPrice(inputMessage) {
  const midPrice = Math.floor((parseInt(inputMessage.bestBid) + parseInt(inputMessage.bestAsk) / 2));
  if (midPriceList[inputMessage.name]) {
    const midPriceArray = midPriceList[inputMessage.name];
    midPriceArray.push(midPrice);
    midPriceList[inputMessage.name] = midPriceArray;
  } else {
    midPriceList[inputMessage.name] = [midPrice];  
  }
}

// method to add rows to table
function addRowsToTable(table, inputMessage) {
  let newRow = table.insertRow(table.length);
  Object.keys(inputMessage).forEach(function(key, index) {
    newRow.insertCell(index).innerHTML = inputMessage[key];
  });

  const sparkElement = document.createElement('span');
  Sparkline.draw(sparkElement, midPriceList[inputMessage.name]);
  newRow.insertCell(newRow.cells.length).appendChild(sparkElement);
} 


 

