# Cloud Recipes

Cloud Recipes è un’applicazione web cloud-native per la gestione e condivisione di ricette, sviluppata come progetto universitario con un’architettura serverless ed event-driven su AWS.
L’obiettivo del progetto è mostrare l’integrazione concreta di servizi AWS (Cognito, API Gateway, Lambda, DynamoDB, S3, EventBridge, ECS Fargate, Rekognition) in un sistema reale, riproducibile e scalabile.

## Architettura

- **Frontend**: Vue 3 + Vite  
- **Backend**: API REST su API Gateway + AWS Lambda  
- **Auth**: Amazon Cognito (JWT, Authorizer)  
- **Storage**:
  - DynamoDB (ricette, utenti, recensioni)
  - S3 (immagini ricette e profili)
- **Image processing**:
  - Presigned URL
  - Resize automatico (ECS Fargate)
  - Tagging con Rekognition
- **Event-driven**: EventBridge + SNS
- **IaC**: CloudFormation
- **CI/CD**: GitHub Actions (build & push image-processor)

## Requisiti

- Node.js >= 18
- Docker
- AWS account
- AWS CLI configurata
- Un dominio email valido (per Cognito)

## Guida alla configurazione e all'avvio

1. Carica lo stack ```cloudformation.yaml``` su AWS e attendi il completamento dell'operazione
2. Prendi nota degli output (API URL, User Pool ID, Client ID, bucket, ecc.)
3. Configura il frontend aggiungendo un file ```.env```:
```
VITE_COGNITO_REGION=eu-north-1
VITE_COGNITO_CLIENT_ID=https://<api-id>.execute-api.<region>.amazonaws.com/prod
VITE_API_BASE=XXXXXXXXXXXXXXX
VITE_WS_URL=XXXXXXXXXXXXXXX
```
4. Avvia con i seguenti comandi (Il frontend sarà disponibile su ```http://localhost:5173```):
```
cd frontend
npm install
npm run dev
```

5. Containerizzare il servizio di resize immagini con ECS Fargate:
```
cd backend/image-processor
docker build -t cloud-recipes-image-processor .
docker tag cloud-recipes-image-processor:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/cloud-recipes-image-processor:latest
docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/cloud-recipes-image-processor:latest
```

