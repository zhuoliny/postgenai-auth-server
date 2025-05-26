const fs = require('fs');
const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');

const app = express();
app.use(express.static("."));
const port = process.env.PORT || 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
    console.log('Server started at http://localhost:' + port);
});

// Save raw user data
app.post('/submitData', function(req, res) {
    const { userID, pairID, category, data } = req.body;

    const savePath = path.join(__dirname, `userdata/${pairID}_${userID}_${category}.json`);
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
    res.send("Data saved.");
});

// Compare participant data to generate final puzzle
app.post('/generatePuzzle', function(req, res) {
    const { pairID, category } = req.body;

    try {
        const user1Path = path.join(__dirname, `userdata/${pairID}_user1_${category}.json`);
        const user2Path = path.join(__dirname, `userdata/${pairID}_user2_${category}.json`);

        const data1 = JSON.parse(fs.readFileSync(user1Path));
        const data2 = JSON.parse(fs.readFileSync(user2Path));

        const agreedCorrect = [];
        const agreedIncorrect = [];

        const map1 = new Map(data1.map(item => [item.word.toLowerCase(), item.isCorrect]));
        const map2 = new Map(data2.map(item => [item.word.toLowerCase(), item.isCorrect]));

        for (const [word, isCorrect] of map1.entries()) {
            if (map2.has(word) && map2.get(word) === isCorrect) {
                if (isCorrect) agreedCorrect.push(word);
                else agreedIncorrect.push(word);
            }
        }

        const puzzleWords = [];
        shuffle(agreedCorrect).slice(0, 8).forEach(w => puzzleWords.push({ word: w, isCorrect: true }));
        shuffle(agreedIncorrect).slice(0, 4).forEach(w => puzzleWords.push({ word: w, isCorrect: false }));
        shuffle(puzzleWords);

        const savePath = path.join(__dirname, `userdata/${pairID}_${category}_finalPuzzle.json`);
        fs.writeFileSync(savePath, JSON.stringify(puzzleWords, null, 2));

        res.json({ status: "success", puzzle: puzzleWords });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error generating puzzle.");
    }
});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
