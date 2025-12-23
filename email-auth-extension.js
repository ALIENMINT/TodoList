import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// 1. 初始化：在主界面注入一个“邮箱登录”入口按钮
const initEmailEntry = () => {
    const loginBox = document.querySelector('#login-screen .bg-white');
    if (!loginBox) return;

    // 创建一个邮箱入口按钮，样式模仿原有的 Google 登录
    const entryBtn = document.createElement('button');
    entryBtn.id = 'email-entry-btn';
    entryBtn.className = "w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold mt-4 flex items-center justify-center gap-2 border border-slate-200 transition-all active:scale-95";
    entryBtn.innerHTML = `<i class="fas fa-envelope"></i> 邮箱账号登录`;
    
    entryBtn.onclick = () => showEmailForm(loginBox);
    loginBox.appendChild(entryBtn);
};

// 2. 切换界面：点击后清空原有按钮，显示邮箱表单
const showEmailForm = (container) => {
    // 备份原有内容，以便用户想点“返回”
    const originalContent = container.innerHTML;

    container.innerHTML = `
        <div class="text-left animate-in fade-in duration-300">
            <button id="auth-back" class="text-slate-400 mb-6 flex items-center gap-1 text-sm font-bold">
                <i class="fas fa-arrow-left"></i> 返回
            </button>
            <h3 class="text-xl font-bold mb-6 text-slate-800">邮箱登录 / 注册</h3>
            
            <div class="space-y-4">
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
                    <input type="email" id="auth-email" placeholder="example@mail.com" 
                        class="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition-all">
                </div>
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Password</label>
                    <input type="password" id="auth-password" placeholder="至少6位密码" 
                        class="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition-all">
                </div>
            </div>

            <button id="btn-login" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold mt-8 shadow-lg active:scale-95 transition-all">
                立即登录
            </button>
            
            <div class="mt-6 text-center">
                <button id="btn-register" class="text-sm font-bold text-blue-600 hover:underline">
                    没有账号？立即注册验证
                </button>
            </div>
        </div>
    `;

    // 绑定返回事件
    document.getElementById('auth-back').onclick = () => {
        container.innerHTML = originalContent;
        initEmailEntry(); // 重新初始化按钮绑定
    };

    // 绑定逻辑事件
    document.getElementById('btn-register').onclick = handleRegister;
    document.getElementById('btn-login').onclick = handleLogin;
};

// --- 以下逻辑保持不变 ---

async function handleRegister() {
    const auth = getAuth();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    if (!email || password.length < 6) {
        alert("请输入有效的邮箱，且密码不少于6位");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        alert("注册成功！验证邮件已发送至您的邮箱，请点击邮件中的链接完成验证后登录。");
    } catch (error) {
        let msg = "注册失败";
        if (error.code === 'auth/email-already-in-use') msg = "该邮箱已被注册";
        alert(msg + ": " + error.message);
    }
}

async function handleLogin() {
    const auth = getAuth();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            alert("请先前往邮箱完成链接验证。");
            return;
        }
        // 成功后，HTML 主程序的 onAuthStateChanged 会接管
    } catch (error) {
        alert("登录失败: 邮箱或密码错误");
    }
}

// 启动执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailEntry);
} else {
    initEmailEntry();
}
