const AWSXRay = require('aws-xray-sdk');

exports.handler = async function (event, context) {
  return {
    "headers": { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Strict-Transport-Security": "max-age=2592000",
      "X-Content-Type-Options": "nosniff"
    },
    "statusCode": 200,
    "body": JSON.stringify({message: 'hello world'})
  };
}