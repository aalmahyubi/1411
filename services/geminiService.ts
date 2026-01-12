import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLeaveReason = async (
  type: string,
  keywords: string
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      أنت مساعد موارد بشرية محترف. 
      قم بكتابة سبب رسمي ومقنع لطلب إجازة باللغة العربية.
      نوع الإجازة: ${type}
      كلمات مفتاحية من الموظف: ${keywords}
      
      المخرجات: فقرة نصية قصيرة ومهذبة ورسمية جاهزة للإرسال للمدير. لا تضع أي مقدمات.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "عذراً، لم أتمكن من إنشاء النص.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالمساعد الذكي.";
  }
};
