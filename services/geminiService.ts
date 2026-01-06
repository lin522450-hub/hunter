
import { GoogleGenAI, Type } from "@google/genai";
import { OrgNode, JobPosition } from "../types";

// Always use a named parameter for apiKey and rely exclusively on process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // Generate organization chart using gemini-3-flash-preview
  async generateOrgChart(companyName: string): Promise<OrgNode> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a simplified hierarchical HR organization chart for ${companyName} in JSON format. 
      Focus on C-level and high-level HR/Development leadership.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            title: { type: Type.STRING },
            children: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  title: { type: Type.STRING },
                  children: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, title: { type: Type.STRING } } } }
                }
              }
            }
          }
        }
      }
    });
    
    // Use .text property directly, it's not a function.
    return JSON.parse(response.text || '{}');
  },

  // Suggest development strategy using gemini-3-flash-preview
  async suggestDevelopmentStrategy(companyName: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a strategic plan to develop business relationships with ${companyName}. 
      Include key decision-makers to target and typical hiring patterns for development roles.`,
    });
    return response.text || '';
  },

  // Simulate job import using gemini-3-flash-preview and structured JSON output
  async simulate104Import(keyword: string): Promise<JobPosition[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Simulate a search on 104 Job Bank for positions related to "${keyword}". 
      Return a list of 3-5 relevant job positions in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              salary: { type: Type.STRING },
              experience: { type: Type.STRING },
              description: { type: Type.STRING },
              url: { type: Type.STRING }
            }
          }
        }
      }
    });
    const text = response.text;
    const jobs = text ? JSON.parse(text) : [];
    return jobs.map((j: any) => ({ ...j, source: '104' }));
  }
};
