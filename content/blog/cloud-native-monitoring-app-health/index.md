---
title: Cloud Native Monitoring at Scale - Application's Health
date: "2020-11-29T18:00:03.284Z"
description: "As part of Cloud Native Monitoring at Scale, this post aims to tackle the first step to indentify our application's health status and make that metric available to our orchestration layer."
tags: [kubernetes, monitoring, devops, cloudnative]
---

# Introduction

As we move towards a Cloud Native world, where loads are ephemeral, horizontal scaling is key and microsservices are the norm, monitoring all these spread out components becomes not only essential, but mandatory on any production-ready environment.

We will navigate through a series named **Cloud Native Monitoring at Scale** which focuses on all stages of monitoring across a cloud native application deployed on Kubernetes. Since from a single running application to understand if it is up and running as expected (this post) all the way to having multiple k8s clusters running multiple applications simultaneously.

# Cloud Native Application's health

On this blog post we will go through the process of developing a cloud native application and making sure that it's up and running at a `pod` level, by leveragint the built-in capabilities within Kubernetes of `Readiness` and `Liveness` probes.

### Goal

Create an application that replies with `pong` on a `/ping` endpoint.

### Steps

1. Dockerize our development environment;
2. Develop an application on a "cloud native friendly" programming language such as Go, Rust or Deno;
3. Describe and implement all tests to validate most (if not all) of our use-cases;
5. Deploy our application to our test/integration environment, make all smoke tests and validations;
6. Get the green light and promote the application to a production environment;

Once we have gone through all these steps, we are able to see that the application is up and running in our k8s namespace:
```console
→ kubectl get pods
NAME                        READY   STATUS    RESTARTS   AGE
app-basic-5499dbdcc-4xlmm   1/1     Running   0          6s
app-basic-5499dbdcc-j84bl   1/1     Running   0          6s
```

We can even validate our production environment that everything is working as expected:
```console
→ curl --max-time 10 http://kubernetes.docker.internal:31792/ping
{"msg":"pong"}
```

### Go live!

Our application has been successfully implemented and everything (seems) to be working just fine, so we are live and can now provide this service to our customers without a problem!

Except a few minutes later we start getting emails and calls from customers that the service is not working as expected. Weird, right? Let's check if the pod is running:

```console
→ kubectl get pods
NAME                        READY   STATUS    RESTARTS   AGE
app-basic-6b6dd6b98f-6t7jl   1/1     Running   0          57s
app-basic-6b6dd6b98f-pzgxr   1/1     Running   0          57s
```

It is running just fine, it says there right under `STATUS` as `Running` so there must be an issue with the customer, right? Let's just for the sake of sanity to do a test ourselves:

```console
→ curl --max-time 10 http://kubernetes.docker.internal:31792/ping
curl: (28) Operation timed out after 10003 milliseconds with 0 bytes received
```

This is awkward, we have tested our application, the deployment is working just fine, but apparently after a while our application stops working but this is not reflected in our Kubernetes environment.

For this excercise, we have created a small "kill switch" that breaks the application 30 seconds after it first started running, as we could've seen through the logs:

```console
→ kubectl logs app-basic-6b6dd6b98f-6t7jl
[11/29/2020, 6:49:42 PM] Running on http://0.0.0.0:8080
[11/29/2020, 6:50:12 PM] Upsie, I'm dead...
```

### Kubernetes to the rescue

Well this is where the Kubernetes concept of [Readiness and Liveness Probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) comes in handy, it allows the [kubelet](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/) to peridiocally check the status of a pod by probing an endpoint to understand the its state.

#### Liveness vs. Readiness probe

Although initially these two concepts can be confusing, in terms of their responsibilities, it gets clearer as we start exploring its main purpose.

An application's health can be into two main statuses:

- **Alive** (liveness): The application is up and running and working as expected;
- **Ready** (readiness): The application is ready to receive new requests;

Let's imagine we have an application that initially loads an in-memory cache to enable replying to external requests faster and this process takes roughly 15 seconds. This means that the application is `alive` and `running` from `0s` but it will only be `ready` at around `15s`.

Having these probes allow Kubernetes to execute crucial orchestration tasks such as routing the requests to a specific pod from a service only when it is up and ready, as well as set thresholds to restart pods when the pod is not alive/ready for a certain amount of time. 

