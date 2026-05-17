// ============ الجسيمات المتحركة ============
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        container.appendChild(particle);
    }
}

// ============ تبديل النماذج ============
function toggleForms() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('registerForm').classList.toggle('hidden');
}

// ============ تسجيل الدخول ============
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            setTimeout(() => window.location.href = '/dashboard', 1000);
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('حدث خطأ في الاتصال', 'error');
    }
}

// ============ التسجيل ============
async function register() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!username || !email || !password) {
        showToast('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            setTimeout(() => window.location.href = '/dashboard', 1000);
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('حدث خطأ في الاتصال', 'error');
    }
}

// ============ تسجيل الخروج ============
async function logout() {
    await fetch('/api/logout');
    window.location.href = '/';
}

// ============ عداد الكلمات ============
function updateWordCount() {
    const text = document.getElementById('originalText').value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('wordCount').textContent = words + ' كلمة';
    
    // تحذير عند تجاوز الحد
    if (words > 20000) {
        document.getElementById('wordCount').style.color = '#ff6b6b';
    } else {
        document.getElementById('wordCount').style.color = '';
    }
}

// ============ اختيار نمط الصياغة ============
function selectStyle(style, button) {
    window.selectedStyle = style;
    document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

// ============ رفع الملف ============
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('style', window.selectedStyle || 'academic');
    
    try {
        const response = await fetch('/api/upload-file', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('originalText').value = data.original_text;
            updateWordCount();
            showResult(data.rephrased_text, window.selectedStyle);
            showToast('تم رفع الملف وصياغته بنجاح', 'success');
            loadHistory();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('حدث خطأ في معالجة الملف', 'error');
    }
    
    showLoading(false);
}

// ============ إعادة الصياغة ============
async function rephraseText() {
    const text = document.getElementById('originalText').value.trim();
    
    if (!text) {
        showToast('يرجى إدخال النص أولاً', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/rephrase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                style: window.selectedStyle || 'academic'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResult(data.rephrased_text, window.selectedStyle, data.word_count);
            showToast('تمت إعادة الصياغة بنجاح', 'success');
            loadHistory();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('حدث خطأ في المعالجة', 'error');
    }
    
    showLoading(false);
}

// ============ عرض النتيجة ============
function showResult(text, style, wordCount) {
    const resultCard = document.getElementById('resultCard');
    const resultText = document.getElementById('resultText');
    const resultStyle = document.getElementById('resultStyle');
    const resultWords = document.getElementById('resultWords');
    
    resultCard.style.display = 'block';
    resultText.textContent = text;
    resultStyle.textContent = style === 'academic' ? 'أكاديمي' : style === 'creative' ? 'إبداعي' : 'تلخيص';
    resultWords.textContent = (wordCount || text.split(/\s+/).length) + ' كلمة';
    
    // تمرير سلس إلى النتيجة
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ============ نسخ النتيجة ============
function copyResult() {
    const text = document.getElementById('resultText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('تم النسخ إلى الحافظة', 'success');
    });
}

// ============ تحميل كـ Word ============
async function downloadWord() {
    const text = document.getElementById('resultText').textContent;
    
    try {
        const response = await fetch('/api/download-word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'مروان_اكاديمي.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('تم تحميل ملف Word بنجاح', 'success');
        }
    } catch (error) {
        showToast('حدث خطأ في التحميل', 'error');
    }
}

// ============ تحميل السجل ============
async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();
        
        if (data.success && data.history.length > 0) {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = data.history.map(item => `
                <div class="history-item">
                    <strong>${item.rephrased_preview}</strong>
                    <div style="display:flex;gap:10px;margin-top:5px;">
                        <span class="badge">${item.style === 'academic' ? 'أكاديمي' : item.style}</span>
                        <span class="badge">${item.word_count} كلمة</span>
                        <span style="color:var(--text-secondary);font-size:0.8rem;">${item.created_at}</span>
                    </div>
                </div>
            `).join('');
        } else {
            document.getElementById('historyList').innerHTML = '<p class="text-muted">لا توجد معالجات سابقة</p>';
        }
    } catch (error) {
        document.getElementById('historyList').innerHTML = '<p class="text-muted">تعذر تحميل السجل</p>';
    }
}

// ============ الإشعارات ============
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.querySelector('svg').setAttribute('data-feather', type === 'success' ? 'check-circle' : 'alert-circle');
    feather.replace();
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============ مؤشر التحميل ============
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}