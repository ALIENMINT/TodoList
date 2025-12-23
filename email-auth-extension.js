import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// 注入邮箱登录 UI
const injectEmailUI = () => {
    const loginBox = document.querySelector('#login-screen .bg-white');
    if (!loginBox) return;

    const emailSection = document.createElement('div');
    emailSection.className = "mt-8 pt-8 border-t border-slate-100 text-left";
    emailSection.innerHTML = `
        <div class="space-y-3">
            <input type="email" id="auth-email" placeholder="邮箱地址" class="w-full p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-blue-500">
            <input type="password" id="auth-password" placeholder="密码 (至少6位)" class="w-full p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-blue-500">
        </div>
        <div class="flex gap-2 mt-4">
            <button id="btn-login" class="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm">登录</button>
            <button id="btn-register" class="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm">注册</button>
        </div>
    `;
    loginBox.appendChild(emailSection);

    // 绑定事件
    document.getElementById('btn-register').onclick = handleRegister;
    document.getElementById('btn-login').onclick = handleLogin;
};

// 注册逻辑
async function handleRegister() {
    const auth = getAuth();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        alert("注册成功！已向您的邮箱发送验证邮件，请查收后登录。");
    } catch (error) {
        alert("注册失败: " + error.message);
    }
}

// 登录逻辑
async function handleLogin() {
    const auth = getAuth();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            alert("请先前往邮箱验证您的账户。");
            return;
        }
        // 登录成功后，HTML 主程序里的 onAuthStateChanged 会自动处理跳转
    } catch (error) {
        alert("登录失败: " + error.message);
    }
}

// 执行注入
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectEmailUI);
} else {
    injectEmailUI();
}
