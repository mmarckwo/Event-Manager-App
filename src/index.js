import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

const firebaseConfig = initializeApp({
  apiKey: "AIzaSyCX_TYW7lw5WZRM550vz1rcI_7Hj_sXyCE",
  authDomain: "n423mm.firebaseapp.com",
  projectId: "n423mm",
  storageBucket: "n423mm.appspot.com",
  messagingSenderId: "724202595856",
  appId: "1:724202595856:web:a3ae22dd84bf14badb4c95",
  measurementId: "G-J5BBFQXT07",
});

const auth = getAuth(firebaseConfig);
const db = getFirestore(firebaseConfig);
var viewingCard;

// var currentEditUser;
// var logInBtn = document.getElementById("login");
// var logOutBtn = document.getElementById("logout");
// var addUserBtn = document.getElementById("addUser");
// var getAllDataBtn = document.getElementById("getAllData");
// var getAllDataTwoBtn = document.getElementById("getAllDataAlso");
// var queryBtn = document.getElementById("searchBtn");
// var googleBtn = document.getElementById("googleBtn");

// logInBtn.addEventListener("click", login);
// logOutBtn.addEventListener("click", logout);
// addUserBtn.addEventListener("click", addUserToDB);
// getAllDataBtn.addEventListener("click", getAllData);
// getAllDataTwoBtn.addEventListener("click", getAllDataAlso);
// queryBtn.addEventListener("click", queryData);
// googleBtn.addEventListener("click", signInWithGoogle);

function signInWithGoogle() {
  const auth = getAuth();
  const gProvider = new GoogleAuthProvider();
  signInWithPopup(auth, gProvider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      console.log(user);
    })
    .catch((error) => {
      console.log("error", error);
    });
}

function logout() {
  signOut(auth)
    .then(() => {
      console.log("signed out");
      window.location.hash = "";
    })
    .catch((error) => {
      console.log(error);
    });
}

onAuthStateChanged(auth, (user) => {
  if (user != null) {
    window.location.hash = "home";
    console.log("logged in");
    getAllUserEvents();
  } else {
    window.location.hash = "";
    console.log("no user");
  }
});

function changeRoute() {
  let hashTag = window.location.hash;
  let pageID = hashTag.replace("#", "");

  if (pageID == "" || pageID == "login") {
    changePage(pageID, loginListeners);
  } else if (pageID == "home") {
    changePage(pageID, homeListeners);
  } else if (pageID == "create") {
    changePage(pageID, createListeners);
  } else if (pageID == "view") {
    changePage(pageID, viewListeners);
  } else if (pageID == "edit") {
    changePage(pageID, editListeners);
  } else {
    // if user is logged in home page else login page.
    window.location.hash = "login";
    location.reload();
  }
}

function changePage(pageID, callback) {
  if (pageID == "" || pageID == "login") {
    $.get(`pages/login.html`, function (data) {
      $("#app").html(data);
      if (callback) {
        callback();
      }
    });
  } else if (pageID == "home") {
    $.get(`pages/home.html`, function (data) {
      $("#app").html(data);
      if (callback) {
        callback();
      }
    });
  } else if (pageID == "create") {
    $.get(`pages/create.html`, function (data) {
      $("#app").html(data);
      if (callback) {
        callback();
      }
    });
  } else if (pageID == "view") {
    $.get(`pages/view.html`, function (data) {
      $("#app").html(data);
      if (callback) {
        callback();
      }
    });
  } else if (pageID == "edit") {
    $.get(`pages/edit.html`, function (data) {
      $("#app").html(data);
      if (callback) {
        callback();
      }
    });
  }
}

