const supabase = supabase.createClient('YOUR_URL', 'YOUR_KEY');

async function loadComplaints() {
    const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

    const tbody = document.getElementById('complaintTableBody');
    tbody.innerHTML = '';

    data.forEach(item => {
        // --- ส่วนของ Guardrail ---
        // ถ้าความมั่นใจต่ำกว่า 0.7 จะใส่ class 'low-confidence' เพื่อเตือน Admin 
        const confidenceClass = item.confidence_score < 0.7 ? 'low-confidence' : '';
        
        const row = `
            <tr class="${confidenceClass}">
                <td>${new Date(item.created_at).toLocaleString()}</td>
                <td>${item.customer_text}</td>
                <td><strong>${item.ai_category}</strong></td>
                <td>${(item.confidence_score * 100).toFixed(0)}%</td>
                <td class="status-${item.status}">${item.status}</td>
                <td>
                    ${item.status === 'pending' ? `
                        <button onclick="updateStatus('${item.id}', 'approved')">✅ ยืนยัน</button>
                        <button onclick="editCategory('${item.id}')">✏️ แก้ไข</button>
                    ` : 'จัดการแล้ว'}
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// --- ส่วนของ HITL: จุดที่ 1 (ยืนยันค่าจาก AI)  ---
async function updateStatus(id, newStatus) {
    const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', id);
    
    if (!error) loadComplaints();
}

// --- ส่วนของ HITL: จุดที่ 2 (แก้ไขข้อมูลเมื่อ AI ผิดพลาด) [cite: 104] ---
async function editCategory(id) {
    const newCat = prompt("ระบุหมวดหมู่ที่ถูกต้อง:");
    if (newCat) {
        await supabase
            .from('complaints')
            .update({ ai_category: newCat, status: 'edited' })
            .eq('id', id);
        loadComplaints();
    }
}

// โหลดข้อมูลครั้งแรกเมื่อเปิดหน้าเว็บ
loadComplaints();