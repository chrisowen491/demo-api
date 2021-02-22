const AWSXRay = require('aws-xray-sdk');

exports.handler = async function (event, context) {
  return {
    "headers": { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    "statusCode": 200,
    "body": JSON.stringify({message: 'hello world'})
  };
}