function loginListeners() {
  // login in button events.
  $("#login").on("click", () => {
    // get username and password from input fields.
    var username = $("#username").val();
    var password = $("#password").val();

    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        $("#errorDiv").html("");
        const user = userCredential.user;
      })
      .catch((error) => {
        if (error.code == "auth/invalid-email") {
          $("#errorDiv").html("That email is invalid.");
        } else if (error.code == "auth/wrong-password") {
          $("#errorDiv").html("Incorrect password.");
        } else if (error.code == "auth/user-not-found") {
          $("#errorDiv").html(
            "That account does not exist. Trying signing up with it instead."
          );
        } else {
          $("#errorDiv").html(
            "There was an error trying to log into that account."
          );
        }
      });
  });

  $("#signup").on("click", () => {
    // get username and password from input fields.
    var username = $("#username").val();
    var password = $("#password").val();

    createUserWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        $("#errorDiv").html("");
        const user = userCredential.user;
      })
      .catch((error) => {
        if (error.code == "auth/email-already-in-use") {
          $("#errorDiv").html("That email is already in use.");
        } else if (error.code == "auth/weak-password") {
          $("#errorDiv").html(
            "That password is too short. It needs to be at least 6 characters long."
          );
        } else {
          $("#errorDiv").html(
            "There was an error signing up with this account. Check your spelling, and make sure your password is at least 6 characters long."
          );
        }
      });
  });

  $("#loginGoogle").on("click", () => {
    signInWithGoogle();
  });
}

async function getAllUserEvents() {
  if (auth.currentUser == null) return;

  const querySnapshot = await getDocs(
    collection(db, `events/${auth.currentUser.uid}/userEvents`)
  );

  if (!querySnapshot.empty) {
    // show the user's events.
    $(".notes").css("display", "flex");
    $(".notes").html("");
    $(".noEvents").css("display", "none");

    // go through each event in the database, add doc id to its card on page, add event listner for the newly made card.
    querySnapshot.forEach((doc) => {
      $(".notes").append(`
      <div class="note" id="${doc.id}">
        <h3>${doc.data().name}</h3>
        <p>${doc.data().month} ${doc.data().day}, ${doc.data().year}</p>
        <p>${doc.data().startHour ? doc.data().startHour : "--"}:${
        doc.data().startMinute ? doc.data().startMinute : "--"
      } ${doc.data().startHour ? doc.data().startCycle : ""}</p>
      </div>
    `);

      // add event listener to recently added note.
      $(`#${doc.id}`).on("click", (e) => {
        e.preventDefault();
        viewingCard = $(`#${doc.id}`).attr("id");
        window.location.hash = "view";
      });
    });
  } else {
    // show the "no event" div.
    $(".noEvents").css("display", "flex");
    $(".notes").css("display", "none");
  }
}

async function getSpecificUserEvent() {
  const docRef = doc(
    db,
    `events/${auth.currentUser.uid}/userEvents`,
    viewingCard
  );
  const docSnap = await getDoc(docRef);

  // if the event data exists, populate elements with available data. else send to home page.
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    window.location.hash = "home";
  }
}

function homeListeners() {
  // get all cards from database.
  getAllUserEvents();

  $("#createCard").on("click", (e) => {
    e.preventDefault();
    window.location.hash = "create";
  });

  $(".noteSection .noEvents #createCardCenter").on("click", (e) => {
    e.preventDefault();
    window.location.hash = "create";
  });

  $("#signout").on("click", (e) => {
    e.preventDefault();
    logout();
  });
}

function createListeners() {
  $("#cancel").on("click", (e) => {
    e.preventDefault();
    window.location.hash = "home";
  });

  $("#submitNote").on("click", async (e) => {
    e.preventDefault();

    var noteObj = getNoteFormValues();

    if (!noteObj) {
      alert("Some fields are invalid. Correct the ones with red text.");
    } else {
      try {
        const docRef = await addDoc(
          collection(db, `events/${auth.currentUser.uid}/userEvents`),
          noteObj
        );

        // after adding, send to home page.
        window.location.hash = "home";
      } catch (e) {
        console.log(e);
      }
    }
  });
}

