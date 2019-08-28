## Taker Assistant: Browser Labeling / Object Detection ##
This tool is for labeling objects in the browser and using the resulting annotations to train an object detection model.
The model trained through this tool is intended for use in the Urbanbase Taker API, found here: <br>
https://developer.urbanbase.com/products/space/<br><br>
The ML model is trained through calls to AWS Lambda, which then creates a training job in Sagemaker using the built-in
object detection algorithm. The project architecture as it relates to AWS Services can be found below: <br>
<img src="index/taker-assistant-architecture.png"><br>

There is also an object labeling tool fully embedded into the browser, based off HTML canvas. Note that the number (and names)
of the classes can be changed by going into editing classes.js and create_training_job.js. The latter is actually the Lambda function
used to create a training job with a specified number of output classes.
