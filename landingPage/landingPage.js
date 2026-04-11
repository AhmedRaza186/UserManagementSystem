let logoutBtn = document.querySelector('#logoutBtn')
let userTableBody = document.querySelector('#userTableBody')

// Fetch users from API and populate the table
async function fetchUsers() {
    try {
        const fetchUsersApi = await fetch('https://usermanagementsystem-backend.railway.internal/api/users/all')
        let users = await fetchUsersApi.json()
        console.log(users.data);
        let usersTable = users.data.map(user => {
            let avatar = handleUserAvatar(user)
            console.log(avatar);

            let joinedDate = handleDate(user)

            let currentUserCard = false
            if (user._id === JSON.parse(localStorage.getItem('UserManagement-loginedUser'))._id) {
                currentUserCard = true
                console.log('Current user found:', user.fullName);
            }

            userTableBody.innerHTML += ` <tr ${currentUserCard ? 'class="current-user"' : ''}>
                        <td data-label="Member">
                            <div class="user-info">
                                <div class="avatar ${currentUserCard ? 'my-avatar' : ''} " >${avatar.join('')}</div>
                                <p class="user-name">${user.fullName} <span ${currentUserCard ? 'class="me-badge"' : ''} >${currentUserCard ? '(You)' : ''}</span></p>
                            </div>
                        </td>
                        <td data-label="Email Address">${user.email}</td>
                        <td data-label="Joined Date">${joinedDate}</td>
                        <td data-label="Age">${user.age}</td>
                        <td data-label="Actions" class="text-right">
                            <div class="action-btns">
                                <button class="icon-btn edit ${!currentUserCard ? 'disabled' : ''}">Edit</button>
                                <button class="icon-btn delete ${!currentUserCard ? 'disabled' : ''}">Delete</button>
                            </div>
                        </td>
                    </tr>`
        })


    } catch (error) {
        console.error('Error fetching users:', error);
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


function handleUserAvatar(user) {
            let avatar = []
            let splitFullName = user.fullName.split(' ')
            console.log(splitFullName);
            splitFullName.forEach(e => {
                console.log(e);
                avatar.push(e[0].toUpperCase())

            });
            return avatar
}

function handleDate(user){
    let date = user.createdAt.split('T')[0];
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let splitDate = date.split('-')
    return `${splitDate[2]} ${months[splitDate[1] - 1]} ${splitDate[0]}`
}
