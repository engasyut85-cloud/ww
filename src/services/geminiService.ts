
import { GoogleGenAI } from "@google/genai";

// Use direct environment variable access for API key as per guidelines
export const askLaborLawAdvisor = async (question: string): Promise<string> => {
    // Initialize GoogleGenAI right before the call with named parameter
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            // Upgrade to gemini-3-flash-preview for basic reasoning and text tasks
            model: "gemini-3-flash-preview",
            contents: question,
            config: {
                systemInstruction: `
                    أنت خبير قانوني ومستشار موارد بشرية متخصص في قانون العمل المصري رقم 12 لسنة 2003 وقانون التأمينات الاجتماعية الجديد رقم 148 لسنة 2019.
                    اسمك "مستشار نقابة المهندسين".
                    أجب على الأسئلة بدقة ووضوح وباللغة العربية.
                    استشهد بمواد القانون عند الضرورة ولكن بسط الشرح للمستخدم.
                    إذا كان السؤال خارج نطاق الموارد البشرية أو القانون المصري، اعتذر بأسلوب مهذب.
                `,
                temperature: 0.7
            }
        });
        // Correct usage of .text property (not a method)
        return response.text || "لم يتم استلام رد من النظام.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "عذراً، حدث خطأ أثناء الاتصال بالمستشار الآلي. حاول مرة أخرى لاحقاً.";
    }
};
