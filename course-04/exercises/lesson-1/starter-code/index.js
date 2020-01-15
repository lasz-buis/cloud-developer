const AWS = require('aws-sdk')
const axios = require('axios')

// Name of a service, any string
const serviceName = process.env.SERVICE_NAME
// URL of a service to test
const url = process.env.URL

// CloudWatch client
const cloudwatch = new AWS.CloudWatch();

exports.handler = async (event) => {
  // TODO: Use these variables to record metric values
  let endTime = 0;
  let requestWasSuccessful = true;
  const startTime = timeInMs();
  let http_status = 0;

  await axios.get(url).then((response)=> 
  {
    console.log (response.data);
    console.log (response.status);
    console.log (response.statusText);
    console.log (response.headers);
    console.log (response.config);
    http_status = response.status;
    if (http_status == '200')
    {
      requestWasSuccessful = true;
    }
    else
    {
      requestWasSuccessful = false;
    }
    endTime = timeInMs();
  })
  .catch (err=>
  {
    console.log ('Error :', err);
  }); 
  // TODO: Record time it took to get a response
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Latency', 
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Milliseconds',
        Value: endTime - startTime // Total value
      }
    ],
    Namespace: 'Udacity/Serveless'
  }).promise();

  try
  {
    // TODO: Record if a response was successful or not
    await cloudwatch.putMetricData({
      MetricData: [
        {
          MetricName: 'Succcess', 
          Dimensions: [
            {
              Name: 'ServiceName',
              Value: serviceName
            }
          ],
          Unit: 'Status',
          Value: http_status
        }
      ],
      Namespace: 'Udacity/Serveless'
    }).promise();
  }
  catch (err)
  {
    console.log (err);
  }
}

function timeInMs() {
  return new Date().getTime()
}
