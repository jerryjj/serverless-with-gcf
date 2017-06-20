'use strict';

const projectId = process.env.GCLOUD_PROJECT;
const region = 'us-central1';

// Import the Google Cloud client libraries
const speech = require('@google-cloud/speech')();
const storage = require('@google-cloud/storage')();

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Get a database reference to our database
const db = admin.database();
const notesRef = db.ref('notes');

exports.analyzeRecording = functions.storage.object().onChange(event => {
  const object = event.data;

  if (object.resourceState === 'not_exists') {
    // Ignore file deletions
    return true;
  } else if (!/^recordings\/\S+\/audio\.wav$/.test(object.name)) {
    // Ignore changes to non-audio files
    return true;
  }

  console.log(`Analyzing gs://${object.bucket}/${object.name}`);

  const bucket = storage.bucket(object.bucket);
  const dir = require('path').parse(object.name).dir;

  // Configure audio settings for Twilio voice recordings
  const audioConfig = {
    sampleRateHertz: 8000,
    encoding: 'LINEAR16',
    languageCode: 'en-US'
  };

  const now = (new Date()).getTime();
  const phoneNumber = object.metadata.phone.trim();

  var ref = notesRef.child(`+${phoneNumber}/${now}`);
  ref.set({
    audio: object.name,
    generatingTranscript: true
  });

  // Transcribe the audio file
  return speech.recognize(bucket.file(object.name), audioConfig)
    // Finally, save the analysis
    .then(([transcript]) => {
      console.log('transcript', transcript);

      ref.update({
        transcript: transcript,
        generatingTranscript: false
      });

      return Promise.resolve();
    });
});
