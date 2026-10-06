\
console.log('script.js berhasil dimuat');
/*
  WAJIB DIUBAH:
  Tempel URL deployment Google Apps Script /exec Anda di bawah ini.
  Contoh:
  const API_URL = 'https://script.google.com/macros/s/AKfycbxxxx/exec';
*/
const API_URL = 'https://script.google.com/macros/s/AKfycbz24fnwiQP5O_n31JW8iLk97h4eoQ2kZOSpgHH9l8fjF0XAJTK_jnordmmwmRQ6unasWw/exec';

const TEMPLATE_URLS = {
  BEAUTY: 'templates/beauty-class.jpeg',
  YLT_2022: 'templates/ylt-2022.jpeg',
  YLT_2023: 'templates/ylt-2023.jpeg',
  YLT_2024: 'templates/ylt-2024.jpeg',
  YLT_2025: 'templates/ylt-2025.jpeg'
};

/*
  Posisi nama memakai koordinat berdasarkan ukuran gambar template asli.
  Beauty: 1600x1131
  YLT:    1600x1140

  Jika ingin menggeser:
  - x lebih besar = ke kanan
  - y lebih besar = ke bawah
*/
const LAYOUT = {
  BEAUTY: {
    x: 800,
    y: 535,
    maxSize: 42,
    minSize: 21,
    maxWidth: 1080
  },
  YLT_2022: {
    x: 800,
    y: 575,
    maxSize: 42,
    minSize: 21,
    maxWidth: 1040
  },
  YLT_2023: {
    x: 800,
    y: 575,
    maxSize: 42,
    minSize: 21,
    maxWidth: 1040
  },
  YLT_2024: {
    x: 800,
    y: 575,
    maxSize: 42,
    minSize: 21,
    maxWidth: 1040
  },
  YLT_2025: {
    x: 800,
    y: 575,
    maxSize: 42,
    minSize: 21,
    maxWidth: 1040
  }
};

let currentStudent = null;

const searchForm = document.getElementById('searchForm');
const nimInput = document.getElementById('nim');
const searchBtn = document.getElementById('searchBtn');
const statusEl = document.getElementById('status');
const studentCard = document.getElementById('studentCard');

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await searchStudent();
});

function setStatus(message = '', type = '') {
  statusEl.innerHTML = message;
  statusEl.className = 'status' + (type ? ' ' + type : '');
}

async function searchStudent() {
  const nim = nimInput.value.trim();
  currentStudent = null;
  studentCard.classList.add('hidden');

  if (!nim) {
    setStatus('Silakan masukkan NIM terlebih dahulu.', 'error');
    return;
  }

  if (!API_URL.startsWith('https://script.google.com/')) {
    setStatus('API Google Apps Script belum diatur pada file script.js.', 'error');
    return;
  }

  searchBtn.disabled = true;
  setStatus('<span class="spinner"></span>Mencari data...');

  try {
    const result = await jsonpRequest({
      action: 'findStudent',
      nim
    });

    if (!result || !result.ok) {
      setStatus(result?.message || 'NIM tidak ditemukan.', 'error');
      return;
    }

    currentStudent = result.student;
    renderStudent(result.student, result.certificates || []);
    setStatus('Data ditemukan.', 'success');
  } catch (error) {
    setStatus('Tidak dapat menghubungi server. ' + error.message, 'error');
  } finally {
    searchBtn.disabled = false;
  }
}

/*
  JSONP dipakai agar frontend Vercel dapat berkomunikasi
  dengan Apps Script tanpa masalah CORS browser.
*/
function jsonpRequest(params) {
  return new Promise((resolve, reject) => {
    const callbackName = '__certCallback_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    const script = document.createElement('script');
    const url = new URL(API_URL);

    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('callback', callbackName);
    url.searchParams.set('_', Date.now());

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Request timeout.'));
    }, 15000);

    function cleanup() {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Gagal memuat API.'));
    };

    script.src = url.toString();
    document.body.appendChild(script);
  });
}

function renderStudent(student, certificates) {
  document.getElementById('studentName').textContent = student.name;
  document.getElementById('studentNim').textContent = student.nim;
  document.getElementById('studentClass').textContent = student.className || '-';

  const list = document.getElementById('certList');
  list.innerHTML = '';

  if (!certificates.length) {
    list.innerHTML = '<p>Tidak ada sertifikat yang tersedia untuk data ini.</p>';
  }

  certificates.forEach(cert => {
    const card = document.createElement('article');
    card.className = 'cert-card';

    const icon = document.createElement('div');
    icon.className = 'cert-icon';
    icon.textContent = '★';

    const title = document.createElement('h3');
    title.textContent = cert.title;

    const desc = document.createElement('p');
    desc.textContent = cert.description;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Download PDF';
    btn.addEventListener('click', () => downloadCertificate(cert.type, btn));

    card.append(icon, title, desc, btn);
    list.appendChild(card);
  });

  studentCard.classList.remove('hidden');
}

async function downloadCertificate(type, button) {
  if (!currentStudent) return;

  const templateUrl = TEMPLATE_URLS[type];
  const layout = LAYOUT[type];

  if (!templateUrl || !layout) {
    setStatus('Konfigurasi template tidak ditemukan.', 'error');
    return;
  }

  button.disabled = true;
  setStatus('<span class="spinner"></span>Membuat PDF sertifikat...');

  try {
    const img = await loadImage(templateUrl);
    createPdf(img, currentStudent, type, layout);
    setStatus('Sertifikat berhasil dibuat.', 'success');
  } catch (error) {
    setStatus('Gagal membuat sertifikat: ' + error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Template gagal dimuat.'));
    img.src = src;
  });
}

function createPdf(image, student, type, layout) {
  if (!window.jspdf) {
    throw new Error('Library PDF belum selesai dimuat. Coba lagi beberapa detik.');
  }

  const { jsPDF } = window.jspdf;
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  /*
    PDF mengikuti ukuran / rasio template ASLI.
    Tidak ada margin putih, tidak crop, dan tidak stretch.
  */
  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    hotfixes: ['px_scaling'],
    compress: true
  });

  pdf.addImage(image, 'JPEG', 0, 0, width, height, undefined, 'FAST');

  // Helvetica pada PDF adalah sans-serif standar yang sangat dekat dengan Arial.
  pdf.setFont('helvetica', 'normal');

  let fontSize = layout.maxSize;
  pdf.setFontSize(fontSize);

  while (
    pdf.getTextWidth(student.name) > layout.maxWidth &&
    fontSize > layout.minSize
  ) {
    fontSize -= 1;
    pdf.setFontSize(fontSize);
  }

  pdf.setTextColor(20, 20, 20);
  pdf.text(student.name, layout.x, layout.y, {
    align: 'center',
    baseline: 'middle'
  });

  const safeName = student.name
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const certName = type === 'BEAUTY'
    ? 'Beauty Class'
    : type.replace('_', ' ');

  pdf.save(`Sertifikat - ${certName} - ${safeName}.pdf`);
}
