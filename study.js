// set & get parameters
const port = 8080;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const puzzleID = urlParams.get('puzzleID'); 
const userID = urlParams.get('userID'); 
const weekID = urlParams.get('weekID'); 
//sendStudyParams();

const maxPuzzleID = 6; 
//const maxNumbWords = 16;

updateProgressBar();

document.getElementById("prevBtn").disabled = true;
document.getElementById("nxtBtn").disabled = true;
document.getElementById("submitBtn").disabled = true;

let category;
loadCategory(); 

// update puzzle after the category is loaded. 
let selected_puzzle;
(async() => {
    console.log("waiting for category to be loaded");
    while(category == undefined) 
        await new Promise(resolve => setTimeout(resolve, 2000));
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

//function sendStudyParams() { }

// todo: currently the puzzles are not shuffled. 
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

    // update word set
    var wordsSet_div = document.getElementById("words");
    for (let i = 0; i < selected_puzzle[0].length; i++) {
        var word_wrapper_div = document.createElement("div");
        word_wrapper_div.setAttribute('class', 'col col-3 px2 py1 h3');
        word_wrapper_div.setAttribute('draggable', 'true');
        word_wrapper_div.setAttribute('role', 'option');
        word_wrapper_div.setAttribute('aria-grabbed', 'false');

        var the_word_div = document.createElement("div");
        the_word_div.innerHTML = selected_puzzle[0][i];
        the_word_div.setAttribute('class', 'bg-blue py3 white center');
        //var div_id = maxNumbWords - i;
        //the_word_div.setAttribute('id', `word${div_id}`);

        word_wrapper_div.appendChild(the_word_div);
        wordsSet_div.appendChild(word_wrapper_div);
    } 

    // update hint
    document.getElementById(`hint`).innerHTML = selected_puzzle[1];

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

function previousPuzzle() {
    // save responses before moving to previous puzzle
    saveResponse();

    // create parameterized link
    var prevPuzzleID = parseInt(puzzleID) - 1;
    const url = `https://zhuoliny.github.io/postgenai-auth-server/?puzzleID=${prevPuzzleID}&userID=${userID}&weekID=${weekID}`

    // open link in new tab
    window.open(url, "_self");
}

function nextPuzzle() {
    // save responses before moving to next puzzle
    saveResponse();

    // create parameterized link
    var nextPuzzleID = parseInt(puzzleID) + 1;
    const url = `https://zhuoliny.github.io/postgenai-auth-server/?puzzleID=${nextPuzzleID}&userID=${userID}&weekID=${weekID}`

    // open link in new tab
    window.open(url, "_self");
}

async function saveResponse() {
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
    //var response_json = JSON.stringify(category);

    var userObject = {
        username: userID,
        weekid: weekID,
        puzzleid: puzzleID,
        selected: selected_words,
        unselected: unselected_words
    }

    firebase.database().ref(`user=${userID}`).push().set(userObject)
        .then(function(snapshot) {
            success("saved response"); // some success method
        }, function(error) {
            console.log('error' + error);
            error("unsaved response"); // some error method
        });
}

function wrapUpSession() {
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