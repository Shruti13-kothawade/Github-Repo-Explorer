let darkMode = false;
let currentPage = 1;
let repositoriesPerPage = 10;



async function fetchAndDisplayUser() {
    const username = document.getElementById('username').value;
    const userProfile = document.getElementById('userProfile');
    const repositoryList = document.getElementById('repositoryList');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    // Hide previous error messages
    errorMessage.style.display = 'none';

    // Check if username is provided
    if (!username) {
        errorMessage.innerText = 'Please enter a GitHub username.';
        errorMessage.style.display = 'block';
        return;
    }

    loader.style.display = 'block';

    try {
        // Fetch user profile information without authentication
        const response = await fetch(`https://api.github.com/users/${username}`);

        if (!response.ok) {
            throw new Error('User not found.');
        }

        const userData = await response.json();

        // Display user profile
        // userProfile.innerHTML = `
        //     <div class="mb-4">
        //         <img src="${userData.avatar_url}" alt="Profile Picture" class="img-fluid rounded-circle" style="max-width: 100px;">
        //         <h2>${userData.name || username}</h2>
        //         <p>${userData.bio || ''}</p>
        //         <p>Followers: ${userData.followers || 0} | Following: ${userData.following || 0}</p>
        //     </div>
        // `;
        const userProfileInfo = document.getElementById('userProfileInfo');
userProfileInfo.innerHTML = `
    <div class="mb-4">
        <a href="${userData.html_url}" target="_blank">
            <img src="${userData.avatar_url}" alt="Profile Picture" class="img-fluid rounded-circle" style="max-width: 100px;">
        </a>
        <h2><a href="${userData.html_url}" target="_blank">${userData.name || username}</a></h2>
        <p>${userData.bio || ''}</p>
        <p>Followers: ${userData.followers || 0} | Following: ${userData.following || 0}</p>
    </div>
`;


        // Fetch and display repositories
        await fetchAndDisplayRepositories();

        // Hide loader after data is loaded
        loader.style.display = 'none';
    } catch (error) {
        console.error('Error fetching user profile:', error);
        // Handle error and display an error message
        errorMessage.innerText = error.message || 'Error fetching user profile. Please check the username and try again.';
        errorMessage.style.display = 'block';
        // Hide loader in case of an error
        loader.style.display = 'none';
    }
}

