'use strict';

const config = require('./config.json');
const twilio = require('twilio');

const VoiceResponse = twilio.twiml.VoiceResponse;

const projectId = process.env.GCLOUD_PROJECT;
const region = 'us-central1';

exports.handleCall = (req, res) => {
  if (!isValidRequest(req, res, 'handleCall')) {
    return;
  }

  const recordingStatusCallbackUrl = `https://${region}-${projectId}.cloudfunctions.net/getRecording?phone=${req.body.From}`;

  // Prepare a response to the voice call
  const response = new VoiceResponse();

  // Prompt the user to leave a message
  response.say('Welcome to Firebase Voice Memos. Leave your note after the beep.');

  console.log('Recording message.');

  // Record the user's message
  response.record({
    // Limit the recording to 60 seconds
    maxLength: 60,
    // Give Twilio the deployed url of the other function for when the recorded
    // audio is available
    recordingStatusCallback: recordingStatusCallbackUrl
  });

  // End the call
  response.hangup();

  // Send the response
  res
    .status(200)
    .type('text/xml')
    .send(response.toString())
    .end();
};

function isValidRequest (req, res, pathname) {
  let isValid = true;

  // Only validate that requests came from Twilio when the function has been
  // deployed to production.
  if (process.env.NODE_ENV === 'production') {
    isValid = twilio.validateExpressRequest(req, config.TWILIO_AUTH_TOKEN, {
      url: `https://${region}-${projectId}.cloudfunctions.net/${pathname}`
    });
  }

  // Halt early if the request was not sent from Twilio
  if (!isValid) {
    res
      .type('text/plain')
      .status(403)
      .send('Twilio Request Validation Failed.')
      .end();
  }

  return isValid;
};

exports.getRecording = (req, res) => {
  // if (!isValidRequest(req, res, 'getRecording')) {
  //   return;
  // }

  const phoneNumber = req.query.phone.trim();

  const got = require('got');
  const path = require('path');
  const storage = require('@google-cloud/storage')();

  const filename = `recordings/${path.parse(req.body.RecordingUrl).name}/audio.wav`;
  const file = storage
    .bucket(config.RESULTS_BUCKET)
    .file(filename);

  console.log(`Saving recording to: gs://${config.RESULTS_BUCKET}/${filename}`);

  got.stream(req.body.RecordingUrl)
    .pipe(file.createWriteStream({
      metadata: {
        contentType: 'audio/x-wav',
        metadata: {
          phone: phoneNumber
        }
      }
    }))
    .on('error', (err) => {
      console.error(err);
      res
        .status(500)
        .send(err)
        .end();
    })
    .on('finish', () => {
      console.log('file saved');
      res
        .status(200)
        .end();
    });
};
