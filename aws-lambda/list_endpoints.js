let AWS = require('aws-sdk');
let sagemaker = new AWS.SageMaker({
  apiVersion: '2017-07-24'
});

exports.handler = async (event) => {
  // TODO implement
  let params = {
    StatusEquals: 'InService'
  }
  return new Promise((resolve, reject) => {
    sagemaker.listEndpoints(params, function (err, data) {
      return err ? reject(err) : resolve(data);
    });
  });
};