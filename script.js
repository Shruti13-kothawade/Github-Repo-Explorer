let darkMode = false;
let currentPage = 1;
let repositoriesPerPage = 10;
let historyStack = []; // Stack to track previous states

// Fetch and display user data
async function fetchAndDisplayUser() {
    const username = document.getElementById('username').value;
    const userProfile = document.getElementById('userProfile');
    const repositoryList = document.getElementById('repositoryList');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    errorMessage.style.display = 'none';
    if (!username) {
        errorMessage.innerText = 'Please enter a GitHub username';
        errorMessage.style.display = 'block';
        return;
    }

    loader.style.display = 'block';
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) throw new Error('User not found');
        const userData = await response.json();

        document.getElementById('userProfileInfo').innerHTML = `
            <div class="d-flex align-items-center">
                <a href="${userData.html_url}" target="_blank">
                    <img src="${userData.avatar_url}" alt="Profile Picture" class="rounded-circle mr-3" style="width: 64px; height: 64px;">
                </a>
                <div>
                    <h2 class="h4 mb-1"><a href="${userData.html_url}" target="_blank" class="text-dark">${userData.name || username}</a></h2>
                    <p class="text-muted mb-0">${userData.bio || 'No bio available'}</p>
                    <p class="text-muted small">Followers: ${userData.followers} · Following: ${userData.following}</p>
                </div>
            </div>
        `;

        // Push current state to history
        historyStack.push({ username, page: currentPage });
        await fetchAndDisplayRepositories();
        loader.style.display = 'none';
    } catch (error) {
        errorMessage.innerText = error.message;
        errorMessage.style.display = 'block';
        loader.style.display = 'none';
    }
}

// Fetch and display repositories
async function fetchAndDisplayRepositories() {
    const username = document.getElementById('username').value;
    const repositoryList = document.getElementById('repositoryList');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    errorMessage.style.display = 'none';
    if (!username) return;

    loader.style.display = 'block';
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${repositoriesPerPage}`);
        if (!response.ok) throw new Error('Repositories not available');
        const repositories = await response.json();

        repositoryList.innerHTML = '';
        if (repositories.length === 0) {
            errorMessage.innerText = 'No repositories found';
            errorMessage.style.display = 'block';
        } else {
            repositories.forEach(repo => {
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-6 mb-3';
                colDiv.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title"><a href="${repo.html_url}" target="_blank" class="text-dark">${repo.name}</a></h5>
                            <p class="card-text">${repo.description || 'No description'}</p>
                            <p class="card-tech">${repo.language ? `<span class="badge badge-primary">${repo.language}</span>` : 'No language specified'}</p>
                        </div>
                    </div>
                `;
                repositoryList.appendChild(colDiv);
            });
        }
        updatePageNavigation(response.headers.get('Link'));
        loader.style.display = 'none';
    } catch (error) {
        errorMessage.innerText = error.message;
        errorMessage.style.display = 'block';
        loader.style.display = 'none';
    }
}

// Update repositories per page
function updateRepositoriesPerPage() {
    repositoriesPerPage = parseInt(document.getElementById('reposPerPage').value);
    currentPage = 1;
    fetchAndDisplayRepositories();
}

// Pagination
function nextPage() {
    currentPage++;
    fetchAndDisplayRepositories();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchAndDisplayRepositories();
    }
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.keyCode === 13) fetchAndDisplayUser();
}

// Search repositories locally
function searchRepositories() {
    const filter = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('#repositoryList .card');
    cards.forEach(card => {
        const name = card.querySelector('.card-title').textContent.toLowerCase();
        const desc = card.querySelector('.card-text').textContent.toLowerCase();
        card.parentElement.style.display = (name.includes(filter) || desc.includes(filter)) ? '' : 'none';
    });
}

// Update pagination
function updatePageNavigation(linkHeader) {
    const pagination = document.querySelector('.pagination');
    const pageNumbers = document.getElementById('pageNumbers');
    if (!linkHeader) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    const links = linkHeader.split(', ').reduce((acc, link) => {
        const [url, rel] = link.split('; ');
        const page = parseInt(url.match(/page=(\d+)/)[1]);
        acc[rel.includes('next') ? 'next' : 'prev'] = page;
        return acc;
    }, {});

    const prevButton = pagination.querySelector('[aria-label="Previous"]');
    const nextButton = pagination.querySelector('[aria-label="Next"]');
    prevButton.disabled = !links.prev;
    nextButton.disabled = !links.next;
    prevButton.onclick = links.prev ? () => changePage(links.prev) : null;
    nextButton.onclick = links.next ? () => changePage(links.next) : null;

    const totalPages = links.next ? links.next - 1 : currentPage;
    pageNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === currentPage ? ' active' : '');
        li.innerHTML = `<button class="page-link" onclick="changePage(${i})">${i}</button>`;
        pageNumbers.appendChild(li);
    }
}

function changePage(newPage) {
    currentPage = newPage;
    fetchAndDisplayRepositories();
}

// Go back to previous state
function goBack() {
    if (historyStack.length > 1) {
        historyStack.pop(); // Remove current state
        const prevState = historyStack[historyStack.length - 1];
        document.getElementById('username').value = prevState.username;
        currentPage = prevState.page;
        fetchAndDisplayUser();
    }
}

// Initialize navbar functionalities
document.addEventListener('DOMContentLoaded', () => {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkMode = !darkMode;
        darkModeToggle.innerHTML = darkMode
            ? '<i class="fas fa-sun mr-1"></i> Light Mode'
            : '<i class="fas fa-moon mr-1"></i> Dark Mode';
    });

    // Back button
    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', goBack);
});
