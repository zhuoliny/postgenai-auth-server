// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-iihA5zqu814Sp6eBano4TvkDJCgSkPg",
  authDomain: "post-gai-server.firebaseapp.com",
  databaseURL: "https://post-gai-server-default-rtdb.firebaseio.com",
  projectId: "post-gai-server",
  storageBucket: "post-gai-server.appspot.com",
  messagingSenderId: "263113946374",
  appId: "1:263113946374:web:d8780045c285d108d7da87",
  measurementId: "G-2CNLYTH1BV"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const userID = urlParams.get("userID");
const pairID = urlParams.get("pairID");
const category = urlParams.get("category");

document.getElementById("submit").addEventListener("click", () => {
  const wordInputs = document.querySelectorAll(".wordInput");
  const wordLabels = [];

  wordInputs.forEach(input => {
    wordLabels.push({
      word: input.value.trim(),
      isCorrect: input.checked
    });
  });

  set(ref(database, 'pairs/' + pairID + '/' + userID + '/' + category), wordLabels)
    .then(() => {
      alert("Responses saved successfully!");
      window.location.href = "thankyou.html";
    });
});
