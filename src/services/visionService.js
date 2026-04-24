const OpenAI = require("openai");
const config = require("../config");

const useOpenRouter = !!config.openrouter.apiKey;

const openai = new OpenAI({
  apiKey: useOpenRouter ? config.openrouter.apiKey : config.openai.apiKey,
  baseURL: useOpenRouter ? config.openrouter.baseURL : undefined,
  defaultHeaders: useOpenRouter ? {
    "HTTP-Referer": "https://ada-compliance-tool.local", // Optional, for OpenRouter rankings
    "X-Title": "ADA Compliance Tool",
  } : undefined,
});

/**
 * Tiered Vision-Language Pipeline
 * 1. CLIP (Filtering/Classification) - Mocked/Placeholder
 * 2. BLIP (Initial Captioning) - Mocked/Placeholder
 * 3. GPT-4o Vision (Refinement & Final Alt-Text)
 */
const analyzeImage = async (imageUrl) => {
  try {
    console.log(`Analyzing image: ${imageUrl}`);
    
    // Step 1: CLIP - Check if image is relevant for alt-text (e.g., not a spacer/pixel)
    const isRelevant = await runClipFilter(imageUrl);
    if (!isRelevant) {
      return { 
        isRelevant: false, 
        suggestion: "", 
        confidence: 0,
        reason: "Decorative or irrelevant image"
      };
    }

    // Step 2: BLIP - Get initial caption
    const initialCaption = await runBlipCaptioning(imageUrl);

    // Step 3: GPT-4o Vision - Refine for WCAG compliance
    const finalAltText = await runGpt4oVisionRefinement(imageUrl, initialCaption);

    return {
      isRelevant: true,
      suggestion: finalAltText,
      confidence: 0.95, // Hypothetical confidence
      pipeline: "CLIP -> BLIP -> GPT-4o Vision"
    };
  } catch (error) {
    console.error(`Error in vision pipeline for ${imageUrl}:`, error);
    throw error;
  }
};

const runClipFilter = async (imageUrl) => {
  // Placeholder: In a real scenario, this would call a CLIP model to check if image is decorative
  // For now, assume most images found by crawler are relevant unless very small
  return true;
};

const runBlipCaptioning = async (imageUrl) => {
  // Placeholder: Calling a BLIP model for a quick caption
  return "An image that needs description";
};

const runGpt4oVisionRefinement = async (imageUrl, initialCaption) => {
  if (!config.openai.apiKey && !config.openrouter.apiKey) {
    console.warn("AI API Key missing, returning mock alt-text");
    return `Description for ${imageUrl}`;
  }

  const modelName = useOpenRouter ? "openai/gpt-4o" : "gpt-4o";

  const response = await openai.chat.completions.create({
    model: modelName,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Generate a concise, descriptive alt-text for this image following WCAG guidelines. Avoid starting with 'Image of' or 'Picture of'. Context: It was found on a website and had no alt text." },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 100,
  });

  return response.choices[0].message.content.trim();
};

module.exports = {
  analyzeImage,
};
