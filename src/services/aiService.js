// src/services/aiService.js
import axios from 'axios';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

// In a production environment, you should never expose your API key in the frontend
// This should be handled through a backend service or using environment variables
// with proper security measures
const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY; 

export const generateSiteContent = async (prompt) => {
  if (!API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4-turbo",  // Use the most appropriate model
        messages: [
          {
            role: "system",
            content: "You are a professional web developer assistant that creates clean, semantic HTML, CSS, and JavaScript code based on user descriptions. Generate only the code without explanations. Separate HTML, CSS, and JavaScript with proper code blocks."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating site content:', error);
    throw error;
  }
};

export const parseGeneratedContent = (content) => {
  // Extract HTML, CSS, and JavaScript from the generated content
  const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
  const cssMatch = content.match(/```css\n([\s\S]*?)\n```/);
  const jsMatch = content.match(/```javascript\n([\s\S]*?)\n```/);
  const jsMatch2 = content.match(/```js\n([\s\S]*?)\n```/); // Alternative JS tag

  return {
    html: htmlMatch ? htmlMatch[1] : '',
    css: cssMatch ? cssMatch[1] : '',
    js: jsMatch ? jsMatch[1] : (jsMatch2 ? jsMatch2[1] : '')
  };
};

export const saveToFirebase = async (projectName, content, description) => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    const projectsRef = collection(db, 'projects');
    const newProjectRef = doc(projectsRef);
    
    await setDoc(newProjectRef, {
      name: projectName,
      userId: auth.currentUser.uid,
      description: description,
      html: content.html,
      css: content.css,
      js: content.js,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return newProjectRef.id;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    throw error;
  }
};

export const generateCombinedHtml = (content) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Website</title>
  <style>
    ${content.css}
  </style>
</head>
<body>
  ${content.html}
  <script>
    ${content.js}
  </script>
</body>
</html>
  `;
};
