let isLoginMode = true;
let currentUser = null;

function toggleMode() {
  isLoginMode = !isLoginMode;
  document.getElementById('authTitle').innerText = isLoginMode ? 'Увійти' : 'Реєстрація';
  document.querySelector('#authForm button[type="submit"]').innerText = isLoginMode ? 'Увійти' : 'Зареєструватися';
  document.getElementById('nameField').style.display = isLoginMode ? 'none' : 'block';
  document.getElementById('message').innerText = '';
}

function openTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

function openModal(id) {
  document.getElementById(`newsModal-${id}`).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(`newsModal-${id}`).style.display = 'none';
}

function openAddJobModal() {
  document.getElementById('addJobModal').style.display = 'flex';
}

function closeAddJobModal() {
  document.getElementById('addJobModal').style.display = 'none';
  document.getElementById('addJobForm').reset();
}

function openSettingsModal() {
  document.getElementById('user-name').value = currentUser.name || '';
  document.getElementById('user-email').value = currentUser.email;
  document.getElementById('user-phone').value = currentUser.phone || '';
  document.getElementById('user-bio').value = currentUser.bio || '';
  document.getElementById('user-resume').value = currentUser.resume || '';
  document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettingsModal() {
  document.getElementById('settingsModal').style.display = 'none';
}

function showMain(user) {
  currentUser = user;
  document.getElementById('authModal').style.display = 'none';
  document.getElementById('news-section').style.display = 'block';
  document.getElementById('profile').innerHTML = `
    👤 ${user.name || user.email.split('@')[0]} 
    <button id="logout-btn" onclick="logout()">Вийти</button>
  `;
  loadUserJobs();
}

function logout() {
  localStorage.removeItem('loggedIn');
  location.reload();
}

function saveProfile() {
  const name = document.getElementById('user-name').value.trim();
  const phone = document.getElementById('user-phone').value.trim();
  const bio = document.getElementById('user-bio').value.trim();
  const resume = document.getElementById('user-resume').value.trim();
  currentUser.name = name;
  currentUser.phone = phone;
  currentUser.bio = bio;
  currentUser.resume = resume;
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedIn', JSON.stringify(currentUser));
  }
  document.getElementById('profile').innerHTML = `
    👤 ${currentUser.name || currentUser.email.split('@')[0]} 
    <button id="logout-btn" onclick="logout()">Вийти</button>
  `;
  alert('Профіль успішно оновлено!');
  closeSettingsModal();
}

function changePassword() {
  const currentPassword = document.getElementById('current-password').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();
  if (newPassword !== confirmPassword) {
    alert('Новий пароль і підтвердження не співпадають!');
    return;
  }
  if (currentPassword !== currentUser.password) {
    alert('Поточний пароль введено невірно!');
    return;
  }
  currentUser.password = newPassword;
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedIn', JSON.stringify(currentUser));
  }
  alert('Пароль успішно змінено!');
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
}

function saveNotifications() {
  const emailNotifications = document.getElementById('email-notifications').checked;
  const newJobsNotifications = document.getElementById('new-jobs-notifications').checked;
  const messagesNotifications = document.getElementById('messages-notifications').checked;
  currentUser.notifications = {
    email: emailNotifications,
    newJobs: newJobsNotifications,
    messages: messagesNotifications
  };
  alert('Налаштування сповіщень збережено!');
}

function addNewJob(event) {
  event.preventDefault();
  const title = document.getElementById('job-title').value.trim();
  const company = document.getElementById('job-company').value.trim();
  const salary = document.getElementById('job-salary').value.trim();
  const location = document.getElementById('job-location').value.trim();
  const type = document.getElementById('job-type').value;
  const experience = document.getElementById('job-experience').value;
  const description = document.getElementById('job-description').value.trim();
  const requirements = document.getElementById('job-requirements').value.trim().split('\n');
  const benefits = document.getElementById('job-benefits').value.trim().split('\n');
  const jobId = 'job-' + Date.now();
  const today = new Date();
  const date = today.toLocaleDateString('uk-UA');
  const newJob = {
    id: jobId,
    title,
    company,
    salary,
    location,
    type,
    experience,
    description,
    requirements,
    benefits,
    date,
    author: currentUser.email
  };
  let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  jobs.push(newJob);
  localStorage.setItem('jobs', JSON.stringify(jobs));
  addJobToDOM(newJob);
  closeAddJobModal();
  alert('Вакансія успішно додана!');
}

