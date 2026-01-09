# Gemini AI Setup Instructions

To enable the **AI Policy Generator**, follow these steps:

1.  Go to [Google AI Studio](https://aistudio.google.com/) and create a free API Key.
2.  Create a file named `.env.local` in the `frontend` directory.
3.  Paste the following content into that file:

```env
NEXT_PUBLIC_GEMINI_API_KEY=PASTE_YOUR_KEY_HERE
NEXT_PUBLIC_MNEE_ADDRESS=0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
```

4.  Restart the frontend development server (`npm run dev`).