async function viewListeners() {
  // populate with note data.
  var eventData = await getSpecificUserEvent();
  $(".cardView").html(`
  <button id="backButton">Go Back</button>
  <h2>${eventData.name}</h2>
  <p class="date">${eventData.month} ${eventData.day}, ${eventData.year}</p>
  <p>Time: ${eventData.startHour ? eventData.startHour : "--"}:${
    eventData.startMinute ? eventData.startMinute : "--"
  } ${eventData.startHour ? eventData.startCycle : ""} ${
    eventData.endHour || eventData.endMinute ? "to" : ""
  } ${eventData.endHour ? eventData.endHour : "--"}:${
    eventData.endMinute ? eventData.endMinute : "--"
  } ${eventData.endHour ? eventData.endCycle : ""}</p>
  <p>Attendees: ${
    eventData.attendees ? eventData.attendees : "(Not Provided)"
  }</p>
  <p>Summary:</p>
  <p class="summaryArea">${
    eventData.summary ? eventData.summary : "(Not Provided)"
  }</p>
  <p>To-Do</p>
  <ul>
    <li>${eventData.toDo ? eventData.toDo : "(Not Provided)"}</li>
  </ul>
  </div>
`);

  $("#backButton").on("click", (e) => {
    e.preventDefault();
    window.location.hash = "home";
  });

  $("#editCard").on("click", (e) => {
    e.preventDefault();
    window.location.hash = "edit";
  });

  $("#signout").on("click", (e) => {
    e.preventDefault();
    logout();
  });
}

async function editListeners() {
  // populate input fields with what he have from the card data.
  var eventData = await getSpecificUserEvent();

  // set event name.
  $("#eventName").val(eventData.name);

  // set event date.
  $("#eventMonth").val(eventData.month);
  $("#eventDay").val(eventData.day);
  $("#eventYear").val(eventData.year);

  // set event start time.
  $("#eventTimeStartHour").val(eventData.startHour);
  $("#eventTimeStartMinute").val(eventData.startMinute);
  $("#eventTimeStartCycle").val(eventData.startCycle);

  // set event end time.
  $("#eventEndStartHour").val(eventData.endHour);
  $("#eventEndStartMinute").val(eventData.endMinute);
  $("#eventTimeEndCycle").val(eventData.endCycle);

  // set event attendee number.
  $("#eventAttendees").val(eventData.attendees);

  // set event summary.
  $("#eventSummary").val(eventData.summary);

  // set event to-do.
  $("#eventToDo").val(eventData.toDo);

  $("#cancel").on("click", (e) => {
    e.preventDefault();
    window.location.hash = "home";
  });

  $("#deleteNote").on("click", async (e) => {
    e.preventDefault();

    // delete the document.
    await deleteDoc(
      doc(db, `events/${auth.currentUser.uid}/userEvents`, viewingCard)
    );

    // send to home page.
    window.location.hash = "home";
    alert("Event deleted.");
  });

  $("#editNote").on("click", async (e) => {
    e.preventDefault();

    var noteObj = getNoteFormValues();

    if (!noteObj) {
      alert("Some fields are invalid. Correct the ones with red text.");
    } else {
      const docRef = doc(
        db,
        `events/${auth.currentUser.uid}/userEvents`,
        viewingCard
      );

      // update the document.
      await updateDoc(docRef, noteObj);

      // send to home page.
      window.location.hash = "home";
      alert("Event updated!");
    }
  });
}