From the orchestration perspective, Kubernetes have got us covered, by simply adding these parameters on our deployment manifest:

```yaml
...
containers:
  - name: app
    image: pong
    ...
    livenessProbe:
      httpGet:
        path: /health
        port: http
      initialDelaySeconds: 5
      periodSeconds: 5
      timeoutSeconds: 1
      failureThreshold: 1
    readinessProbe:
      httpGet:
        path: /ready
        port: http
      initialDelaySeconds: 15
      periodSeconds: 5
      timeoutSeconds: 1
      failureThreshold: 1
    ...
```

The implementation of the `/health` and `/ready` endpoints are part of the application's responsibility as these can have different meaning across all kinds of applications, in our specific case, these two concepts can be overalapped and use the `/pong` endpoint as our check if our application is alive and ready.

If we look back into our `pong` application, by having the `timeoutSeconds` set to 1s, and having `periodSeconds` as 5s (kubelet will probe this endpoint every 5s), it would detect that the endpoint was taking more than 1 second to respond, causing the pod to restart and enabling our application to receive requests. 

Of course, this would not necessarily fix our root cause, but it would *decrease the impact on our customers* and also let us know that something was wrong when we would see *multiple triggered restarts* on our pods.

```console
→ kubectl get pods
NAME                         READY   STATUS    RESTARTS   AGE
app-basic-6b6dd6b98f-6t7jl   1/1     Running   4          2m33s
app-basic-6b6dd6b98f-pzgxr   1/1     Running   4          2m33s
```

Under this scenario, we could investigate a bit further to understand why we had so many restarts under our pod's events:

```console
→ kubectl get event --field-selector involvedObject.name=app-basic-6b6dd6b98f-6t7jl
LAST SEEN   TYPE      REASON      OBJECT                           MESSAGE
4m          Normal    Scheduled   pod/app-basic-6b6dd6b98f-6t7jl   Successfully assigned default/app-basic-6b6dd6b98f-6t7jl to docker-desktop
95s         Normal    Pulled      pod/app-basic-6b6dd6b98f-6t7jl   Container image "pong:latest" already present on machine
2m10s       Normal    Created     pod/app-basic-6b6dd6b98f-6t7jl   Created container app-basic
2m10s       Normal    Started     pod/app-basic-6b6dd6b98f-6t7jl   Started container app-basic
2m48s       Warning   Unhealthy   pod/app-basic-6b6dd6b98f-6t7jl   Readiness probe failed: Get "http://10.1.0.15:8080/ping": context deadline exceeded (Client.Timeout exceeded while awaiting headers)
97s         Warning   Unhealthy   pod/app-basic-6b6dd6b98f-6t7jl   Liveness probe failed: Get "http://10.1.0.15:8080/ping": context deadline exceeded (Client.Timeout exceeded while awaiting headers)
97s         Normal    Killing     pod/app-basic-6b6dd6b98f-6t7jl   Container app-basic failed liveness probe, will be restarted
2m9s        Warning   Unhealthy   pod/app-basic-6b6dd6b98f-6t7jl   Readiness probe failed: Get "http://10.1.0.15:8080/ping": dial tcp 10.1.0.15:8080: connect: connection refused
```

Here we can clearly see that the pod was `killed` due to the fact that both of our liveness and readiness probes were timing out.

This would enable us to understand that our application was showing some unhealthy symptoms that would need to be explored within our code on what was causing our application to stop responding every 30s.

Nonetheless by implementing our `Readiness` and `Liveness` probe, we have made sure that our pod health status reflects our application's health, as well as Kubernetes is aware of these metrics and is able to react accordingly. In this case, by restarting the pods every time it is unhealthy will bring the pod back to an healthy state, being able to reply `pong` to our customers, decreasing the downtime of our so much valued service.

## Conclusion

This is the first blog post of our **"Cloud Native monitoring at scale"** series, as to which we will evolve from identifying all steps to expose our application's health and monitor at scale and ultimately leverage this system to build a full-fledged and automated system to get alerted whenever something across our entire application, system or organization goes wrong.

If you feel like discussing more about how monitoring not only your infrastructure, but also all layers that can impact your business are crucial to your organization, then reach out to me [on Twitter](https://twitter.com/schmittfelipe).