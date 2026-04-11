// DOM elements
const togglePassword = document.querySelector('#togglePassword');
const passwordInput = document.querySelector('#password');
let inputs = document.querySelectorAll('input')
let body = document.querySelector('body');
let submitBtn = document.querySelector('.submit-btn');
const eyeIcon = document.querySelector('#eyeIcon');
let errorText = document.querySelector('#errorText');

const storedUser = JSON.parse(localStorage.getItem('UserManagement-loginedUser'))
if (storedUser) {
    window.location.href = '../dashboard/dashboard.html'
}

// Password visibility toggle
togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    if (type === 'text') {
        this.style.color = 'var(--primary-color)';

    } else {
        this.style.color = 'var(--text-light)';
    }
});


// Error handling function
function throwError(error) {
        console.log("ERROR TRIGGERED:", error); // 👈 debug
    errorText.style.display = 'block'
    errorText.innerText = error
    setTimeout(() => {
        errorText.style.display = 'none'
        errorText.innerText = ''
    }, 2500)
}


try{

    flatpickr("#dob");

  console.log(document.querySelector("#dob"));
console.log(window.flatpickr);

}
catch(error){
    console.error("Error initializing flatpickr:", error);
}


// Handle form submission on Enter key press
body.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        submitBtn.click()
        submitBtn.disabled = true
        submitBtn.style.opacity = '0.7'
        setTimeout(() => {
            submitBtn.style.opacity = '1'

            submitBtn.disabled = false

        }, 1500)
    }
})


// Handle form submission based on button text
if (submitBtn.innerText === 'Signup') {
    submitBtn.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent form submission
        handleSignup()
    });
}
if (submitBtn.innerText === 'Login') {
    submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        handleLogin()
    });
}

// Signup handler
async function handleSignup() {
    console.log('Signup working');
    let [fullName, email, DOB, password] = inputs

    const age = calculateAge(DOB)
    console.log(age);

    // Validate data before proceeding
    if (!checkData(fullName, email, age, password,)) {
        return
    }

    // Creating User
    await createUser(fullName.value, email.value, age, password.value)
}

// Function to create user (simulate API call)
async function createUser(fullName, email, age, password) {

    try {
        const addUserApi = await fetch('https://usermanagementsystem-backend-production.up.railway.app/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, email, age, password })
        })

        const addUserResponse = await addUserApi.json()
        console.log(addUserResponse);

   if (!addUserApi.ok || !addUserResponse.status) {
    throwError(addUserResponse.message || 'Signup failed');
    return;
}
        console.log('Redirecting now...');
        window.location.href = '../dashboard/dashboard.html'
    }
    catch (error) {
        console.error('Error creating user:', error);
        throwError('Failed to create user. Please try again later' + error.message)
        return
    }


    console.log('Creating user:', { fullName, email, password });
    // For demonstration, we'll just log it to the console
}

// Login handler
function handleLogin(event) {
    console.log('Login working');
    let [email, password] = inputs
    if (!email.value.trim() || !password.value.trim()) {
        throwError('All fields are required')
        return
    }
    // Validate data before proceeding
    console.log('user checked, logging in...');
    loginUser(email.value, password.value)

}

// Function to login user (simulate API call)
async function loginUser(email, password) {
    try {
        const loginUserApi = await fetch('https://usermanagementsystem-backend-production.up.railway.app/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })

        const loginUserResponse = await loginUserApi.json()
        console.log(loginUserResponse);

        // ✅ check success
     if (!loginUserApi.ok || !loginUserResponse.status) {
    throwError(loginUserResponse.message || 'Login failed');
    return;
    
}
         localStorage.setItem('UserManagement-loginedUser', JSON.stringify(loginUserResponse.data))
        console.log('Redirecting now...');
        window.location.href = '../dashboard/dashboard.html'

    }
     catch (error) {
        throwError('Login failed. Please try again later' + error.message)
    }

}


// Data validation function
function checkData(fullName, email, age, password) {

    const nameVal = fullName.value.trim()
    const emailVal = email.value.trim()
    const passVal = password.value.trim()
    console.log(nameVal, passVal, emailVal, age);


    // 1. Empty fields
    if (!nameVal || !emailVal || !age || !passVal) {
        throwError('All fields are required')
        return false
    }

    // 2. Name validation
    if (nameVal.length < 3) {
        throwError('Name must be at least 3 characters')
        return false
    }

    // 3. Email validation (basic regex)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(emailVal)) {
        throwError('Invalid email format')
        return false
    }

    // 4. Age validation
    if (age < 13) {
        throwError('You must be at least 13 years old')
        return false
    }

    // 5. Password validation
    if (passVal.length < 8) {
        throwError('Password must be at least 8 characters')
        return false
    }


    return true
}

// Function to calculte age from DOB 
function calculateAge(DOB) {

    const today = new Date();

    const [day, month, year] = DOB.value.split('/');

    const birthDate = new Date(year, month - 1, day);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }
    return age;
}
