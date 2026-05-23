

import { apiGenerateDescription } from './apiService';

export const generateEventDescription = async (title: string, category: string): Promise<string> => {
  try {
    const data = await apiGenerateDescription(title, category);
    return data.description || "No description generated.";
  } catch (error: any) {
    console.error("Backend Gemini Error:", error);
    throw new Error(error.message || "Failed to generate description. Please write manually.");
  }
};
