# :key: API Documentation :key:

## Guide Information
* You can send requests to the API routes below to access the server
* For almost all requests, you must have a specific token within the request’s Headers
* There must be a key within the request header called `Authorization` (capitalization of the first letter is necessary)
  * The value associated with that key must be a token
    * You can acquire this token in two ways
      * Creating a user
      * Making a request to the /authenticate route with a matching username and password
* Without the `Authorization` key in the request header and a valid token value, your requests will be __denied__
* The only routes that __do not__ require the Authorization token are:
  * Base route (__GET__ https://dropps.me)
  * Authenticate route (__POST__ https://dropps.me/authenticate)
  * Create user route (__POST__ https://dropps.me/users)
* The URLs in this guide that contain square brackets are meant to have those brackets substituted with with actual values
* The JSON responses in this guide that contain square brackets will have actual values when returned from the server

<a name="table-of-contents"></a>
## Table of Contents

1. [Base route](#base-route)
2. [Authenticate](#authenticate)
3. [Create a user](#create-user)
4. [Retrieve a user's information](#get-user)
5. [Change a user's email](#update-email)
6. [Change a user's password](#update-password)
7. [Delete a user](#delete-user)
8. [Create a dropp](#create-dropp)
9. [Add an image for a posted dropp](#add-image)
10. [Get a dropp](#get-dropp)
11. [Get an image for a specific dropp](#get-image)
12. [Get all relevant dropps](#all-dropps)
13. [Get all dropps around a location](#nearby-dropps)
14. [Get all dropps posted by a user](#users-dropps)
15. [Get all dropps posted by client's follows](#follows-dropps)
16. [Change a dropp's text](#update-text)
17. [Delete a dropp](#delete-dropp)
18. [Request to follow a user](#send-follow-request)
19. [Get a user's followers](#get-followers)
20. [Get a user's follows](#get-follows)
21. [Get a user's follower requests](#get-follower-requests)
22. [Get a user's follow requests](#get-follow-requests)
23. [Accept a follower request](#accept-follower-request)
24. [Decline a follower request](#decline-follower-request)
25. [Cancel pending follow request](#cancel-follow-request)
26. [Remove a follower](#remove-follower)
27. [Unfollow a user](#unfollow)
28. [Error types](#errors)

## Routes

**[⬆ back to top](#table-of-contents)**
<a name="base-route"></a>
### Base route

* Route: __GET__ https://dropps.me
* Purpose
  * Test if the server is up and running
* Required parameters: _none_
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "message": "This is the REST API for Dropp"
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="authenticate"></a>
### Authenticate

* Route: __POST__ https://dropps.me/authenticate
* Purpose: Registers the client on the server so that subsequent requests only require a generated token, not their username and password
* Request body type: `x-www-form-urlencoded`
* Required parameters
  * In the request body
    * `username`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
    * `password`
      * Non-empty string containing alphanumeric and special characters
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Valid login credentials",
      "token": "JWT [random string]"
    }
  }
  ```
* Notes
  * Token will be a string starting with the word ___JWT___ followed by one space, and then a random string of uppercase and lowercase characters, numbers, periods, and underscores
  * This token must be sent in the headers of almost every request

**[⬆ back to top](#table-of-contents)**
<a name="create-user"></a>
### Create a user

* Route: __POST__ https://dropps.me/users
* Purpose: Create a new user
* Request body type: `x-www-form-urlencoded`
* Required parameters
  * In the request body
    * `email`
      * Non-empty string containing a valid email format
    * `username`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
    * `password`
      * Non-empty string containing alphanumeric and special characters
* Optional parameters: _none_
* Successful request returns
  * Status code: __201__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully created user",
      "token": "JWT [random string]"
    }
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="get-user"></a>
### Retrieve a user's information

* Route: __GET__ https://dropps.me/users/[username]
* Purpose: Get information about a user
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[username]`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "followers": {
      "[follower 1 username]": "[follower 1 username]"
    },
    "follows": {
      "[follow 1 username]": "[follow 1 username]"
    }
  }
  ```
* Notes
  * `followers` and `follows` could be non-existent if the user has no followers or follows
  * The key-value pairs for followers and follows will be __identical__ usernames

**[⬆ back to top](#table-of-contents)**
<a name="update-email"></a>
### Change a user's email

* Route: __PUT__ https://dropps.me/users/[username]/email
* Purpose: Update a user's email to a new value
* Request body type: `x-www-form-urlencoded`
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * [`username`]
      * Non-empty string containing alphanumeric characters, dashes, or underscores
  * In the request body
    * `newEmail`
      * Non-empty string containing a valid email format
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully updated email"
    }
  }
  ```
* Notes
  * The `newEmail` value must be __different__ from the existing email in the database

**[⬆ back to top](#table-of-contents)**
<a name="update-password"></a>
### Change a user's password

* Route: __PUT__ https://dropps.me/users/[username]/password
* Purpose: Update a user's password to a new value
* Request body type: `x-www-form-urlencoded`
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * [`username`]
      * Non-empty string containing alphanumeric characters, dashes, or underscores
  * In the request body
    * `oldPassword`
      * Non-empty string containing alphanumeric and special characters
    * `newPassword`
      * Non-empty string containing alphanumeric and special characters
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully updated password"
    }
  }
  ```
* Notes
  * The `oldPassword` value must be __identical__ to the existing password in the database
  * The `newPassword` value must be __different__ from the existing password in the database

**[⬆ back to top](#table-of-contents)**
<a name="delete-user"></a>
### Delete a user

* Route: __DELETE__ https://dropps.me/users/[username]
* Purpose: Delete a user's account and all their dropps
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * [`username`]
      * Non-empty string containing alphanumeric characters, dashes, or underscores
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully deleted user"
    }
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="create-dropp"></a>
### Create a dropp

* Route: __POST__ https://dropps.me/dropps
* Purpose: Create a dropp
* Request body type: `x-www-form-urlencoded`
* Required parameters
  * In the header
    * `Authorization`
  * In the request body
    * `location`
      * Non-empty string containing two floating-point numbers separated by a comma
      * Represents the latitude and longitude of the current location
    * `timestamp`
      * Non-negative integer representing a UNIX timestamp in __seconds__
      * Value __cannot__ be in the future. It must be in the past from the time the server receives the request
    * `media`
      * Non-empty string equal to `true` or `false`
      * Represents whether or not this dropp will have an image attached to it
* Optional parameters
  * In the request body
    * `text`
      * Non-empty string containing alphanumeric characters, special characters, and spaces
      * If `media` is `false`, this value is required and __must__ be non-empty
* Successful request returns
  * Status code: __201__
  * Response body JSON
  ```json
  {
    "droppId": "[droppId value]"
  }
  ```
* Notes
  * `text` attribute will be saved as an empty string if it is not included in the request body
  * Attribute `droppId` is very important to save
    * It is the only unique identifier for a dropp in the database

**[⬆ back to top](#table-of-contents)**
<a name="add-image"></a>
### Add an image for a posted dropp

* Route: __POST__ https://dropps.me/dropps/[droppId]/image
* Purpose: Upload an image for a dropp that has `media` equal to `true`
* Request body type: `form-data`
* Required parameters
  * In the header
    * `Authorization`
  * In the request body
    * `image`
      * Binary data of the image file to upload
* Optional parameters: _none_
* Successful request returns
  * Status code: __201__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully added image"
    }
  }
  ```
* Notes
  * Research `HTTP POST request form-data` to learn how to add binary image data for your language/platform

**[⬆ back to top](#table-of-contents)**
<a name="get-dropp"></a>
### Get a dropp

* Route: __GET__ https://dropps.me/dropps/[droppId]
* Purpose: Retrieve a specific dropp
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * [`droppId`]
      * Non-empty string containing alphanumeric characters, dashes, or underscores
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "timestamp": "[timestamp value]",
    "location": "[location value]",
    "username": "[username value]",
    "media": "[media value]",
    "text": "[text value]"
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="get-image"></a>
### Get an image for a specific dropp

* Route: __GET__ https://dropps.me/dropps/[droppId]/image
* Purpose: Retrieve an image for a specific dropp
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * [`droppId`]
      * Non-empty string containing alphanumeric characters, dashes, or underscores
* Optional parameters:
  * In the header
    * `platform`
      * Non-empty string equal to `React-Native`
* Successful request returns
  * Status code: __200__
  * Response if `platform` is `React-Native`
    * String: `data:image/[image filetype];base64,[image in base-64 string]`
  * Response if no `platform` key exists, or `platform` is not `React-Native`
    * Binary data of the image

**[⬆ back to top](#table-of-contents)**
<a name="all-dropps"></a>
### Get all relevant dropps

* Route: __POST__ https://dropps.me/dropps/all
* Purpose: Retrieve all dropps around a specific location or posted by users who the client follows
* Required parameters
  * In the header
    * `Authorization`
  * In the request body
    * `location`
      * Non-empty string containing two floating-point numbers separated by a comma
      * Represents the latitude and longitude of the current location
    * `maxDistance`
      * Positive floating point number
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "[droppId]": {
        "location": "[location value]",
        "media": "[media value]",
        "text": "[text value]",
        "timestamp": "[timestamp value]",
        "username": "[username value]",
        "nearby": "[nearby value]"
    },
    "[and more dropps]": "..."
  }
  ```
* Notes
  * `nearby` attribute is a string equal to `true` or `false`
    * Represents whether or not the dropp is within `maxDistance` of `location`

**[⬆ back to top](#table-of-contents)**
<a name="nearby-dropps"></a>
### Get all dropps around a location

* Route: __POST__ https://dropps.me/dropps/location
* Purpose: Retrieve all dropps around a specific location
* Required parameters
  * In the header
    * `Authorization`
  * In the request body
    * `location`
      * Non-empty string containing two floating-point numbers separated by a comma
      * Represents the latitude and longitude of the current location
    * `maxDistance`
      * Positive floating point number
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "[droppId]": {
        "location": "[location value]",
        "media": "[media value]",
        "text": "[text value]",
        "timestamp": "[timestamp value]",
        "username": "[username value]"
    },
    "[and more dropps]": "..."
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="users-dropps"></a>
### Get all dropps posted by a user

* Route: __GET__ https://dropps.me/users/[username]/dropps
* Purpose: Retrieve all dropps posted by a specific user
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * [`username`]
      * Non-empty string containing alphanumeric characters, dashes, or underscores
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "[droppId]": {
        "location": "[location value]",
        "media": "[media value]",
        "text": "[text value]",
        "timestamp": "[timestamp value]",
        "username": "[username value]"
    },
    "[and more dropps]": "..."
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="follows-dropps"></a>
### Get all dropps posted by client's follows

* Route: __GET__ https://dropps.me/users/[username]/follows/dropps
* Purpose: Retrieve all dropps posted by a specific user
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * [`username`]
      * Non-empty string containing alphanumeric characters, dashes, or underscores
      * Represents the username of the client
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "[droppId]": {
        "location": "[location value]",
        "media": "[media value]",
        "text": "[text value]",
        "timestamp": "[timestamp value]",
        "username": "[username value]"
    },
    "[and more dropps]": "..."
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="update-text"></a>
### Change a dropp's text

* Route: __PUT__ https://dropps.me/dropps/[droppId]/text
* Purpose: Update a dropp's text to a new value
* Request body type: `x-www-form-urlencoded`
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * [`droppId`]
      * Non-empty string containing alphanumeric characters, dashes, or underscores
  * In the request body
    * `newText`
      * String containing alphanumeric characters, special characters, and spaces
      * If `media` is `false` for the dropp, this value __must__ be non-empty
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully updated text"
    }
  }
  ```
* Notes
  * The `newText` value must be __different__ from the existing text in the database

**[⬆ back to top](#table-of-contents)**
<a name="delete-dropp"></a>
### Delete a dropp

* Route: __DELETE__ https://dropps.me/dropps/[droppId]
* Purpose: Delete a dropp
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * [`droppId`]
      * Non-empty string containing alphanumeric characters, dashes, or underscores
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully deleted dropp"
    }
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="errors"></a>
### Error types
