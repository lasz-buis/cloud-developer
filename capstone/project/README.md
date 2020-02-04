# CAPSTONE PROJECT 
## OPTION 2 : Serverless Udagram
This project is an extension of the serverless model (option 2).
In the serverless model, a TODO program has been implemented 
at an [endpoint](https://zbuja44doa.execute-api.us-west-2.amazonaws.com/dev).
The following criteria have been addressed:

### FUNCTIONALITY
* Items in table can be created, updated and deleted
* Files can be uploaded to an S3 bucket
* A user can see only their files once logged in
* Unauthenticated access is not allowed

### CODEBASE
* Code is split into functional, data and business logic layers
* async/await style is used
* Typescript is used to enforce type-safety

### BEST PRACTICES
* All resources in the application are defined in "serverless.yml"
* Each function has its own set of permissions
* Application has monitoring in the form of XRay traces and Logger logs
* HTTP requests are validated

### ARCHITECTURE
* Data is stored in a table with a composite key
* Scan operation is not used

## UDAGRAM CHAT
The functionality of the project has been extened by encorporating a  basic websocket chat application found at wss endpoint: (wss://3t5d4gcuz4.execute-api.us-west-2.amazonaws.com/dev)
The front-end HTML file can be found in capstone/project/static

### FUNCTIONALITY
* Users are able to connect to a wss endpoint via the html front-end
* Users are represented in a DynamoDB table by their ID, Alias and Topic
* DynamoDB items can be queried, updated, scanned and deleted
* Only users in a topic can see messages bound for that topic
* The sending user's alias is displayed along with their message
* Serverless spins up an Amazon S3 webhost and upload client-side files

### CODE BASE
* Code is split into functional, data and business logic layers
* async/await style is used
* Typescript is used to enforce type-safety

### BEST PRACTICES
* All resources are created (and destroyed) by the serverless framework
* Each function has its own set of permissions
* The application is monitored using Xray and LogGroups
	
#### NOTES
* Due to my limited knowledge of front-end coding, the front-end was determined to be beyond the scope of this project. 
As a result, data that would be gathered by the front-end (namely alias and topic) are mocked with hardcoded values. 
The front-end client is a modified version of the one created by [David Tang](https://davidtang.io/2019/06/22/building-a-simple-chat-application-with-web-sockets-in-node.html).
* In order to implement a fully working S3 webhost for the chat application, a websocket enabled CloudFront proxy would need to be set up.
