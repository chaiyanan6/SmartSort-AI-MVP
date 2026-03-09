// 1. นำเข้า Supabase Client (ใช้ CDN สำหรับงานไวแบบ Vibe Coding)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient('YOUR_URL', 'YOUR_KEY')

async function handleSubmission() {
  const text = document.getElementById('complaintInput').value
  if (!text) return alert("กรุณากรอกข้อความ")

  document.getElementById('statusMsg').innerText = "AI กำลังวิเคราะห์..."

  try {
    // 2. AI Capability: ส่งข้อความไปให้ AI วิเคราะห์ (ตัวอย่างการเรียกผ่าน API)
    // ในขั้นตอนนี้ AI จะแยกประเภทเป็น 'แจ้งซ่อม', 'ขอคืนเงิน', 'สอบถาม' [cite: 19, 20]
    const aiResponse = await callAI(text) 

    // 3. บันทึกลง Supabase (Backend/Database) 
    const { data, error } = await supabase
      .from('complaints')
      .insert([
        { 
          customer_text: text, 
          ai_category: aiResponse.category, 
          confidence_score: aiResponse.confidence,
          status: 'pending' // สถานะรอคนตรวจสอบ (HITL) 
        }
      ])

    if (error) throw error
    document.getElementById('statusMsg').innerText = "ส่งเรื่องสำเร็จ! AI จัดหมวดหมู่เป็น: " + aiResponse.category
  } catch (err) {
    console.error(err)
    document.getElementById('statusMsg').innerText = "เกิดข้อผิดพลาด"
  }
}

// ฟังก์ชันจำลองการเรียก AI (หรือจะเรียก OpenAI/Gemini API จริงก็ได้)
async function callAI(text) {
  // ตรงนี้คือจุดที่เรานิยาม AI-Doable [cite: 88, 89, 90]
  // ส่ง text ไป -> ได้หมวดหมู่กลับมา
  return { category: 'แจ้งซ่อม', confidence: 0.85 } 
}