// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-iihA5zqu814Sp6eBano4TvkDJCgSkPg",
  authDomain: "post-gai-server.firebaseapp.com",
  databaseURL: "https://post-gai-server-default-rtdb.firebaseio.com",
  projectId: "post-gai-server",
  storageBucket: "post-gai-server.firebasestorage.app",
  messagingSenderId: "263113946374",
  appId: "1:263113946374:web:d8780045c285d108d7da87",
  measurementId: "G-2CNLYTH1BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// set & get parameters
//const port = 8080;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const puzzleID = urlParams.get('puzzleID'); 
const userID = urlParams.get('userID'); 
const weekID = urlParams.get('weekID'); 
//sendStudyParams();

const maxPuzzleID = 12; 
const maxNumbWords = 16;

updateProgressBar();

document.getElementById("prevBtn").disabled = true;
document.getElementById("nxtBtn").disabled = true;
document.getElementById("submitBtn").disabled = true;

let category;
loadCategory(); 

let generaldata;

// update puzzle after the category is loaded. 
let selected_puzzle;
let selected_puzzle_words;
let selected_puzzle_traps;
let selected_puzzle_category;
let the_puzzle;
(async() => {
    console.log("waiting for category to be loaded");
    while(category == undefined) 
        await new Promise(resolve => setTimeout(resolve, 500));
    console.log("category is loaded");
    updatePuzzle();
    updateButton();
})();

function updateProgressBar() {
    var elem = document.getElementById("progressBar");
    var width = Math.round((puzzleID / maxPuzzleID) * 100);
    elem.style.width = width + '%';
    elem.textContent = puzzleID + '/' + maxPuzzleID ;
}

function loadCategory() {
    $.getJSON(`https://raw.githubusercontent.com/zhuoliny/postgenai-auth-server/refs/heads/main/userdata/${userID}/category_week${weekID}.json`)
    .done(function( data ) {
        console.log("category loading ...")
        category = data;
    });
}

async function loadGeneraldata(targetCategory) {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/zhuoliny/postgenai-auth-server/refs/heads/main/generaldata/${targetCategory}.csv`);
        const data = await response.text();
        generaldata = data.split("\n");
    } catch (error) {
        console.error('Error fetching CSV:', error);
    }
}

//function sendStudyParams() { }

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}

function getRandomElementsFromArray(arr, n, avoid) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
        taken.push(...avoid);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function updateButton() {
    if (puzzleID == 1) {
        document.getElementById("prevBtn").disabled = true;
    } else {
        document.getElementById("prevBtn").disabled = false;
    }

    if (puzzleID == maxPuzzleID) {
        document.getElementById("nxtBtn").disabled = true;
        document.getElementById("submitBtn").disabled = false;
    } else {
        document.getElementById("nxtBtn").disabled = false;
        document.getElementById("submitBtn").disabled = true;
    }
}

function updatePuzzle() {
    selected_puzzle = Object.values(category[puzzleID - 1]);
    selected_puzzle_words = selected_puzzle[0];
    selected_puzzle_traps = selected_puzzle[1];
    selected_puzzle_category = selected_puzzle[3];
    loadGeneraldata(selected_puzzle_category);

    // get general data of the category
    //while(generaldata == undefined) {
    //    console.log("waiting for general data to be loaded");
    //}
    console.log("general data is loaded");

    var generaldataFirstCol = [];
    for (let i = 0; i < generaldata.length; i++) {
        generaldataFirstCol.push(generaldata[i].split(",")[0]);
    }

    // build puzzle
    the_puzzle = [];
    if (selected_puzzle_traps.length > 4 && selected_puzzle_traps.length < 8) {
        the_puzzle.push(...getRandomElementsFromArray(selected_puzzle_traps, 1)); // current # of trap is fixed; TODO: need to figure out the suitable # of traps.
        the_puzzle.push(...getRandomElementsFromArray(generaldata, maxNumbWords-1-selected_puzzle_words.length, selected_puzzle_words));
    } else {
        if (selected_puzzle_traps.length > 8) {
            the_puzzle.push(...getRandomElementsFromArray(selected_puzzle_traps, 2));
            the_puzzle.push(...getRandomElementsFromArray(generaldata, maxNumbWords-2-selected_puzzle_words.length, selected_puzzle_words));
        } else {
            the_puzzle.push(...getRandomElementsFromArray(generaldata, maxNumbWords-selected_puzzle_words.length, selected_puzzle_words));
        }
    }
    
    // shuffle the words in the puzzle
    shuffle(the_puzzle); 

    // update word set
    var wordsSet_div = document.getElementById("words");
    for (let i = 0; i < the_puzzle[0].length; i++) {
        var word_wrapper_div = document.createElement("div");
        word_wrapper_div.setAttribute('class', 'col col-3 px2 py1 h3');
        word_wrapper_div.setAttribute('draggable', 'true');
        word_wrapper_div.setAttribute('role', 'option');
        word_wrapper_div.setAttribute('aria-grabbed', 'false');

        var the_word_div = document.createElement("div");
        the_word_div.innerHTML = the_puzzle[0][i];
        the_word_div.setAttribute('class', 'bg-blue py3 white center');
        //var div_id = maxNumbWords - i;
        //the_word_div.setAttribute('id', `word${div_id}`);

        word_wrapper_div.appendChild(the_word_div);
        wordsSet_div.appendChild(word_wrapper_div);
    } 

    // update hint
    document.getElementById(`hint`).innerHTML = selected_puzzle[2];

    // update answer box
    var answerBox_div = document.getElementById("answerBox");
    for (let i = 0; i < selected_puzzle[2].length; i++) {
        var word_wrapper_div = document.createElement("div");
        word_wrapper_div.setAttribute('class', 'col col-3 px2 py1 h3');
        word_wrapper_div.setAttribute('draggable', 'true');
        word_wrapper_div.setAttribute('role', 'option');
        word_wrapper_div.setAttribute('aria-grabbed', 'false');

        var the_word_div = document.createElement("div");
        the_word_div.innerHTML = selected_puzzle[2][i];
        the_word_div.setAttribute('class', 'bg-blue py3 white center');
        //var div_id = maxNumbWords - i;
        //the_word_div.setAttribute('id', `word${div_id}`);

        word_wrapper_div.appendChild(the_word_div);
        answerBox_div.appendChild(word_wrapper_div);
    } 
}

function saveResponse() {
    console.log(`puzzleid:${puzzleID}`);
    var selected_words = [];
    var responses_div = document.getElementById("answerBox").children;

    for(var i = 0; i < responses_div.length; i++) {
        var a_response_div = responses_div[i];
        var word_inside_div = a_response_div.children[0];
        var selected_word = word_inside_div.innerHTML;

        selected_words.push(selected_word);
    }
    selected_words.sort();

    var unselected_words = [];
    var wordSet_div = document.getElementById("words").children;

    for(var i = 0; i < wordSet_div.length; i++) {
        var a_word_wrap_div = wordSet_div[i];
        var a_word_div = a_word_wrap_div.children[0];
        var unselected_word = a_word_div.innerHTML;

        unselected_words.push(unselected_word);
    }
    unselected_words.sort();

    category[puzzleID - 1]["selectedWords"] = selected_words;
    category[puzzleID - 1][`wordSet${puzzleID}`] = unselected_words;

    set(ref(database, 'users/' + `${userID}/` + `week${weekID}/` + `puzzle${puzzleID}`), {
        selected: selected_words,
        unselected: unselected_words
    }); 
}

function waitingResponseToBeSaved(pid, uid, wid) {
    console.log("waiting response to be saved and then jump to the next puzzle");

    // create parameterized link
    const url = `https://zhuoliny.github.io/postgenai-auth-server/?puzzleID=${pid}&userID=${uid}&weekID=${wid}`

    // open link in new tab
    window.open(url, "_self");
}

