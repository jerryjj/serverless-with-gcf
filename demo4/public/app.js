/**
 * FirebaseUI initialization to be used in a Single Page application context.
 */

/**
 * @return {!Object} The FirebaseUI config.
 */
function getUiConfig() {
  return {
    'callbacks': {
      // Called when the user has been successfully signed in.
      'signInSuccess': function(user, credential, redirectUrl) {
        handleSignedInUser(user);
        // Do not redirect.
        return false;
      }
    },
    // Opens IDP Providers sign-in flow in a popup.
    'signInFlow': 'redirect',
    'signInOptions': [
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
          size: 'normal'
        },
        defaultCountry: 'FI'
      }
    ],
    // Terms of service url.
    'tosUrl': 'https://www.google.com'
  };
}

var db = firebase.database();
var storage = firebase.storage();

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
  let data = {
    phone: user.phoneNumber
  };
  db.ref('users/' + user.uid).set(data);

  document.getElementById('user-signed-in').style.display = 'block';
  document.getElementById('user-signed-out').style.display = 'none';
  document.getElementById('phone').textContent = user.phoneNumber;

  const containerElement = document.getElementById('notes-row').getElementsByClassName('items')[0];
  containerElement.innerHtml = '';

  var notesRef = db.ref('notes/' + user.phoneNumber);
  notesRef.limitToLast(15).on('child_added', function(data) {
    upsertNoteElement(data.key, data.val());
  });
  notesRef.limitToLast(15).on('child_changed', function(data) {
    upsertNoteElement(data.key, data.val());
  });
};

var upsertNoteElement = function(key, data) {
  const containerElement = document.getElementById('notes-row').getElementsByClassName('items')[0];
  let el = buildNoteElement(key, data);
  if (!document.getElementById('note-' + key)) {
    containerElement.insertBefore(el, containerElement.firstChild);
  }
};

var buildNoteElement = function(key, data) {
  const createdAt = new Date(parseInt(key));
  let html = '<li id="note-' + key + '" class="media well">';
  html += '<p class="createdAt">' + createdAt.toString() + '</p>';
  html += '<div class="transcripting" style="display: none;">Generating transcript</div>';
  html += '<p class="transcript"></p>';
  html += '<div class="button listen-button">Listen</div>';
  html += '</li>';

  // Create the DOM element from the HTML.
  const holder = document.createElement('ul');
  holder.innerHTML = html;
  let noteElement = holder.firstChild;
  if (document.getElementById(`note-${key}`)) {
    noteElement = document.getElementById(`note-${key}`);
  }

  if (data.generatingTranscript) {
    noteElement.getElementsByClassName('transcripting')[0].style.display = 'block';
  } else {
    noteElement.getElementsByClassName('transcripting')[0].style.display = 'none';
  }

  noteElement.getElementsByClassName('transcript')[0].innerText = data.transcript || '';

  noteElement.getElementsByClassName('listen-button')[0]
  .addEventListener('click', function() {
    var audioRef = storage.ref(data.audio);
    audioRef.getDownloadURL().then(function(url) {
      var audio = new Audio(url);
      audio.play();
    });
  });

  return noteElement;
};

/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
  document.getElementById('user-signed-in').style.display = 'none';
  document.getElementById('user-signed-out').style.display = 'block';
  ui.start('#firebaseui-container', getUiConfig());
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('loaded').style.display = 'block';
  user ? handleSignedInUser(user) : handleSignedOutUser();
});

/**
 * Deletes the user's account.
 */
var deleteAccount = function() {
  var uid = firebase.auth().currentUser.uid;
  var phone = firebase.auth().currentUser.phoneNumber;
  db.ref('users/' + uid).remove();
  db.ref('notes/' + phone).remove();

  firebase.auth().currentUser.delete().catch(function(error) {
    if (error.code == 'auth/requires-recent-login') {
      // The user's credential is too old. She needs to sign in again.
      firebase.auth().signOut().then(function() {
        // The timeout allows the message to be displayed after the UI has
        // changed to the signed out state.
        setTimeout(function() {
          alert('Please sign in again to delete your account.');
        }, 1);
      });
    }
  });
};

/**
 * Initializes the app.
 */
var initApp = function() {
  document.getElementById('sign-out').addEventListener('click', function() {
    firebase.auth().signOut();
  });
  document.getElementById('delete-account').addEventListener('click',
    function() {
      deleteAccount();
    }
  );

  ui.reset();
  ui.start('#firebaseui-container', getUiConfig());
};

window.addEventListener('load', initApp);