async function fetchAndDisplayRepositories() {
    const username = document.getElementById('username').value;
    const repositoryList = document.getElementById('repositoryList');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    // Hide previous error messages
    errorMessage.style.display = 'none';

    // Check if username is provided
    if (!username) {
        errorMessage.innerText = 'Please enter a GitHub username.';
        errorMessage.style.display = 'block';
        return;
    }

    loader.style.display = 'block';

    try {
        
        // Fetch repositories without authentication
        const response = await fetch(`https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${repositoriesPerPage}`);

        if (!response.ok) {
            throw new Error('User not found or repositories not available.');
        }

        const repositories = await response.json();

        // Clear previous repository list
        repositoryList.innerHTML = '';

        if (repositories.length === 0) {
            // Display a message when no repositories are found
            errorMessage.innerText = 'No repositories found for the given user.';
            errorMessage.style.display = 'block';
        } else {
            // Create a grid layout with two columns
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row';

            repositories.forEach((repo, index) => {
                // Create a box for each repository
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-6 mb-3';

                const listItem = document.createElement('div');
                listItem.className = 'card';
                listItem.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${repo.name}</h5>
                        <p class="card-text">${repo.description || 'No description'}</p>
                        <a href="${repo.html_url}" target="_blank" class="btn btn-primary">View Repo</a>
                        <p class="card-tech">Tech Used: ${repo.language || 'Not specified'}</p>
                    </div>
                `;

                colDiv.appendChild(listItem);
                rowDiv.appendChild(colDiv);

                // Add the row to the repository list every two repositories
                if ((index + 1) % 2 === 0 || (index + 1) === repositories.length) {
                    repositoryList.appendChild(rowDiv);
                }
            });
        }

        // Hide loader after data is loaded
        loader.style.display = 'none';
    } catch (error) {
        console.error('Error fetching repositories:', error);
        // Handle error and display an error message
        errorMessage.innerText = error.message || 'Error fetching repositories. Please check the username and try again.';
        errorMessage.style.display = 'block';
        // Hide loader in case of an error
        loader.style.display = 'none';
    }
    // Add this function at the end of your script.js file
function updateRepositoriesPerPage() {
    repositoriesPerPage = parseInt(document.getElementById('reposPerPage').value);
    fetchAndDisplayRepositories();
}

// Update the fetch call in fetchAndDisplayRepositories function
const response = await fetch(`https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${repositoriesPerPage}`);

}

// Pagination function to go to the next page
function nextPage() {
    currentPage++;
    fetchAndDisplayRepositories();
}

// Pagination function to go to the previous page
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchAndDisplayRepositories();
    }
}

// Add the following function for handling Enter key press
function handleKeyPress(event) {
    if (event.keyCode === 13) {
        fetchAndDisplayUser();
    }
}

// Function to update page navigation
function updatePageNavigation(linkHeader) {
    const pagination = document.querySelector('.pagination');
    
    if (!linkHeader) {
        pagination.style.display = 'none'; // Hide pagination if there's only one page
        return;
    }

    pagination.style.display = 'block'; // Show pagination

    const links = linkHeader.split(', ');
    const pageInfo = links.reduce((info, link) => {
        const [url, rel] = link.split('; ');
        const page = parseInt(url.match(/page=(\d+)/)[1]);
        info[rel.includes('next') ? 'next' : 'prev'] = page;
        return info;
    }, {});

    const prevButton = pagination.querySelector('.page-link[aria-label="Previous"]');
    const nextButton = pagination.querySelector('.page-link[aria-label="Next"]');

    if (pageInfo.prev) {
        prevButton.disabled = false;
        prevButton.onclick = () => changePage(pageInfo.prev);
    } else {
        prevButton.disabled = true;
        prevButton.onclick = null;
    }

    if (pageInfo.next) {
        nextButton.disabled = false;
        nextButton.onclick = () => changePage(pageInfo.next);
    } else {
        nextButton.disabled = true;
        nextButton.onclick = null;
    }
    const totalPages = pageInfo.next - 1;
    const pageList = document.getElementById('pageList');
    pageList.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item';
        pageItem.innerHTML = `<button class="page-link" onclick="changePage(${i})">${i}</button>`;
        pageList.appendChild(pageItem);
    }
}

// Function to change the current page
function changePage(newPage) {
    currentPage = newPage;
    fetchAndDisplayRepositories();
}


function updatePageNavigation(linkHeader) {
    const pagination = document.querySelector('.pagination');
    const pageNumbersContainer = document.getElementById('pageNumbers');

    if (!linkHeader) {
        pagination.style.display = 'none'; // Hide pagination if there's only one page
        return;
    }

    pagination.style.display = 'block'; // Show pagination

    const links = linkHeader.split(', ');
    const pageInfo = links.reduce((info, link) => {
        const [url, rel] = link.split('; ');
        const page = parseInt(url.match(/page=(\d+)/)[1]);
        info[rel.includes('next') ? 'next' : 'prev'] = page;
        return info;
    }, {});

    const prevButton = pagination.querySelector('.page-link[aria-label="Previous"]');
    const nextButton = pagination.querySelector('.page-link[aria-label="Next"]');
    // const pageList = pagination.querySelector('.page-list');
    // Create and update the page number list
    // Create and update the page number list

    // const totalPages = Math.ceil(pageInfo.next / repositoriesPerPage);
    // pageNumbersContainer.innerHTML = '';


    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item';
        pageItem.innerHTML = `<button class="page-link" onclick="changePage(${i})">${i}</button>`;
        pageNumbersContainer.appendChild(pageItem);
    }

    if (pageInfo.prev) {
        prevButton.disabled = false;
        prevButton.onclick = () => changePage(pageInfo.prev);
    } else {
        prevButton.disabled = true;
        prevButton.onclick = null;
    }

    if (pageInfo.next) {
        nextButton.disabled = false;
        nextButton.onclick = () => changePage(pageInfo.next);
    } else {
        nextButton.disabled = true;
        nextButton.onclick = null;
    }

    // Create and update the page number list
    const totalPages = pageInfo.next - 1;
    pageList.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item';
        pageItem.innerHTML = `<button class="page-link" onclick="changePage(${i})">${i}</button>`;
        pageList.appendChild(pageItem);
    }
}
// function updateRepositoriesPerPage() {
//     const selectElement = document.getElementById('repositoriesPerPage');
//     repositoriesPerPage = parseInt(selectElement.value, 10);
//     currentPage = 1; // Reset to the first page when changing repositories per page
//     fetchAndDisplayRepositories();
// }
function searchRepositories() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase();
    const repositoryList = document.getElementById('repositoryList');

    const repositories = Array.from(repositoryList.getElementsByClassName('card'));

    repositories.forEach((repo) => {
        const repoName = repo.querySelector('.card-title').innerText.toLowerCase();
        const repoDescription = repo.querySelector('.card-text').innerText.toLowerCase();

        if (repoName.includes(filter) || repoDescription.includes(filter)) {
            repo.style.display = '';
        } else {
            repo.style.display = 'none';
        }
    });
}
