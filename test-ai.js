import 'dotenv/config';
import { generateAIResponse } from './dist/server/aiAssistant.js';

async function test() {
  try {
    const res = await generateAIResponse("Hello, who are you?", "You are a helpful AI.");
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
