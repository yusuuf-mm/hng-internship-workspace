# Gender Classification API

A RESTful API that predicts the gender of a given name using the Genderize.io external API.

## Live Endpoint

```
https://hng-backend.up.railway.app/api/classify?name=YourName
```

## Features

- Predicts gender based on first name
- Returns confidence score and sample size
- Handles edge cases (null predictions, insufficient data)
- CORS enabled for cross-origin requests
- Fast response times

## API Reference

### GET /api/classify

Predicts the gender for a given name.

#### Query Parameters

| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| name      | string | Yes      | The name to classify |

#### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "name": "Yusuf",
    "gender": "male",
    "probability": 0.98,
    "sample_size": 1254,
    "is_confident": true,
    "processed_at": "2026-04-16T00:00:00.000Z"
  }
}
```

#### Error Response - Missing Name (400)

```json
{
  "status": "error",
  "message": "Name parameter is required"
}
```

#### Error Response - Invalid Type (422)

```json
{
  "status": "error",
  "message": "Name must be a string"
}
```

#### Error Response - No Prediction Available (422)

```json
{
  "status": "error",
  "message": "No prediction available for the provided name"
}
```

#### Error Response - Upstream Failure (502)

```json
{
  "status": "error",
  "message": "Upstream service failure"
}
```

## Confidence Logic

The API determines if a prediction is confident based on two criteria:

- **Probability >= 0.7** (70% or higher)
- **Sample size >= 100** (at least 100 data points)

Both conditions must be met for `is_confident` to be `true`.

## Testing

### Test the endpoint

```bash
# Test with a common name
curl "https://hng-backend.up.railway.app/api/classify?name=Yusuf"

# Test with a female name
curl "https://hng-backend.up.railway.app/api/classify?name=Mary"

# Test missing name (should error)
curl "https://hng-backend.up.railway.app/api/classify"
```

### Local Development

```bash
# Install dependencies
npm install

# Start server
node index.js

# Server runs on http://localhost:3000
```

## Deployment

This API is deployed on **Railway**.

To deploy your own version:

1. Push code to a GitHub repository
2. Connect your GitHub repo to Railway
3. Railway automatically detects Node.js and deploys

### Deployment Variables

No additional environment variables required.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **External API**: Genderize.io

## License

ISC
