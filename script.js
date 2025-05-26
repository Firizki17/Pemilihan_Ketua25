let selectedCandidate = null;
let loggedInUser = null;
let isPanitia = false;

const candidates = [
  "M. Iqrom Januar D",
  "M. Risky Tri Saputra",
];

// Daftar NPM yang berhak memilih
const allowedNPMs = [
  "2125270003", "2125270004", "2125270005", "2125270006", "2125270007",
  "2125270008", "2125270009", "2125270010", "2226270004", "2226270005",
  "2226270007", "2226270008", "2226270010", "2226270012", "2226270013",
  "2226270015", "2226270016", "2226270017", "2226270018", "2226270019",
  "2226270020", "2226270021", "2226270022", "2226270024", "2226270025",
  "2327270002", "2327270003", "2327270006", "2327270007", "2327270008",
  "2327270009", "2327270010", "2327270011", "2327270012", "2327270013",
  "2327270014", "2327270016", "2327270017", "2428270001", "2428270002",
  "2428270003", "2428270004", "2428270005", "2428270007", "2428270008",
  "2428270009", "2428270010", "2428270011", "2428270012", "2428270013",
  "2428270014", "2428270016", "2428270017", "2428270018", "1"
];

function showLogin(role) {
  document.getElementById('login-options').style.display = 'none';
  if (role === 'pemilih') {
    document.getElementById('login-pemilih').style.display = 'block';
  } else if (role === 'panitia') {
    document.getElementById('login-panitia').style.display = 'block';
  }
}

function loginPemilih() {
  const nama = document.getElementById('nama').value.trim();
  const npm = document.getElementById('npm').value.trim();

  if (!nama || !npm) {
    alert("Mohon isi Nama dan NPM dengan benar.");
    return;
  }

  if (!allowedNPMs.includes(npm)) {
    alert("NPM tidak terdaftar sebagai pemilih yang sah.");
    return;
  }

  let history = JSON.parse(localStorage.getItem('history')) || [];
  if (history.find(h => h.npm === npm)) {
    alert("NPM sudah pernah melakukan voting.");
    return;
  }

  loggedInUser = { nama, npm };
  isPanitia = false;

  document.getElementById('login-pemilih').style.display = 'none';
  document.getElementById('candidates').style.display = 'grid';
  document.getElementById('logoutBtn').style.display = 'inline-block';
  updateStatus(`Halo, ${nama}. Silahkan pilih kandidat Anda.`);
}

function loginPanitia() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value.trim();

  if (user === 'admin' && pass === 'HMTE2025') {
    loggedInUser = { user };
    isPanitia = true;

    document.getElementById('login-panitia').style.display = 'none';
    document.getElementById('results-tab').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    updateStatus(`Selamat datang, Panitia.`);
    renderResults();
  } else {
    alert("Username atau password salah.");
  }
}

function logout() {
  loggedInUser = null;
  isPanitia = false;
  selectedCandidate = null;
  document.getElementById('candidates').style.display = 'none';
  document.getElementById('results-tab').style.display = 'none';
  document.getElementById('login-pemilih').style.display = 'none';
  document.getElementById('login-panitia').style.display = 'none';
  document.getElementById('login-options').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'none';
  updateStatus('');
}

function prepareVote(name) {
  selectedCandidate = name;
  const popup = document.getElementById('popup');
  popup.style.display = 'flex';
  setTimeout(() => popup.classList.add('show'), 10);
}

function closePopup() {
  const popup = document.getElementById('popup');
  popup.classList.remove('show');
  setTimeout(() => {
    popup.style.display = 'none';
  }, 300);
  selectedCandidate = null;
}

function confirmVote() {
  vote(selectedCandidate);
  const popup = document.getElementById('popup');
  const thankyou = document.getElementById('thankyou');

  popup.classList.remove('show');
  setTimeout(() => {
    popup.style.display = 'none';
    thankyou.style.display = 'flex';
    setTimeout(() => thankyou.classList.add('show'), 10);
  }, 300);
}

function closeThankYou() {
  const thankyou = document.getElementById('thankyou');
  thankyou.classList.remove('show');
  setTimeout(() => {
    thankyou.style.display = 'none';
  }, 300);
  logout();
}

function vote(name) {
  if (!loggedInUser || !name) return;

  let votes = JSON.parse(localStorage.getItem('votes')) || {};
  votes[name] = (votes[name] || 0) + 1;
  localStorage.setItem('votes', JSON.stringify(votes));

  let history = JSON.parse(localStorage.getItem('history')) || [];
  history.push({
    nama: loggedInUser.nama,
    npm: loggedInUser.npm,
    waktu: new Date().toLocaleString(),
    pilihan: name
  });
  localStorage.setItem('history', JSON.stringify(history));

  updateStatus(`Terima kasih sudah memilih ${name}!`);
  selectedCandidate = null;
  document.getElementById('candidates').style.display = 'none';
}

function renderResults() {
  const votes = JSON.parse(localStorage.getItem('votes')) || {};
  const history = JSON.parse(localStorage.getItem('history')) || [];

  // Hitung total suara
  const totalVotes = candidates.reduce((sum, name) => sum + (votes[name] || 0), 0);

  const ctx = document.getElementById('chart').getContext('2d');

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: candidates,
      datasets: [{
        label: 'Jumlah Suara',
        data: candidates.map(name => votes[name] || 0),
        backgroundColor: '#2563eb'
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1000 },
      scales: {
        y: { beginAtZero: true, precision: 0 }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const count = context.parsed.y;
              const percent = totalVotes > 0 ? (count / totalVotes * 100).toFixed(1) : 0;
              return `${count} suara (${percent}%)`;
            }
          }
        }
      }
    }
  });

  // Render tabel riwayat dengan persentase (persentase suara kandidat pada waktu itu)
  const tbody = document.querySelector('#history-table tbody');
  tbody.innerHTML = '';

  // Buat object jumlah suara kandidat (current votes)
  // Kalau ingin persentase suara per kandidat dari total suara sekarang
  for (const row of history) {
    const suaraKandidat = votes[row.pilihan] || 0;
    const persenKandidat = totalVotes > 0 ? ((suaraKandidat / totalVotes) * 100).toFixed(1) : 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.nama}</td>
      <td>${row.npm}</td>
      <td>${row.waktu}</td>
      <td>${row.pilihan} (${persenKandidat}%)</td>
    `;
    tbody.appendChild(tr);
  }
}

function resetVoting() {
  if (confirm("Yakin ingin mereset semua hasil voting?")) {
    localStorage.removeItem('votes');
    localStorage.removeItem('history');
    renderResults();
    updateStatus("Data voting telah direset.");
  }
}

function updateStatus(msg) {
  document.getElementById('status').textContent = msg;
}
function showVisiMisi(namaFile) {
  const visimisiPopup = document.getElementById('visimisi-popup');
  const visimisiImg = document.getElementById('visimisi-img');

  visimisiImg.src = `assets/visimisi_${namaFile}.jpg`;
  visimisiPopup.style.display = 'flex';
  setTimeout(() => visimisiPopup.classList.add('show'), 10);
}

function closeVisiMisi() {
  const visimisiPopup = document.getElementById('visimisi-popup');
  visimisiPopup.classList.remove('show');
  setTimeout(() => {
    visimisiPopup.style.display = 'none';
    document.getElementById('visimisi-img').src = '';
  }, 300);
}


