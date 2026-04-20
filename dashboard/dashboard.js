import { uploadImg } from '../cloudinary.js';
let logoutBtn = document.querySelector('#logoutBtn')
let userTableBody = document.querySelector('#userTableBody')
let body = document.querySelector('body')
const modal = document.getElementById('editModal');
const profileInput = document.getElementById('profilePic');
let deleteModal = document.getElementById('deleteModal')
let closeDeleteModal = document.querySelector('.closeDeleteModal')
closeDeleteModal.addEventListener('click', closeDeleteModalFunc)
let closeEditModal = document.querySelectorAll('.closeEditModal')
let deleteBtn = document.querySelector('#confirmDeleteBtn')
let searchUser = document.querySelector('#userSearch')
let filters = document.querySelectorAll('select')

closeEditModal.forEach(e => {
    e.addEventListener('click', closeModal)
})
const profileImg = document.getElementById('profileImg');


function showToast(message, type = 'error') {
    // 1. Check if container exists, if not, create it
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // 2. Create the toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // 3. Remove logic
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

let currentUser;
let currentUserToken = JSON.parse(localStorage.getItem('UserManagement-loginedUser'));
let currentUserId = null; // 🔥 important fix

console.log(currentUserToken);

async function getCurrentUser() {
    if (!currentUserToken) return null;

    const res = await fetch('https://user-management-system-backend-mu.vercel.app/api/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': currentUserToken
        }
    });

    const data = await res.json();
    currentUser = data.data;

    if (currentUser) currentUserId = currentUser._id;

    return currentUser;
}

const loginTime = sessionStorage.getItem("loginTime");

if (loginTime) {
    showToast("Welcome back!", 'success');
    sessionStorage.removeItem("loginTime");
}

// Fetch users from API and populate the table
async function fetchUsers() {
    try {
        // 🔹 Get filter values
        const search = document.getElementById("userSearch").value;
        const limit = document.getElementById("limitFilter").value;
        const sort = document.getElementById("sortOrder").value;

        // 🔹 Build API URL
        let url = `https://user-management-system-backend-mu.vercel.app/api/users/all?`;
        if (search) url += `search=${search}&`;
        if (limit) url += `limit=${limit}&`;
        if (sort) url += `sort=${sort}&`;

        // 🔹 Fetch users + current user
        const [usersRes, currentUserData] = await Promise.all([
            fetch(url),
            getCurrentUser()
        ]);

        const users = await usersRes.json();

        // 🔹 Auth check
        if (!currentUserData) {
            localStorage.removeItem('UserManagement-loginedUser');
            window.location.href = '../auth/login.html';
            return;
        }

        // 🔹 Clear table
        userTableBody.innerHTML = "";

        // 🔹 Render users
        users.data.forEach(user => {

            let joinedDate = handleDate(user);

            let isCurrentUser = currentUserId === user._id;

            userTableBody.innerHTML += `
            <tr ${isCurrentUser ? 'class="current-user-row"' : ''}>
                <td data-label="Member">
                    <div class="user-info">
                        <div class="avatar ${isCurrentUser ? 'my-avatar' : ''}">
                            ${
                                user.profilePic && user.profilePic.trim() !== ""
                                ? `<img src="${user.profilePic}" />`
                                : `<img src="../defaultuser.png" />`
                            }
                        </div>
                        <div class="user-details">
                        <p class="user-name">
                            ${user.fullName}
                            ${isCurrentUser ? '<span class="me-badge">(You)</span>' : ''}
                        </p>
                        </div>
                    </div>
                </td>

                <td data-label="Email Address">${user.email}</td>
                <td data-label="Joined Date">${joinedDate}</td>
                <td data-label="Age">${user.age}</td>

                <td data-label="Phone">
                    ${user.phone ? `+${user.phone}` : '-'}
                </td>

                <td data-label="Actions" class="text-right">
                    <div class="action-btns">
                        <button class="icon-btn edit ${!isCurrentUser ? 'disabled' : ''}">Edit</button>
                        <button class="icon-btn delete ${!isCurrentUser ? 'disabled' : ''}">Delete</button>
                    </div>
                </td>
            </tr>`;
        });


        userTableBody.addEventListener('click', (e) => {
            console.log(e.target.classList);

            if (e.target.classList.contains('edit') && !e.target.classList.contains('disabled')) {
                openModal()
            }
            if (e.target.classList.contains('delete') && !e.target.classList.contains('disabled')) {
                openDeleteModalFunc()
            }
        })


    } catch (error) {
        showToast('Error fetching users:' + error.message, 'error');
        userTableBody.innerHTML = '<tr><td colspan="4">Failed to load users. Please try again later.</td></tr>';
    }
}

