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
21. [Get a client's follower requests](#get-follower-requests)
22. [Get a client's follow requests](#get-follow-requests)
23. [Accept a follower request](#accept-follower-request)
24. [Decline a follower request](#decline-follower-request)
25. [Cancel pending follow request](#cancel-follow-request)
26. [Remove a follower](#remove-follower)
27. [Unfollow a user](#unfollow)
28. [Error types](#errors)

## Routes

**[⬆ back to top](#table-of-contents)**
<a name="base-route"></a>
### 1. Base route

* Route: __GET__ https://dropps.me
* Purpose: Tests if the server is up and running
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
### 2. Authenticate

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
### 3. Create a user

* Route: __POST__ https://dropps.me/users
* Purpose: Creates a new user
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
### 4. Retrieve a user's information

* Route: __GET__ https://dropps.me/users/[username]
* Purpose: Gets information about a user
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
### 5. Change a user's email

* Route: __PUT__ https://dropps.me/users/[username]/email
* Purpose: Updates a user's email to a new value
* Request body type: `x-www-form-urlencoded`
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[username]`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
  * In the request body
    * `new_email`
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
  * The `new_email` value must be __different__ from the existing email in the database

**[⬆ back to top](#table-of-contents)**
<a name="update-password"></a>
### 6. Change a user's password

* Route: __PUT__ https://dropps.me/users/[username]/password
* Purpose: Updates a user's password to a new value
* Request body type: `x-www-form-urlencoded`
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[username]`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
  * In the request body
    * `old_password`
      * Non-empty string containing alphanumeric and special characters
    * `new_password`
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
  * The `old_password` value must be __identical__ to the existing password in the database
  * The `new_password` value must be __different__ from the existing password in the database

**[⬆ back to top](#table-of-contents)**
<a name="delete-user"></a>
### 6. Delete a user

* Route: __DELETE__ https://dropps.me/users/[username]
* Purpose: Deletes a user's account and all their dropps
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
    "success": {
      "message": "Successfully deleted user"
    }
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="create-dropp"></a>
### 8. Create a dropp

* Route: __POST__ https://dropps.me/dropps
* Purpose: Creates a dropp
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
### 9. Add an image for a posted dropp

* Route: __POST__ https://dropps.me/dropps/[droppId]/image
* Purpose: Uploads an image for a dropp that has `media` equal to `true`
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
### 10. Get a dropp

* Route: __GET__ https://dropps.me/dropps/[droppId]
* Purpose: Retrieves a specific dropp
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[droppId]`
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
### 11. Get an image for a specific dropp

* Route: __GET__ https://dropps.me/dropps/[droppId]/image
* Purpose: Retrieves an image for a specific dropp
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[droppId]`
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
### 12. Get all relevant dropps

* Route: __GET__ https://dropps.me/dropps
* Purpose: Retrieves all dropps around a specific location or posted by users who the client follows
* Request header type: `x-www-form-urlencoded`
* Required parameters
  * In the header
    * `Authorization`
    * `location`
      * Non-empty string containing two floating-point numbers separated by a comma
      * Represents the latitude and longitude of the current location
    * `max_distance`
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
    * Represents whether or not the dropp is within `max_distance` of `location`

**[⬆ back to top](#table-of-contents)**
<a name="nearby-dropps"></a>
### 13. Get all dropps around a location

* Route: __GET__ https://dropps.me/location/dropps
* Purpose: Retrieves all dropps around a specific location
* Request header type: `x-www-form-urlencoded`
* Required parameters
  * In the header
    * `Authorization`
    * `location`
      * Non-empty string containing two floating-point numbers separated by a comma
      * Represents the latitude and longitude of the current location
    * `max_distance`
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
### 14. Get all dropps posted by a user

* Route: __GET__ https://dropps.me/users/[username]/dropps
* Purpose: Retrieves all dropps posted by a specific user
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
### 15. Get all dropps posted by client's follows

* Route: __GET__ https://dropps.me/follows/dropps
* Purpose: Retrieves all dropps posted by users who the client follows
* Required parameters
  * In the header
    * `Authorization`
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
### 16. Change a dropp's text

* Route: __PUT__ https://dropps.me/dropps/[droppId]/text
* Purpose: Updates a dropp's text to a new value
* Request body type: `x-www-form-urlencoded`
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[droppId]`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
  * In the request body
    * `new_text`
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
  * The `new_text` value must be __different__ from the existing text in the database

**[⬆ back to top](#table-of-contents)**
<a name="delete-dropp"></a>
### 17. Delete a dropp

* Route: __DELETE__ https://dropps.me/dropps/[droppId]
* Purpose: Deletes a dropp
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[droppId]`
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
<a name="send-follow-request"></a>
### 18. Request to follow a user

* Route: __POST__ https://dropps.me/requests/follows/[username]
* Purpose: Sends a follow request
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[username]`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
      * Represents the username of the user to send the request to
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully sent follow request"
    }
  }
  ```
* Notes
  * A client cannot send a follow request to themself
  * A client cannot send a follow request to a user that they have already requested to follow

**[⬆ back to top](#table-of-contents)**
<a name="get-followers"></a>
### 19. Get a user's followers

* Route: __GET__ https://dropps.me/users/[username]/followers
* Purpose: Retrieves the users who are following a specific user
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
    "[follower 1 username]": "[follower 1 username]",
    "[and more followers]": "..."
  }
  ```
* Notes
  * Returned JSON could be empty if user has no followers
  * The key-value pairs will be __identical__ usernames

**[⬆ back to top](#table-of-contents)**
<a name="get-follows"></a>
### 20. Get a user's follows

* Route: __GET__ https://dropps.me/users/[username]/follows
* Purpose: Retrieves the users who the specific user follows
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
    "[follow 1 username]": "[follow 1 username]",
    "[and more follows]": "..."
  }
  ```
* Notes
  * Returned JSON could be empty if user has no follows
  * The key-value pairs will be __identical__ usernames

**[⬆ back to top](#table-of-contents)**
<a name="get-follower-requests"></a>
### 21. Get a client's follower requests

* Route: __GET__ https://dropps.me/requests/followers
* Purpose: Retrieves the follower requests for the client
* Required parameters
  * In the header
    * `Authorization`
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "[follower request 1 username]": "[follower request 1 username]",
    "[and more follower requests]": "..."
  }
  ```
* Notes
  * Returned JSON could be empty if client has no follower requests
  * The key-value pairs will be __identical__ usernames

**[⬆ back to top](#table-of-contents)**
<a name="get-follow-requests"></a>
### 22. Get a client's follow requests

* Route: __GET__ https://dropps.me/requests/follows
* Purpose: Retrieves the follow requests for the client
* Required parameters
  * In the header
    * `Authorization`
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "[follow request 1 username]": "[follow request 1 username]",
    "[and more follow requests]": "..."
  }
  ```
* Notes
  * Returned JSON could be empty if client has no follow requests
  * The key-value pairs will be __identical__ usernames

**[⬆ back to top](#table-of-contents)**
<a name="accept-follower-request"></a>
### 23. Accept a follower request

* Route: __PUT__ https://dropps.me/requests/followers/[username]
* Purpose: Accepts a pending follower request from another user
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[username]`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
      * Represents the username of the follower request to accept
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully accepted follower request"
    }
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="decline-follower-request"></a>
### 24. Decline a follower request

* Route: __DELETE__ https://dropps.me/requests/followers/[username]
* Purpose: Declines a pending follower request from another user
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[username]`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
      * Represents the username of the follower request to decline
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully declined follower request"
    }
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="cancel-follow-request"></a>
### 25. Cancel pending follow request

* Route: __DELETE__ https://dropps.me/requests/followers/[username]
* Purpose: Removes a pending follow request to another user
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[username]`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
      * Represents the username of the follow request to remove
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully removed pending follow request"
    }
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="remove-follower"></a>
### 26. Remove a follower

* Route: __DELETE__ https://dropps.me/followers/[username]
* Purpose: Removes a specific user from a client's followers
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[username]`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
      * Represents the username of the follower to remove
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully removed follower"
    }
  }
  ```

**[⬆ back to top](#table-of-contents)**
<a name="unfollow"></a>
### 27. Unfollow a user

* Route: __DELETE__ https://dropps.me/follows/[username]
* Purpose: Removes a specific user from a client's follows
* Required parameters
  * In the header
    * `Authorization`
  * In the URL
    * `[username]`
      * Non-empty string containing alphanumeric characters, dashes, or underscores
      * Represents the username of the user to unfollow
* Optional parameters: _none_
* Successful request returns
  * Status code: __200__
  * Response body JSON
  ```json
  {
    "success": {
      "message": "Successfully unfollowed that user"
    }
  }
  ```

**[⬆ back to top](#table-of-contents)**

<a name="errors"></a>
## Errors
* These are the error responses that will be sent when API requests fail in any way
* Any response that has a status code other than 200 or 201 has failed in some way
* To determine whether or not your request succeeded or failed, you can check the status code of the HTTP response or check for the existence of the key `error` in the response body JSON
* Each error will have a specific ID that we save. You can inquire about the error with the ID to possibly get more information about the error details
* All error responses follow this format:
```json
{
  "error": {
    "type": "[error type]",
    "message": "[default error message or more detailed error explanation]",
    "id": "[specific error id]"
  }
}
```

<a name="errors-table-of-contents"></a>
## Errors Table of Contents

1. [API Error](#api-error)
2. [Authentication Error](#auth-error)
3. [Invalid Media Type Error](#media-error)
4. [Invalid Request Error](#invalid-request-error)
5. [Login Error](#login-error)
6. [Resource Does Not Exist Error](#resource-dne-error)
7. [Resource Error](#resource-error)

**[⬆ back to top - errors](#errors-table-of-contents)**
<a name="api-error"></a>
### 1. API Error

* Explanation: An unexpected error occurred on the server that we were unable to more clearly identify and explain
* Status code: __500__
* Formal type: `api_error`
* Default message: _There was a problem with our back-end services_

**[⬆ back to top - errors](#errors-table-of-contents)**
<a name="auth-error"></a>
### 2. Authentication Error

* Explanation: An error occurred while verifying the client's `Authorization` JSON web token
* Common causes
  * Missing `Authorization` token
  * Malformed `Authorization` token
  * Expired `Authorization` token
* Status code: __401__
* Formal type: `authentication_error`
* Default message: _There was an error while authenticating_
* Notes: This error has the same status code as Login errors; however, this error will never occur in the base route (/), /authenticate route, or __POST__ /users route

**[⬆ back to top - errors](#errors-table-of-contents)**
<a name="media-error"></a>
### 3. Invalid Media Type Error

* Explanation: An error occurred while receiving an image upload for a dropp
* Common causes
  * Uploading an image type other than `jpeg` or `png`
* Status code: __415__
* Formal type: `invalid_media_type`
* Default message: _That type of media file is forbidden_

**[⬆ back to top - errors](#errors-table-of-contents)**
<a name="invalid-request-error"></a>
### 4. Invalid Request Error

* Explanation: An error occurred while checking the parameters in the request header or body
* Common causes
  * A request parameter does not follow the syntax rules prescribed for the route
  * A request parameter to update data for a resource is identical to the existing data for that resource
* Status code: __400__
* Formal type: `invalid_request_error`
* Default message: _One of your request parameters is invalid_
* Notes: The non-default message will be `Invalid parameters: ` or `Unchanged parameters: `, followed by a comma-separated list of the incorrect parameter key names

**[⬆ back to top - errors](#errors-table-of-contents)**
<a name="login-error"></a>
### 5. Login Error

* Explanation: An error occurred while attempting to match the given password for the given username
* Status code: __401__
* Formal type: `login_error`
* Default message: _The username or password is incorrect_
* Notes: This error has the same status code as Authentication errors; however, this error will only occur in the /authenticate route

**[⬆ back to top - errors](#errors-table-of-contents)**
<a name="resource-dne-error"></a>
### 6. Resource Does Not Exist Error

* Explanation: An error occurred while attempting to retrieve the requested resource
* Status code: __404__
* Formal type: `resource_dne_error`
* Default message: _That resource does not exist_
* Notes: The message will usually contain which _type_ of resource does not exist, e.g. _That dropp does not exist_

**[⬆ back to top - errors](#errors-table-of-contents)**
<a name="resource-error"></a>
### 7. Resource Error

* Explanation: An error occurred while attempting to access and interact with the requested resource(s). The request would cause the data/application to enter an invalid state
* Common causes
  * Trying to update another user's data
  * Trying to add an image for a dropp that has `media` = `false`
  * Trying to add an image for a dropp that already has an image added to it
  * Trying to get all the dropps of a user that the client does not follow
  * Updating a dropp to have no text when `media` = `false`
  * Sending a follow request when the requested user has not yet accepted or declined an outstanding follow request
* Status code: __403__
* Formal type: `resource_error`
* Default message: _There was an error accessing that resource_
* Notes: The message will usually contain a more specific explanation of why the request cannot be fulfilled
