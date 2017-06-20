# Google Cloud Function demos

These demos were made for my [Serverless meetup](https://www.meetup.com/Serverless-Finland/events/240578315/) talk about Google Cloud Functions.

## Prerequisites

1. Enable Billing in your Google Cloud Project
2. Enable the Cloud Functions API https://console.cloud.google.com/flows/enableapi?apiid=cloudfunctions
4. Install and initialize the Cloud SDK https://cloud.google.com/sdk/docs/
5. Update and install gcloud components:

```sh
gcloud components update &&
gcloud components install beta
```

6. Create a Stage bucket to your Cloud Storage

```sh
gsutil mb gs://[YOUR_STAGING_BUCKET_NAME]
```

7. Setup your local development environment https://cloud.google.com/nodejs/docs/setup

## Demos

- [Demo 1](https://github.com/jerryjj/serverless-with-gcf/tree/master/demo1):
  Simple HTTP Triggered function deployed through Cloud Console.

- [Demo 2](https://github.com/jerryjj/serverless-with-gcf/tree/master/demo2): Deploying function from Source Control.

- [Demo 3](https://github.com/jerryjj/serverless-with-gcf/tree/master/demo3): Isomorphic React Application.
  Deployed to Firebase Hosting with Firebase Functions and Realtime Database.

- [Demo 4](https://github.com/jerryjj/serverless-with-gcf/tree/master/demo4): Full Web app with Firebase.
  Online Voice Memo -service that uses Twilio, Cloud Functions, Firebase Hosting, Firebase Realtime Database and Firebase Functions.