export function previousPuzzle() {
    // save responses before moving to previous puzzle
    saveResponse();

    var prevPuzzleID = parseInt(puzzleID) - 1;
    setTimeout(waitingResponseToBeSaved, 1000, prevPuzzleID, userID, weekID);
}

export function nextPuzzle() {
    // save responses before moving to next puzzle
    saveResponse();

    var nextPuzzleID = parseInt(puzzleID) + 1;
    setTimeout(waitingResponseToBeSaved, 1000, nextPuzzleID, userID, weekID);
}

export function wrapUpSession() {
    saveResponse();

    const url = `http://zhuoliny.github.io/postgenai-auth-server/thankyou.html`

    // open link in new tab
    window.open(url, "_self");
}

sortable('.js-sortable-copy', {
    forcePlaceholderSize: true,
    copy: false,
    acceptFrom: false,
    acceptFrom: '.js-sortable-copy-target',
    placeholderClass: 'mb1 bg-navy border border-yellow',
    dropTargetContainerClass: 'is-drop-target',
    maxItems: 16
});
sortable('.js-sortable-copy-target', {
    forcePlaceholderSize: true,
    copy: false,
    acceptFrom: '.js-sortable-copy',
    placeholderClass: 'mb1 border border-maroon',
    dropTargetContainerClass: 'is-drop-target',
    maxItems: 16
});
sortable('.js-grid', {
            forcePlaceholderSize: true,
            placeholderClass: 'col col-4 border border-maroon'
});
sortable('.js-sortable-connected', {
    forcePlaceholderSize: true,
    connectWith: '.js-connected',
    handle: '.js-handle',
    items: 'li',
    placeholderClass: 'border border-white bg-orange mb1'
});
sortable('.js-sortable-inner-connected', {
    forcePlaceholderSize: true,
    connectWith: 'js-inner-connected',
    handle: '.js-inner-handle',
    items: '.item',
    maxItems: 3,
    placeholderClass: 'border border-white bg-orange mb1'
});
sortable('.js-sortable-buttons', {
    forcePlaceholderSize: true,
    items: 'li',
    placeholderClass: 'border border-white mb1',
    hoverClass: 'bg-yellow'
});