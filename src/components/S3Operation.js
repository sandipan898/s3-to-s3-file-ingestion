import React, { useState, useEffect } from "react";
import { Formik, Field, Form } from "formik";
import { gapi } from "gapi-script";

import * as AWS from "aws-sdk";

const CLIENT_ID =
  "546959051313-8l13pmvrkm4tfv8fcqdghs2uj6a354t5.apps.googleusercontent.com";
const API_KEY = "AIzaSyD7ySMiIUkaq7MakjjDcbeEVQTF9WEIsbg";
const appId = "546959051313";
const SCOPES =
  "https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata";
  const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];


AWS.config.region = "us-east-1"; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "us-east-1:9b9e38cd-3ae5-4c5a-9636-d247dc100b7b"
});

export default function S3Operation() {
  // const [bucketName, setBucketName] = useState(null);
  // const [folderName, setFolderName] = useState(null);
  const [signedInUser, setSignedInUser] = useState(null);
  const [oauthToken, setOauthToken] = useState(null);

  //   useEffect (()=> {
  //   console.log("signedInUser",signedInUser);
  //   if (signedInUser)
  //     window.gapi.auth2.getAuthInstance().signOut();
  // }, [])

  // useEffect(() => {
  //   console.log("oauthToken", oauthToken)
  //   if (oauthToken) {
  //     // Add the Google access token to the Amazon Cognito credentials login map.
  //     AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  //        IdentityPoolId: 'us-east-1:9b9e38cd-3ae5-4c5a-9636-d247dc100b7b',
  //        Logins: {
  //           'accounts.google.com': oauthToken
  //        }
  //     });
  //     // Obtain AWS credentials
  //     AWS.config.credentials.get(function(){
  //        // Credentials will be available when this function is called.
  //       var accessKeyId = AWS.config.credentials.accessKeyId;
  //       var secretAccessKey = AWS.config.credentials.secretAccessKey;
  //       var sessionToken = AWS.config.credentials.sessionToken;
  //       console.log("AWS.config.credentials", accessKeyId, secretAccessKey, sessionToken);
  //     });
  //  }
  // }, [oauthToken])
  // const handleClientLoad = (data) => {
  //   // handleOpenPicker()
  //   gapi.load("client:auth2", initClient);
  //   // gapi.load('picker', onPickerApiLoad);
  // };

  // const initClient = () => {
  //   // setIsLoadingGoogleDriveApi(true);
  //   gapi.client
  //     .init({
  //       apiKey: API_KEY,
  //       clientId: CLIENT_ID,
  //       discoveryDocs: DISCOVERY_DOCS,
  //       scope: SCOPES
  //       // redirect_uri: ''
  //     })
  //     .then(
  //       function () {
  //         console.log("Fetching documents", gapi);
  //         gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
  //         updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  //       },
  //       function (error) {
  //         console.log("error", error);
  //       }
  //     )
  //     .catch((err) => {
  //       console.log("err", err);
  //     });
  // };

  // const updateSigninStatus = (isSignedIn) => {
  //   if (isSignedIn) {
  //     setOauthToken(gapi.auth.getToken().access_token)
  //     setSignedInUser(gapi.auth2.getAuthInstance().currentUser.le.wt);
  //   } else {
  //     handleAuthClick();
  //   }
  // };

  // const handleAuthClick = (event) => {
  //   gapi.auth2.getAuthInstance().signIn();
  // };

  // Create S3 service object
  const handleUserInput = (values) => {
    const bucketName = values.bucketName;
    const folderName = values.folderName;
    // setBucketName(bucketName);
    // setFolderName(folderName);
    const s3 = new AWS.S3();
    
    var done = function(err, data) {
      if (err) console.log(err);
      else console.log(data);
    };
    
    s3.listObjects({Prefix: oldPrefix}, function(err, data) {
      if (data.Contents.length) {
        async.each(data.Contents, function(file, cb) {
          var params = {
            Bucket: bucketName,
            CopySource: bucketName + '/' + file.Key,
            Key: file.Key.replace(oldPrefix, newPrefix)
          };
          s3.copyObject(params, function(copyErr, copyData){
            if (copyErr) {
              console.log(copyErr);
            }
            else {
              console.log('Copied: ', params.Key);
              cb();
            }
          });
        }, done);
      }
    });
    
    // BUCKET = 'qdox-training-pipeline'
    var bucketParams = {
      Bucket : values.bucketName,
      // Delimeter: '/',
      Prefix: values.folderName
    };
    // Call S3 to list the buckets
    s3.listObjects(
      bucketParams,
      (err, data) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    });

    var copyParams = {
      Bucket: "s3-ingestion-test", 
      CopySource: `/${bucketName}/`, 
      // Key: "HappyFaceCopyjpg"
     };
     s3.copyObject(copyParams, function(err, data) {
       if (err) 
        console.log(err, err.stack); // an error occurred
       else
        console.log(data);           // successful response
     });
  }

  return (
    <div className="App">
      <div className="form-control">
        <Formik
          initialValues={{
            bucketName: "",
            folderName: "",
            // accountSAS: ""
          }}
          onSubmit={async (values) => {
            handleUserInput(values);
          }}
        >
          {({ values }) => (
            <Form>
              <label htmlFor="bucketName">Bucket Name</label>
              <Field id="bucketName" name="bucketName" /> <br /> <br />
              <label htmlFor="folderName">Folder Name</label>
              <Field id="folderName" name="folderName" /> <br /> <br />
              {" "}
              <br /> <br />
              <button type="submit">Submit</button>
            </Form>
          )}
        </Formik>
      </div>
      {/* <button >Authenticate</button> */}
    </div>
  );
}
