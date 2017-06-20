# Online Voice Memo -service

This is a demo application that uses external service called Twilio to handle incoming
phone calls. Then we transcript those recorded phone calls with Google Cloud Speech API
and store them to Firebase Realtime Database.
Users can authenticate with their phone number and see their recordings in the service.

## Prerequisites

1. Create a Twilio account https://www.twilio.com/try-twilio
2. In your Twilio console, create a phone number https://www.twilio.com/user/account/phone-numbers/getting-started
3. Configure your phone number with correct webhook https://www.twilio.com/console/phone-numbers/incoming

Under *Voice*,
a) set *Configure with* to *Webhooks/TwiML*
b) set *A Call Comes In* to *Webhook* and enter your callback url:

https://us-central1-[YOUR_PROJECT_ID].cloudfunctions.net/handleCall

(Replace the [YOUR_PROJECT_ID] with your own Project Id.)

c) click *Save*

4. Note your Twilio Auth Token, you will need this later on.

5. Install firebase command line tools and login

```sh
npm install -g firebase-tools
firebase login
```

## Steps

1. Initialize this folder with your Firebase project

```sh
firebase use --add
```

2. (Optional) Install local dependencies

```sh
cd gcf/; yarn install; cd../; yarn install
```

3. Configure the Cloud Functions

Copy `gcf/sample-config.json` to `gcf/config.json` and replace the placeholders.

4. Deploy the Google Cloud Functions

```sh
cd gcf/
gcloud beta functions deploy handleCall \
--trigger-http --stage-bucket=[YOUR_STAGING_BUCKET_NAME]

gcloud beta functions deploy getRecording \
--trigger-http --stage-bucket=[YOUR_STAGING_BUCKET_NAME]
```

5. Configure the web app

Copy `public/sample-config.js` to `public/config.js` and replace the placeholders.

6. Deploy to Firebase

```sh
firebase deploy
```

7. Open the app using `firebase open hosting:site`, this will open a browser.
