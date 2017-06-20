# Console deployment Demo

This function is deployed from the Google Cloud Console.

## Steps

1. Go to your Cloud Console https://console.cloud.google.com/functions/list
2. Click "Create Function" -button
3. Name your function to "helloWorld" and select "HTTP Trigger" as the trigger type
4. Paste in the following code to the Source Code -editor:

```js
exports.helloWorld = function helloWorld (req, res) {
  const name = req.body.name ? req.body.name : req.query.name;
  res.send(`Hello ${name || 'World'}!`);
};
```
5. Select your previously created Stage bucket
6. Set "Function to execute" to "helloWorld"
7. Click "Create" -button

## Triggering

After the function has finised deploying, you can call it with ie. curl
curl "https://[YOUR_REGION]-[YOUR_PROJECT_ID].cloudfunctions.net/[FUNCTION_NAME]"

Examples:

```sh
curl -X POST -H "Content-Type:application/json" \
https://[YOUR_REGION]-[YOUR_PROJECT_ID].cloudfunctions.net/helloWorld \
-d '{"name": "Demoer"}'
```

```sh
curl https://[YOUR_REGION]-[YOUR_PROJECT_ID].cloudfunctions.net/helloWorld?name=Demoer
```

You can also test your function from the Cloud Console.
