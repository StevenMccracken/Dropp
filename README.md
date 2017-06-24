[![Build Status](https://travis-ci.org/StevenMccracken/Dropp.svg?branch=master)](https://travis-ci.org/StevenMccracken/Dropp)

# Dropp
A location-based social media app where posts live for 24 hours. Explore your community and venture to new places to discover dropps around you. Available for iOS and Android platforms.

## Prerequisites
   * [Node v8+](https://nodejs.org/en/)
   * [npm v5+](https://www.npmjs.com/)
   * Service account keys for [Firebase](https://firebase.google.com/) and [Google Cloud Storage](https://cloud.google.com/storage/)

### Firebase account key
1. Go to the [Firebase console](https://console.firebase.google.com/project/dropp-3a65d/settings/serviceaccounts/adminsdk)
2. Click __GENERATE NEW PRIVATE KEY__ at the bottom
3. Name the file ```serviceAccountKey.json``` and place it to the same directory as ```server.js```

### Google Cloud Storage account key
1. Go to the [Google Cloud Storage console](https://console.cloud.google.com/apis/credentials?project=dropp-3a65d)
2. Click __Create credentials__ at the top and then choose __Service account key__ from the dropdown menu
3. Select __storage-adminsdk__ from the dropdown menu and __JSON__ as the Key type
4. Name the file ```storageAccountKey.json``` and place it to the same directory as ```server.js```

### Note: __Never__ put service account keys on Github

## Install node modules
  - ```npm install --save @google-cloud/storage```
  - ```npm install```
### Windows issue: [npm-cli.js not found when running npm](http://stackoverflow.com/questions/24721903/npm-cli-js-not-found-when-running-npm)
   - Quick fix: ```PATH="/c/Program Files/nodejs/:$PATH"```

## Run the server
* ```sudo npm start```

## Test the API routes
* ```sudo npm test```
