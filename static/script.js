
const categorySelect = document.getElementById('category');
const otherBox = document.getElementById('otherBox');
const otherInput = document.getElementById('otherInput');
const form = document.getElementById('maintenanceForm');
const progressFill = document.getElementById('progressFill');
const submitBtn = document.getElementById('submitBtn');
const responseMessage = document.getElementById('responseMessage');

// API base — override at runtime by setting window.__API_BASE__ (e.g. 'https://api.example.com')
// If left empty, the script will use relative '/api/maintenance' (same origin).
const API_BASE = window.__API_BASE__ || ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://127.0.0.1:5500' : '');

categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'Other') {
        otherBox.classList.remove('hidden');
        otherInput.required = true;
    } else {
        otherBox.classList.add('hidden');
        otherInput.required = false;
        otherInput.value = '';
    }
    updateProgressBar();
});


function updateProgressBar() {
    const requiredFields = form.querySelectorAll(
        'input[required], select[required], textarea[required]'
    );

    let filled = 0;

    requiredFields.forEach(field => {
        if (field.type === 'radio') {
            if (form.querySelector(`input[name="${field.name}"]:checked`)) {
                filled++;
            }
        } else if (field.value.trim() !== '') {
            filled++;
        }
    });

    const progress = (filled / requiredFields.length) * 100;
    progressFill.style.width = `${progress}%`;
}

form.addEventListener('input', updateProgressBar);
form.addEventListener('change', updateProgressBar);


const issueDate = document.querySelector('input[name="issue_date"]');
issueDate.value = new Date().toISOString().split('T')[0];


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        block: formData.get('block'),
        floor: formData.get('floor'),
        room_no: formData.get('room_no'),
        category: formData.get('category'),
        other_detail: formData.get('other_detail') || '',
        priority: formData.get('priority'),
        issue_date: formData.get('issue_date'),
        description: formData.get('description'),
        timestamp: new Date().toISOString()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const response = await fetch(`${API_BASE}/api/maintenance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Submission failed');
        }

        // SUCCESS
        responseMessage.classList.remove('hidden');
        form.style.display = 'none';
        document.getElementById('ticketId').textContent = result.ticket_id;

        // Add "Submit Another" button
        const submitAnother = document.createElement('button');
        submitAnother.type = 'button';
        submitAnother.textContent = 'Submit Another Report';
        submitAnother.style.marginTop = '20px';
        submitAnother.style.padding = '12px 24px';
        submitAnother.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        submitAnother.style.color = 'white';
        submitAnother.style.border = 'none';
        submitAnother.style.borderRadius = '8px';
        submitAnother.style.cursor = 'pointer';
        submitAnother.style.fontSize = '1rem';
        submitAnother.style.fontWeight = '700';
        
        submitAnother.onclick = () => {
            form.reset();
            form.style.display = 'block';
            responseMessage.classList.add('hidden');
            progressFill.style.width = '0%';
            otherBox.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Report';
            submitAnother.remove();
        };
        
        responseMessage.appendChild(submitAnother);

    } catch (error) {
        console.error(error);
        alert('Backend not connected.\nMake sure Flask is running on http://127.0.0.1:5500');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
    }
});


console.log('Campus Maintenance Form loaded successfully!');
console.log('Backend API base:', API_BASE || 'same origin (/api/maintenance)');
