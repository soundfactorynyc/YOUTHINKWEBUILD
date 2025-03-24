import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * Generates HTML/CSS/JS based on a user prompt.
 * @param {string} prompt - User's site description.
 * @returns {string} - AI-generated website code.
 */
export const generateSiteCode = async (prompt) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates complete website code based on user prompts. Return only code inside triple backticks.',
        },
        {
          role: 'user',
          content: `Build a website with the following description:\n\n${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = response.data.choices[0].message.content;

    // Extract the code from ``` blocks if present
    const codeMatch = content.match(/```(?:html)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : content;

  } catch (error) {
    console.error('OpenAI Error:', error);
    return 'Something went wrong while generating the site.';
  }
};
