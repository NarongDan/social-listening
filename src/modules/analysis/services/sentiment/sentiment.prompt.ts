export function sentimentPrompt(headline: string, comment: string): string {
    return `
วิเคราะห์ความคิดเห็นในบริบทของหัวข้อข่าว
- หัวข้อข่าว: "${headline}"
- ความคิดเห็น: "${comment}"

ตอบในรูปแบบ JSON:
{
  "sentiment": "positive | negative | neutral",
  "stance": "สนับสนุน | คัดค้าน | เสียดสี | ไม่มีท่าที",
  "confidence": 0-1,
  "reason": "อธิบายสั้น ๆ ว่าทำไมถึงวิเคราะห์แบบนั้น"
}
  `.trim();
}
