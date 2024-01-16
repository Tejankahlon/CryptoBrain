document.addEventListener('DOMContentLoaded', function() {
    // Handle Login Form Submission
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            submitForm('login');
        });
    }

    // Handle Registration Form Submission
    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            submitForm('register');
        });
    }
});

function submitForm(formType) {
    var form = formType === 'login' ? loginForm : registerForm;
    var url = formType === 'login' ? '/process-login' : '/process-register';
    var formData = new FormData(form);

    axios({
        method: 'post',
        url: url,
        data: formData,
        // headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(function(response) {
        if (response.data.success) {
            window.location.href = 'http://localhost:3000/home';
        } else {
            alert('Error: ' + (response.data.error || 'Invalid credentials'));
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
    });
}
