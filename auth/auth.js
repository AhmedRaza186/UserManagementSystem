// DOM elements
const togglePassword = document.querySelector('#togglePassword');
const passwordInput = document.querySelector('#password');
let inputs = document.querySelectorAll('.signup-container input')
let body = document.querySelector('body');
let formsubmitBtn = document.querySelector('#form-submit');
const eyeIcon = document.querySelector('#eyeIcon');
let errorText = document.querySelector('#errorText');
let signupContainer = document.querySelector('.signup-container')
let otpContainer = document.querySelector('.otp-section')
let otpSubmitBtn = document.querySelector('#otp-submit')
let otpInputs = document.querySelectorAll('.otp-input-wrapper input')


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


try {
    flatpickr("#dob", {
        dateFormat: "d/m/Y"
    });
    console.log(document.querySelector("#dob"));
    console.log(window.flatpickr);

}
catch (error) {
    console.error("Error initializing flatpickr:", error);
}


// Handle form submission on Enter key press
body.addEventListener('keydown', (e) => {
    if (e.key == 'Enter' && signupContainer.style.display != 'none') {
        formsubmitBtn.click()
        formsubmitBtn.disabled = true
        formsubmitBtn.style.opacity = '0.7'
        setTimeout(() => {
            formsubmitBtn.style.opacity = '1'

            formsubmitBtn.disabled = false

        }, 1500)
    }
    if (e.key == 'Enter' && otpContainer.style.display != 'none') {
        otpSubmitBtn.click()
        otpSubmitBtn.disabled = true
        otpSubmitBtn.style.opacity = '0.7'
        setTimeout(() => {
            otpSubmitBtn.style.opacity = '1'

            otpSubmitBtn.disabled = false

        }, 1500)
    }
})


// Handle form submission based on button text
if (formsubmitBtn.innerText === 'Signup') {
    formsubmitBtn.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent form submission
        handleSignup()
    });
}
if (formsubmitBtn.innerText === 'Login') {
    formsubmitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        handleLogin()
    });
}

// Signup handler
async function handleSignup() {
    console.log('Signup working');
    let [fullName, email, DOB, password] = inputs
    console.log(DOB);

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
        const addUserApi = await fetch('http://localhost:8000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, email, age, password })
        })

        const addUserResponse = await addUserApi.json()
        console.log(addUserResponse);

        if (!addUserApi.ok || !addUserResponse.status) {
            showToast(addUserResponse.message || 'Signup failed', "error")
            return;
        }
        showToast('User Created Successfully...\n Now verify your email', "success")
        setTimeout(() => {
            otpPageHandler(email)
        }, 1500);

        // console.log('Redirecting now...');
        // window.location.href = '../dashboard/dashboard.html'
    }
    catch (error) {
        console.error('Error creating user:', error);
        showToast('Failed to create user. Please try again later' + error.message, "error")
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
        const loginUserApi = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })

        const loginUserResponse = await loginUserApi.json()
        console.log(loginUserResponse);

        if (!loginUserApi.ok || !loginUserResponse.status) {
            if (loginUserResponse.message === 'Please verify your email first') {
                showToast('Please verify your email first', 'error')
                setTimeout(() => {
                    otpPageHandler(email)
                }, 1500);
                return;
            }


            showToast(loginUserResponse.message, 'error');
            return;
        }
        localStorage.setItem('UserManagement-loginedUser', JSON.stringify(loginUserResponse.token))
        showToast('Logging you in...', 'success');
        sessionStorage.setItem("loginTime", Date.now());
        setTimeout(() => {
            window.location.href = '../dashboard/dashboard.html'
        }, 1500);


    }
    catch (error) {
        showToast('Login failed. Please try again later' + error.message, 'error')
    }

}

// Otp verification handler (simulate API call)
async function verifyOtp(email) {
    console.log('click hua');
    let otp = []
    otpInputs.forEach(input => {
        otp.push(input.value)
    });
    otp = +(otp.join(''))

    try {
        let otpVerificationApi = await fetch('http://localhost:8000/api/auth/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, otp: otp })
        })

        const otpVerificationResponse = await otpVerificationApi.json()
        console.log(otpVerificationResponse);

        // ✅ check success
        if (!otpVerificationApi.ok || !otpVerificationResponse.status) {
            showToast(otpVerificationResponse.message || 'OTP verification failed', 'error');
            return;

        }
        showToast('Account verified successfully \n Now Login', 'success');

        setTimeout(() => {
            window.location.href = './login.html';
        }, 1200);


    }
    catch (error) {
        showToast('OTP verification failed. Please try again later' + error.message, 'error')
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
    console.log(age);

    return age;
}

function otpPageHandler(email) {
    signupContainer.style.display = 'none'
    otpContainer.style.display = 'block'


    otpInputs.forEach((input, index) => {
        input.addEventListener("paste", (e) => {
            const pasteData = e.clipboardData.getData("text").split("");

            otpInputs.forEach((inp, i) => {
                inp.value = pasteData[i] || "";
            });

            otpInputs[otpInputs.length - 1].focus();
            e.preventDefault();
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !input.value) {
                if (otpInputs[index - 1]) {
                    otpInputs[index - 1].focus();
                }
            }

            input.addEventListener("input", (e) => {
                input.value = input.value.replace(/[^0-9]/g, '');

            });
            input.addEventListener("input", (e) => {
                if (e.target.value.length === 1) {
                    // move to next input
                    if (otpInputs[index + 1]) {
                        otpInputs[index + 1].focus();
                    }
                    checkAllFilled(otpInputs)
                }
            });

        });

    });

    function checkAllFilled(inputs) {
        let allFilled = true;

        inputs.forEach(input => {
            if (input.value.trim() === "") {
                allFilled = false;
            }
        });

        if (allFilled) {
            setTimeout(() => {
                otpSubmitBtn.click(); // 🔥 auto click
            }, 1000)
        }
    }

    otpSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault()
        verifyOtp(email)
    })
}