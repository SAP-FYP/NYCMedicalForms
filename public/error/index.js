window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const actionBtn = document.getElementById('action-button');
    let code = params.get('code')
    let errMessage, errText;

    const url = window.location.search;
    const searchParams = new URLSearchParams(url);
    const type = searchParams.get("type");

    const actionBtnHandler = (text, display) => {
        actionBtn.textContent = text;
        actionBtn.style.display = display;

        actionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (code == 401) {
                type ? window.location.replace(`/${type}/login`) : window.location.replace(`/login`);
            } else {
                history.back();
            }
        })
    }

    if (code == 404) {
        errMessage = 'Resource Not Found'
        errText = 'Oops! The requested resource could not be found. Please check the URL and try again.'
        actionBtnHandler('', 'none');
    } else if (code == 401) {
        errMessage = 'Unauthorized Access'
        errText = 'You are unauthorized or may have expired access the requested resource. Please re-login and try again.'
        actionBtnHandler('Login', 'block');
    } else if (code == 403) {
        errMessage = 'Access Forbidden'
        errText = 'Access to the requested resource is forbidden. You do not have the necessary permissions to access this page.'
        actionBtnHandler('Go back', 'block');
    } else {
        code = 500
        errMessage = 'Internal Server Error'
        errText = 'An internal server error occurred. Our team has been notified of the issue. Please try again later.'
        actionBtnHandler('Go back', 'block');
    }

    document.getElementById('err-message').textContent = errMessage;
    document.getElementById('err-text').textContent = errText;
    document.getElementById('err-code').textContent = code;
})