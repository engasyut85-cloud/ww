
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    // Access environment variable directly as per guidelines
    // process.env is defined in vite.config.ts
    const apiKey = process.env.API_KEY; 
    
    if (!apiKey) {
        console.warn("API Key not found in environment variables");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const askLaborLawAdvisor = async (question: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "خطأ: مفتاح API غير موجود. يرجى التأكد من الإعدادات.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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
        return response.text || "لم يتم استلام رد من النظام.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "عذراً، حدث خطأ أثناء الاتصال بالمستشار الآلي. حاول مرة أخرى لاحقاً.";
    }
};