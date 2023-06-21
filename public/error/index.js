window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    let code = params.get('code')
    let errMessage, errText;

    if (code == 404) {
        errMessage = 'Resource Not Found'
        errText = 'Oops! The requested resource could not be found. Please check the URL and try again.'
    } else if (code == 401) {
        errMessage = 'Unauthorized Access'
        errText = 'You are unauthorized or may have expired access the requested resource. Please re-login and try again.'
    } else if (code == 403) {
        errMessage = 'Access Forbidden'
        errText = 'Access to the requested resource is forbidden. You do not have the necessary permissions to access this page.'
    } else {
        code = 500
        errMessage = 'Internal Server Error'
        errText = 'An internal server error occurred. Our team has been notified of the issue. Please try again later.'
    }

    document.getElementById('err-message').textContent = errMessage;
    document.getElementById('err-text').textContent = errText;
    document.getElementById('err-code').textContent = code;
})