<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1SgSi1Bu6OnZRpf_5jIyUHJtEr23fmoB7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the API key and URL:
   - Create a `.env.local` file in the root directory
   - Add your Langflow API key and URL:
     ```
     VITE_LANGFLOW_API_KEY=tu_clave_api_aqui
     VITE_LANGFLOW_API_URL=https://anything-langflow.rb9rje.easypanel.host/api/v1/run/1ee117e1-24fa-4da8-9807-7e65fbfb3c78
     ```
   - Or use `LANGFLOW_API_KEY` and `LANGFLOW_API_URL` as alternatives
   - If not set, the app will use default values

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:3000`)

## Configuration

The chatbot now uses the Langflow API instead of Google GenAI. Make sure to:
- Set your Langflow API key in the `.env.local` file using `VITE_LANGFLOW_API_KEY`
- Set your Langflow API URL in the `.env.local` file using `VITE_LANGFLOW_API_URL`
- If not configured, the app will use default values (the new endpoint URL and a placeholder API key)
