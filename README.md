# 🧠 Mastra Gemini Content Planner

## 🚀 Overview

The **Mastra Gemini Content Planner** is an AI-powered workflow built using the **Mastra Framework** and **Google Gemini Generative AI**.

It helps content creators, marketers, and strategists **generate data-driven content summaries** and **cross-platform post ideas** based on a given topic — eliminating manual brainstorming, research, and content structuring.

With this agent, you can instantly generate:

- A concise topic summary and insights
- Social-media-ready post ideas for platforms like **Twitter (X)**, **LinkedIn**, **Instagram**, **TikTok**, and others

---

## 🧩 Project Description

This project uses a custom **Mastra Tool (`contentPlannerTool`)** powered by Gemini.  
Given a topic, the agent outputs:

1. ✅ A **brief, high-value topic summary**
2. 🧵 A **multi-platform content plan** with post ideas, descriptions, and hashtags

It demonstrates how to integrate **Gemini AI within the Mastra ecosystem** to create modular agents capable of automating creative workflows such as content planning and strategy.

---

## ✨ Features

| Feature                                  | Description                                             |
| ---------------------------------------- | ------------------------------------------------------- |
| 🧠 AI-generated topic summaries          | Gemini-powered intelligent content breakdown            |
| 📱 Multi-platform content ideas          | X, LinkedIn, Instagram, TikTok, YouTube, Blog & Threads |
| 🧰 Built with Mastra Tools               | Modular, composable & extendable                        |
| 🤖 Ideal for content workflow automation | Plug into larger Mastra agents or pipelines             |
| 🔌 Easy to customize                     | Add more platforms or formats as needed                 |

---

## 🧠 Example Workflow Configuration

````json
{
  "active": true,
  "category": "utilities",
  "description": "An AI agent that generates content summaries and multi-platform content plans.",
  "id": "contentPlanner_v1",
  "name": "content_planner_agent",
  "long_description": "
    You are a creative AI content strategist.
    Your primary function is to generate a brief, engaging summary and a cross-platform content plan for any given topic.
    - If no topic is provided, ask the user for one.
    - The plan should include post ideas for platforms like Twitter (X), LinkedIn, Instagram, and TikTok.
    - Keep tone professional yet engaging.
    - Use relevant hashtags and short captions when suitable.
    Use the contentPlannerTool to generate the summary and ideas.
  ",
  "short_description": "Generate summaries and content ideas across platforms",
  "nodes": [
    {
      "id": "contentPlannerNode",
      "name": "Content Planner Tool",
      "parameters": {},
      "position": [420, -100],
      "type": "a2a/mastra-a2a-node",
      "typeVersion": 1,
      "url": "yoururl/a2a/agent/contentPlanner"
    }
  ],
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  }
}

# 📦 Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/mhkaycey/AI-Content-Planner
cd AI-Content-Planner
````

## 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

## 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

(Include any Mastra credentials if required)

---

# 🧑‍💻 Running the Project

Start development mode:

```bash
npm run dev
```

---

# 📦 Deployment

Build and deploy:

```bash
npm run build
mastra deploy
```

Or host using your Mastra Cloud instance at:

```
https://your-url/a2a/agent/contentPlanner
```

---

# 🔥 Testing With Postman

Use the body below to hit the agent endpoint:

```json
{
  "jsonrpc": "2.0",
  "id": "test-001",
  "method": "message/send",
  "params": {
    "message": {
      "kind": "message",
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Give me a 2-week content schedule for the topic Fitness for Busy Professionals and include post types, captions, and platform recommendations"
        }
      ],
      "messageId": "msg-001",
      "taskId": "task-001"
    },
    "configuration": {
      "blocking": true
    }
  }
}
```

---

# 🧩 Tech Stack

| Tech                        | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| **Mastra Framework**        | Modular AI workflow orchestration               |
| **Google Gemini API**       | Natural language generation & content reasoning |
| **TypeScript / JavaScript** | Logic, tooling & runtime                        |
