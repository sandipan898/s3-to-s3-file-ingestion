import React, { useState, useEffect } from "react";
import { Formik, Field, Form } from "formik";
// import { gapi } from "gapi-script";
import { each } from 'async'
import * as AWS from "aws-sdk";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const appId = process.env.REACT_APP_appId;
const SCOPES =
  "https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata";
  const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];


AWS.config.region = process.env.REACT_APP_AWS_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: process.env.REACT_APP_AWS_INDENTITY_POOL_ID
});
const DESTINATION_FOLDER = 's3-ingestion-test';
const DESTINATION_BUCKET = "qdox-training-pipeline";


export default function S3Operation() {
  // const [signedInUser, setSignedInUser] = useState(null);
  // const [oauthToken, setOauthToken] = useState(null);

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
  //        IdentityPoolId: '',
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
    
    s3.listObjects({Bucket : bucketName, Prefix: `${folderName}/`}, function(err, data) {
      if (data && data.Contents && data.Contents.length) {
        each(data.Contents, function(file, callBack) {
          var params = {
            Bucket: DESTINATION_BUCKET,
            CopySource: bucketName + '/' + file.Key,
            Key: file.Key.replace(`${folderName}/`, `${DESTINATION_FOLDER}/`)
          };
          console.log("params: ", params);
          s3.copyObject(params, function(copyErr, copyData){
            if (copyErr) {
              console.log(copyErr);
            }
            else {
              console.log('Copied: ', params.Key);
              callBack();
            }
          });
        }, done);
      }
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
