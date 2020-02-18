# Udagram Image Filtering Microservice

Udagram is a simple cloud application developed alongside the Udacity Cloud Engineering Nanodegree. It allows users to register and log into a web client, post photos to the feed, and process photos using an image filtering microservice.

## CONTINUOUS INTEGRATION
This project makes use of Travis-CI in order to continuously build and check changes made to the source code. The configuration can be found in [.travis.yml](../../.travis.yaml)

## DOCKER

### Setup Docker Environment
You'll need to install [docker](https://docs.docker.com/install/) Open a new terminal within the project directory and run:

1. Build the images: `docker-compose -f docker-compose-build.yaml build --parallel`
2. Push the images: `docker-compose -f docker-compose-build.yaml push`
3. Run the container: `docker-compose up`

## KUBERNETES

### Setup Kubernetes Environment
Owing to  the high cost of running EKS on AWS; I've optimised cost by taking advantage of the free credits provided by GCP for a year by running my kubernetes cluster on there. You'll need to set up [gcloud and kubectl for gcloud](https://cloud.google.com/sdk/docs/downloads-versioned-archives). The database is an a public AWS RDS so no credentials will be needed to access it. However, AWS credentials will be needed in the aws-secret file in order to send and retrieve images from an AWS S3 bucket.

Set up virtual machines in GCP

`gcloud container clusters create udagram-cluster --num-nodes=1 --machine-type=n1-standard-4` 

Set up environment variables with secrets and config maps

`kubectl apply -f aws-secret.yaml`
`kubectl apply -f env-configmap.yaml`
`kubectl apply -f env-secret.yaml`

Expose ports to the cluster and the internet

`kubectl apply -f backend-feed-service.yaml`
`kubectl apply -f backend-user-service.yaml`
`kubectl apply -f frontend-service.yaml`
`kubectl apply -f reverseproxy-service.yaml`

Deploy pods 

`kubectl apply -f backend-feed-deployment.yaml`
`kubectl apply -f backend-user-deployment.yaml`
`kubectl apply -f frontend-deployment.yaml`
`kubectl apply -f reverseproxy-deployment.yaml `

### Rolling Updates (Continuous Deployment)
The continuous deployment option chosen in this project is Rolling Update. Rolling Updates allow Kubernetes to create new pods and delete old pods gradually. A readiness probe is used to determine when control should be switched from an old pod to a new pod. This is an efficient method of CD as it is able to maintain the same amount of resources while also negating the effect of downtime during an update. In order to apply the rolling update, you need to change the image in the deployment .yaml file.

## Rolling Back the replica sets
Updates can be rolled back using the following commands:

`kubectl rollout undo deployment/frontend`
`kubectl rollout undo deployment/backend-user`
`kubectl rollout undo deployment/backend-feed`
`kubectl rollout undo deployment/reverseproxy`

## BLUE / GREEN DEPLOYMENT
A Blue/Green (or A/B) deployment has been included as well. This method creates a new set of pods alongside the old set and switches control from the old set to the new set once it is running. Control switches are done by setting the service to select a label - in this caes the label is either blue or green.

In order to set up the first pod set and the services use the commands:

`kubectl apply -f aws-secret.yaml`
`kubectl apply -f env-configmap.yaml`
`kubectl apply -f env-secret.yaml`

`kubectl apply -f blue-backend-feed-deployment.yaml`
`kubectl apply -f blue-backend-user-deployment.yaml`
`kubectl apply -f blue-frontend-deployment.yaml`
`kubectl apply -f blue-reverseproxy-deployment.yaml `

`kubectl apply -f backend-feed-service.yaml`
`kubectl apply -f backend-user-service.yaml`
`kubectl apply -f frontend-service.yaml`
`kubectl apply -f reverseproxy-service.yaml`

Once these pods are running, a green pod deployment can be made with the following commands:

`kubectl apply -f blue-backend-feed-deployment.yaml`
`kubectl apply -f blue-backend-user-deployment.yaml`
`kubectl apply -f blue-frontend-deployment.yaml`
`kubectl apply -f blue-reverseproxy-deployment.yaml`

The selector for each of the services should be updated to 'green' and the services are redployed with the following commands:

`kubectl apply -f backend-feed-service.yaml`
`kubectl apply -f backend-user-service.yaml`
`kubectl apply -f frontend-service.yaml`
`kubectl apply -f reverseproxy-service.yaml`

### Scaling the cluster
Scaling a cluster up allows the application to handle more traffic and scaling it down reduces the cost of running the cluster if there is less traffic. If you need to scale your application up you may use the following commands:

`kubectl scale deployment/frontend --replicas 2`
`kubectl scale deployment/backend-user --replicas 2`
`kubectl scale deployment/backend-feed --replicas 2`
`kubectl scale deployment/reverseproxy --replicas 2`

### Testing the front end
In order to test whether the application is working you may use kubernetes' port-forwarding functionality:

`kubectl port-forward service/reverseproxy 8080:8080`
`kubectl port-forward service/frontend 8100:8100`

### Tearing down the cluster
Once you no longer have a need for the cluster you can take it down using the following commands:

Remove all items and delete VM's

`kubectl delete secret aws-secret`
`kubectl delete configmap env-config`
`kubectl delete deployment.apps/backend-feed`
`kubectl delete deployment.apps/backend-user`
`kubectl delete deployment.apps/frontend`
`kubectl delete deployment.apps/reverseproxy`
`kubectl delete service/backend-feed`
`kubectl delete service/backend-user`
`kubectl delete service/frontend`
`kubectl delete service/reverseproxy`
`gcloud container clusters delete udagram-cluster`

### MONITORING
Monitoring was done using extensive logs in the server code as well as GCP's VM monitoring services