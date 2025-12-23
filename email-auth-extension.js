import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendEmailVerification,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// 1. 初始化入口
const initEmailEntry = () => {
    const loginBox = document.querySelector('#login-screen .bg-white');
    if (!loginBox) return;
    if (document.getElementById('email-entry-btn')) return;

    const entryBtn = document.createElement('button');
    entryBtn.id = 'email-entry-btn';
    entryBtn.className = "w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold mt-4 flex items-center justify-center gap-2 border border-slate-200 transition-all active:scale-95";
    entryBtn.innerHTML = `<i class="fas fa-envelope"></i> 邮箱账号登录`;
    
    entryBtn.onclick = () => showEmailForm(loginBox);
    loginBox.appendChild(entryBtn);
};

// 2. 显示表单
const showEmailForm = (container) => {
    const originalContent = container.innerHTML;
    container.innerHTML = `
        <div class="text-left">
            <button id="auth-back" class="text-slate-400 mb-6 flex items-center gap-1 text-sm font-bold">
                <i class="fas fa-arrow-left"></i> 返回
            </button>
            <h3 class="text-xl font-bold mb-6 text-slate-800">邮箱登录 / 注册</h3>
            <div class="space-y-4">
                <input type="email" id="auth-email" placeholder="Email" class="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition-all">
                <input type="password" id="auth-password" placeholder="Password" class="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition-all">
            </div>
            <button id="btn-login" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold mt-8 shadow-lg active:scale-95 transition-all">立即登录</button>
            <div class="mt-6 text-center">
                <button id="btn-register" class="text-sm font-bold text-blue-600 hover:underline">没有账号？立即注册验证</button>
            </div>
        </div>
    `;

    document.getElementById('auth-back').onclick = () => {
        location.reload(); // 简单重载以恢复初始状态
    };

    document.getElementById('btn-register').onclick = handleRegister;
    document.getElementById('btn-login').onclick = handleLogin;
};

// --- 核心逻辑：解决注册即登录 & 默认头像问题 ---

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
        const user = userCredential.user;

        // 1. 设置默认头像（使用 UI Avatars 生成首字母头像）
        const initial = email.charAt(0).toUpperCase();
        const defaultAvatar = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;
        
        await updateProfile(user, {
            displayName: email.split('@')[0], // 默认用户名为邮箱前缀
            photoURL: defaultAvatar
        });

        // 2. 发送验证邮件
        await sendEmailVerification(user);

        // 3. 强制退出登录 (防止直接进入系统)
        await signOut(auth);

        alert("注册成功！验证邮件已发送。请点击邮件中的链接完成验证后，再次在登录页进行登录。");
        location.reload(); // 返回主登录页
        
    } catch (error) {
        alert("注册失败: " + error.message);
    }
}

async function handleLogin() {
    const auth = getAuth();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // 检查是否验证了邮箱
        if (!userCredential.user.emailVerified) {
            alert("请先前往邮箱完成验证链接，否则无法登录。");
            await signOut(auth); // 未验证则强制踢出
            return;
        }
    } catch (error) {
        alert("登录失败: 邮箱或密码错误");
    }
}

// 启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailEntry);
} else {
    initEmailEntry();
}