fetchUsers()

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('UserManagement-loginedUser')
    window.location.href = '../auth/login.html'
})

const storedUser = JSON.parse(localStorage.getItem('UserManagement-loginedUser'))
if (!storedUser) {
    window.location.href = '../auth/login.html'
}




function handleDate(user) {
    let date = user.createdAt.split('T')[0];
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let splitDate = date.split('-')
    return `${splitDate[2]} ${months[splitDate[1] - 1]} ${splitDate[0]}`
}



// Open Modal
function openModal() {
    modal.style.display = 'flex';
}

// Close Modal
function closeModal() {
    modal.style.display = 'none';
}

function openDeleteModalFunc() {
    deleteModal.style.display = 'flex';
}

function closeDeleteModalFunc() {
    deleteModal.style.display = 'none';
}

// Image Preview Logic
profileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            profileImg.setAttribute('src', e.target.result);
        }
        reader.readAsDataURL(file);
    }
});



const updateProfileForm = document.getElementById('updateProfileForm');

updateProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Show a loading state on the button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Uploading...";
    submitBtn.disabled = true;

    try {
        const fileInput = document.getElementById('profilePic');
        let profilePicUrl = document.getElementById('profileImg').src; // Default to existing

        // 2. Only upload to Cloudinary if a new file was selected
        if (fileInput.files[0]) {
            profilePicUrl = await uploadImg(fileInput.files[0]);
        }
        console.log(currentUser.fullName);

        // 3. Collect all form data
        const updatedData = {
            fullName: document.getElementById('fullName').value || currentUser.fullName,
            age: Number(document.getElementById('age').value) || currentUser.age,
            phone: document.getElementById('phone').value.split(' ').join('') ?? currentUser.phone ?? '',
            profilePic: profilePicUrl ?? currentUser.profilePic ?? ''
        };
        console.log(updatedData);


        // 4. Send the data to your Node.js Backend
        const response = await fetch('https://user-management-system-backend-mu.vercel.app/api/users', {
            method: 'PUT', // Use PATCH for partial updates
            headers: {
                'Content-Type': 'application/json',
                // Add your Auth Token here if you're using JWT
                'Authorization': currentUserToken
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            showToast('Failed to update profile', 'error')
            return
        }
        showToast('Profile Updated successfully', 'success')
        setTimeout(() => {
            location.reload()
        }, 1000)

    } catch (error) {
        console.error("Update Error:", error);
        showToast("Something went wrong during the update.", 'error');
    } finally {
        // 5. Reset button state
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
});

deleteBtn.addEventListener('click', deleteUser)

async function deleteUser() {
    const deleteApi = await fetch('https://user-management-system-backend-mu.vercel.app/api/users', {
        method: 'DELETE', // Use PATCH for partial updates
        headers: {
            'Content-Type': 'application/json',
            // Add your Auth Token here if you're using JWT
            'Authorization': currentUserToken
        },
    });
    const deleteResponse = await deleteApi.json()
    if (!deleteResponse.ok) {
        showToast('Failed to delete user', 'error')
        return
    }
    showToast('Account Deleted Successfully')
    setTimeout(() => {
        location.reload()
    }, 1000)
}


// 🔍 Search (debounced)
let timeout;
searchUser.addEventListener('keyup', () => {
    clearTimeout(timeout);
    timeout = setTimeout(fetchUsers, 400);
});

// 🎯 Filters
filters.forEach(select => {
    select.addEventListener("change", fetchUsers);
});