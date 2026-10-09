/* ============ KAYAL MART - Login & Registration pages ============ */

document.addEventListener('DOMContentLoaded', function () {

    /* ---------------- Login page ---------------- */
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        if (isLoggedIn()) {
            location.href = '/index.html';
            return;
        }
        const next = new URLSearchParams(location.search).get('next') || '/index.html';

        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const terms = document.getElementById('loginTerms').checked;

            if (!terms) {
                showToast('Please accept the terms and conditions', 'error');
                return;
            }

            btn.disabled = true;
            try {
                const data = await api('/auth/login', {
                    method: 'POST',
                    body: { email: email, password: password, terms: true }
                });
                setAuth(data.token, data.user);
                showToast('Welcome back, ' + (data.user.name || '').split(' ')[0] + '!');
                location.href = next;
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                btn.disabled = false;
            }
        });
    }

    /* ---------------- Registration page ---------------- */
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        if (isLoggedIn()) {
            location.href = '/index.html';
            return;
        }

        const regPassword = document.getElementById('regPassword');
        const strengthBar = document.getElementById('passwordStrengthBar');
        const strengthText = document.getElementById('passwordStrengthText');

        regPassword.addEventListener('input', function () {
            const val = regPassword.value;
            let score = 0;
            if (val.length >= 6) score++;
            if (val.length >= 10) score++;
            if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
            if (/\d/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            const levels = [
                { cls: 'strength-weak', label: 'Weak', width: '25%' },
                { cls: 'strength-fair', label: 'Fair', width: '50%' },
                { cls: 'strength-good', label: 'Good', width: '75%' },
                { cls: 'strength-strong', label: 'Strong', width: '100%' }
            ];

            if (val.length === 0) {
                strengthBar.className = '';
                strengthBar.style.width = '0';
                strengthText.textContent = '';
            } else if (score <= 1) {
                strengthBar.className = 'strength-weak';
                strengthBar.style.width = levels[0].width;
                strengthText.textContent = 'Weak';
            } else if (score === 2) {
                strengthBar.className = 'strength-fair';
                strengthBar.style.width = levels[1].width;
                strengthText.textContent = 'Fair';
            } else if (score === 3 || score === 4) {
                strengthBar.className = 'strength-good';
                strengthBar.style.width = levels[2].width;
                strengthText.textContent = 'Good';
            } else {
                strengthBar.className = 'strength-strong';
                strengthBar.style.width = levels[3].width;
                strengthText.textContent = 'Strong';
            }
        });

        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = regPassword.value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            const phone = document.getElementById('regPhone').value.trim();
            const address = document.getElementById('regAddress').value.trim();

            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }

            btn.disabled = true;
            try {
                const data = await api('/auth/register', {
                    method: 'POST',
                    body: {
                        name: name,
                        email: email,
                        password: password,
                        confirmPassword: confirmPassword,
                        phone: phone,
                        address: address
                    }
                });
                setAuth(data.token, data.user);
                showToast('Account created successfully. Welcome to KAYAL MART!');
                location.href = '/account.html';
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                btn.disabled = false;
            }
        });
    }
});
