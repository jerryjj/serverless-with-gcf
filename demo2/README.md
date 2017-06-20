# Source Control deployment Demo

This function is deployed from source control

## Steps

1. Setup your Repository https://cloud.google.com/source-repositories/docs/setting-up-repositories
2. (Optional) Connect your Github or Bitbucket repository https://cloud.google.com/source-repositories/docs/connecting-hosted-repositories
3. Create directory "functions"
4. Create functions/index.js -file with following contents:

```js
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloPubSub = function (event, callback) {
  const pubsubMessage = event.data;
  const name = pubsubMessage.data ? Buffer.from(pubsubMessage.data, 'base64').toString() : 'World';

  console.log(`Hello, ${name}!`);

  callback();
};
```

5. Initialize your repository and configure git to authenticate to your repository

```sh
gcloud init && git config credential.helper gcloud.sh
```

6. Add your Cloud Repository as a remote

```sh
git remote add google \
  https://source.developers.google.com/p/<PROJECT_ID>/r/<REPOSITORY_ID>
```

7. Commit your code to repository

```sh
git add functions
git commit -a -m "initial commit"
git push google
```

7. Deploy your code

```sh
gcloud beta functions deploy helloPubSub \
  --source-url https://source.developers.google.com/p/<PROJECT_ID>/r/<REPOSITORY_ID> \
  --source-path /functions \
  --trigger-topic hello_pubsub
```

8. Test your function as in the triggering instructions

## Triggering

```sh
gcloud beta pubsub topics publish hello_pubsub '{"name": "Demoer"}'
```

Get the latest logs

```sh
gcloud beta functions logs read --limit 10
```
