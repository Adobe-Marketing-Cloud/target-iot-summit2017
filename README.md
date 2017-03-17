# Adobe Target IoT Node.js server

An sample React app that uses `target-node-client` to showcase some of the IoT integrations.

## Features:

- Generate page on the server
- Implement Adobe Target server side to generate targeted content
- Websocket push to web page to show content.
- Expose API to set state of IoT device profile.

## Run application

1. Clone the repo
```bash
git clone https://github.com/Adobe-Marketing-Cloud/target-iot-summit2017
```

2. Run the mock server
```bash 
npm run mock
```
This will simulate a Target Edge Server to Server REST API 

3. Run the sample React app
```bash
npm run www
``` 
NOTE: You will have to run this in another terminal window.

Once the application started, open your browser and go to 
http://localhost:5000. You should see an image of Bumblebee the 
Transformer Autobot.

If you want to hit a production server from the React app, make sure 
that you customize the values in ```config.json```. For example if you 
want to get some personalized content using ```adobe``` client code you 
should change the ```config.json``` to something like this:
```json
{
  "client": "adobe"
}
```
