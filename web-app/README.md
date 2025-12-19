# API Route for Browser Extension Capture

This API endpoint receives captured content from the KronoSave browser extension and processes it through autonomous AI agents.

## Endpoint

`POST /api/capture`

## Request Body

```json
{
  "url": "https://example.com/page",
  "title": "Page Title",
  "content": "Extracted page content...",
  "images": [
    {
      "src": "https://example.com/image.jpg",
      "alt": "Image description",
      "width": 800,
      "height": 600
    }
  ],
  "metadata": {
    "selectedText": "User selected text",
    "wordCount": 1500,
    "timestamp": "2025-12-20T07:51:29.000Z"
  }
}
```

## Response

```json
{
  "success": true,
  "data": {
    "captureId": "uuid",
    "notionPageId": "uuid",
    "agentProcessing": [
      {
        "agent": "AndrAIa",
        "status": "processing",
        "task": "analyze-tool"
      }
    ]
  }
}
```

## Authentication

Requires Bearer token in Authorization header.

## Processing Flow

1. Content validation and storage
2. Notion page creation
3. AI agent task distribution
4. Knowledge graph updates
5. Notification dispatch