function getNoteFormValues() {
  var dataIsValid = true;

  // get event name.
  var eventName = $("#eventName").val();

  // get event date.
  var eventMonth = $("#eventMonth").val();
  var eventDay = $("#eventDay").val();
  var eventYear = $("#eventYear").val();

  // get event start time.
  var eventStartHour = $("#eventTimeStartHour").val();
  var eventStartMinute = $("#eventTimeStartMinute").val();
  var eventStartCycle = $("#eventTimeStartCycle").val();

  // get event end time.
  var eventEndHour = $("#eventEndStartHour").val();
  var eventEndMinute = $("#eventEndStartMinute").val();
  var eventEndCycle = $("#eventTimeEndCycle").val();

  // get event attendee number.
  var eventAttendees = $("#eventAttendees").val();

  // get event summary.
  var eventSummary = $("#eventSummary").val();

  // get event to-do.
  var eventToDo = $("#eventToDo").val();

  // validate event name.
  if (!eventName) {
    $(".eventName label").css("color", "#ed1c24");
    dataIsValid = false;
  } else {
    $(".eventName label").css("color", "white");
  }

  // validate event day.
  // check if a value has been inputted.
  if (eventDay) {
    $("#eventDateTag").css("color", "white");
    // if it is a number, check to see if the day is valid.
    if (!isNaN(eventDay)) {
      if (eventDay < 1 || eventDay > 31) {
        $("#eventDateTag").css("color", "#ed1c24");
        dataIsValid = false;
      }
    } else {
      $("#eventDateTag").css("color", "#ed1c24");
      dataIsValid = false;
    }
  } else {
    $("#eventDateTag").css("color", "#ed1c24");
    dataIsValid = false;
  }

  // validate event start time.
  // START HOUR.
  // check if a value has been inputted.
  if (eventStartHour) {
    $("#eventTimeFrameTag").css("color", "white");
    // if it is a number, check to see if the hour is valid.
    if (!isNaN(eventStartHour)) {
      if (eventStartHour < 1 || eventStartHour > 12) {
        $("#eventTimeFrameTag").css("color", "#ed1c24");
        dataIsValid = false;
      }
    } else {
      $("#eventTimeFrameTag").css("color", "#ed1c24");
      dataIsValid = false;
    }
  } else {
    $("#eventTimeFrameTag").css("color", "white");
  }
  // START MINUTE.
  // check if a value has been inputted.
  if (eventStartMinute) {
    // if it is a number, check to see if the hour is valid.
    if (!isNaN(eventStartMinute)) {
      if (eventStartMinute < 0 || eventStartMinute > 59) {
        $("#eventTimeFrameTag").css("color", "#ed1c24");
        dataIsValid = false;
      }
    } else {
      $("#eventTimeFrameTag").css("color", "#ed1c24");
      dataIsValid = false;
    }
  } else {
  }

  // validate event end time.
  // END HOUR.
  // check if a value has been inputted.
  if (eventEndHour) {
    $("#eventTimeEndTag").css("color", "white");
    // if it is a number, check to see if the hour is valid.
    if (!isNaN(eventEndHour)) {
      if (eventEndHour < 1 || eventEndHour > 12) {
        $("#eventTimeEndTag").css("color", "#ed1c24");
        dataIsValid = false;
      }
    } else {
      $("#eventTimeEndTag").css("color", "#ed1c24");
      dataIsValid = false;
    }
  } else {
    $("#eventTimeEndTag").css("color", "white");
  }
  // END MINUTE.
  // check if a value has been inputted.
  if (eventEndMinute) {
    // if it is a number, check to see if the hour is valid.
    if (!isNaN(eventEndMinute)) {
      if (eventEndMinute < 0 || eventEndMinute > 59) {
        $("#eventTimeEndTag").css("color", "#ed1c24");
        dataIsValid = false;
      }
    } else {
      $("#eventTimeEndTag").css("color", "#ed1c24");
      dataIsValid = false;
    }
  } else {
  }

  // validate attendee value, if inputted.
  if (eventAttendees) {
    if (isNaN(eventAttendees)) {
      $(".attendeeDiv label").css("color", "#ed1c24");
      dataIsValid = false;
    } else {
      $(".attendeeDiv label").css("color", "white");
    }
  } else {
    $(".attendeeDiv label").css("color", "white");
  }

  if (!dataIsValid) {
    return;
  }

  var noteObj = {
    name: eventName,
    month: eventMonth,
    day: eventDay,
    year: eventYear,
    startHour: eventStartHour,
    startMinute: eventStartMinute,
    startCycle: eventStartCycle,
    endHour: eventEndHour,
    endMinute: eventEndMinute,
    endCycle: eventEndCycle,
    attendees: eventAttendees,
    summary: eventSummary,
    toDo: eventToDo,
  };

  return noteObj;
}

function initURLListener() {
  $(window).on("hashchange", changeRoute);
  changeRoute();
}

$(document).ready(function () {
  initURLListener();
});