function addJobToDOM(job) {
  const container = document.getElementById('user-jobs-container');
  const jobCard = document.createElement('div');
  jobCard.className = 'news-card';
  jobCard.setAttribute('onclick', `openModal('${job.id}')`);
  jobCard.innerHTML = `
    <h3>${job.title} — ${job.salary}</h3>
    <p>${job.company}</p>
    <p>${job.location} | ${job.type} | ${job.experience}</p>
    <div class="date">Опубліковано: ${job.date}</div>
  `;
  container.insertBefore(jobCard, container.firstChild);
  createJobModal(job);
}

function createJobModal(job) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = `newsModal-${job.id}`;
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn" onclick="closeModal('${job.id}')">×</span>
      <h2>${job.title}</h2>
      <div class="job-details">
        <p><strong>Зарплата:</strong> ${job.salary}</p>
        <p><strong>Компанія:</strong> ${job.company}</p>
        <p><strong>Локація:</strong> ${job.location}</p>
        <p><strong>Тип зайнятості:</strong> ${job.type}</p>
        <p><strong>Досвід роботи:</strong> ${job.experience}</p>
        <p><strong>Опубліковано:</strong> ${job.date}</p>
        <div class="requirements">
          <h4>Вимоги:</h4>
          <ul>
            ${job.requirements.map(req => `<li>${req}</li>`).join('')}
          </ul>
        </div>
        <div class="benefits">
          <h4>Умови:</h4>
          <ul>
            ${job.benefits.map(ben => `<li>${ben}</li>`).join('')}
          </ul>
        </div>
        <p><strong>Опис вакансії:</strong></p>
        <p>${job.description}</p>
      </div>
      <button onclick="alert('Резюме успішно відправлено!')">Відправити резюме</button>
      ${job.author === currentUser.email ? `<button class="danger" onclick="deleteJob('${job.id}')">Видалити вакансію</button>` : ''}
    </div>
  `;
  document.body.appendChild(modal);
}

function deleteJob(jobId) {
  if (confirm('Ви впевнені, що хочете видалити цю вакансію?')) {
    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    jobs = jobs.filter(job => job.id !== jobId);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    document.querySelector(`.news-card[onclick="openModal('${jobId}')"]`).remove();
    document.getElementById(`newsModal-${jobId}`).remove();
    alert('Вакансія успішно видалена!');
  }
}

function loadUserJobs() {
  const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  const userJobs = jobs.filter(job => job.author === currentUser.email);
  const container = document.getElementById('user-jobs-container');
  container.innerHTML = '';
  if (userJobs.length > 0) {
    const title = document.createElement('h2');
    title.textContent = 'Мої вакансії';
    container.appendChild(title);
    userJobs.forEach(job => {
      addJobToDOM(job);
    });
  }
}

document.getElementById('authForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const name = document.getElementById('name').value.trim();
  let users = JSON.parse(localStorage.getItem('users')) || [];
  if (isLoginMode) {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      localStorage.setItem('loggedIn', JSON.stringify(found));
      showMain(found);
    } else {
      document.getElementById('message').innerText = '❌ Невірні дані';
    }
  } else {
    if (users.some(u => u.email === email)) {
      document.getElementById('message').innerText = '❌ Користувач з таким email вже існує';
      return;
    }
    const newUser = { 
      email, 
      password, 
      name,
      phone: '',
      bio: '',
      resume: '',
      notifications: {
        email: true,
        newJobs: true,
        messages: true
      }
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedIn', JSON.stringify(newUser));
    showMain(newUser);
  }
});

document.getElementById('addJobForm').addEventListener('submit', addNewJob);

window.onload = () => {
  const user = JSON.parse(localStorage.getItem('loggedIn'));
  if (user) showMain(user);
  const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  jobs.forEach(job => {
    if (!document.getElementById(`newsModal-${job.id}`)) {
      createJobModal(job);
    }
  });
};