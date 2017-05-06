[![Build Status](https://travis-ci.org/StevenMccracken/Dropp.svg?branch=master)](https://travis-ci.org/StevenMccracken/Dropp)

# Dropp
A location-based social media app where posts live for 24 hours. Explore your community and venture to new places to discover dropps around you. Available for iOS and Android platforms.

## Prerequisites
   * Node
   * npm
   * Service account keys for Firebase and Google Cloud Storage

### Firebase account key
1. Go to the [Firebase console](https://console.firebase.google.com/project/dropp-3a65d/settings/serviceaccounts/adminsdk)
2. Click **GENERATE NEW PRIVATE KEY** at the bottom
3. Name the file ```serviceAccountKey.json``` and move it to the same directory as ```server.js```

### Google Cloud Storage account key
1. Go to the [Google Cloud Storage console](https://console.cloud.google.com/apis/credentials?project=dropp-3a65d)
2. Click **Create credentials** at the top and then choose **Service account key** from the dropdown menu
3. Select **storage-adminsdk** from the dropdown menu and **JSON** as the Key type
4. Name the file ```storageAccountKey.json``` and move it to the same directory as ```server.js```

**NOTE: Never put keys on Github (don't edit the gitignore)**

## Install node modules
  - ```sudo npm install --save @google-cloud/storage``` 
  - ```npm install```
  - **Window Problem: [npm-cli.js not found when running npm](http://stackoverflow.com/questions/24721903/npm-cli-js-not-found-when-running-npm)**
   - Quick fix: ```PATH="/c/Program Files/nodejs/:$PATH"```

## Run the server
```sudo npm start``` because the server sometimes writes and deletes temporary files and needs super user privileges

## To Test
```grunt test```
