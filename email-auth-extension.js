import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendEmailVerification,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// 初始化：在主界面注入入口
const initEmailEntry = () => {
    const loginBox = document.querySelector('#login-screen .bg-white');
    if (!loginBox || document.getElementById('email-entry-btn')) return;

    const entryBtn = document.createElement('button');
    entryBtn.id = 'email-entry-btn';
    entryBtn.className = "w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold mt-4 flex items-center justify-center gap-2 border border-slate-200 transition-all active:scale-95";
    entryBtn.innerHTML = `<i class="fas fa-envelope"></i> 邮箱账号登录`;
    
    entryBtn.onclick = () => showEmailForm(loginBox);
    loginBox.appendChild(entryBtn);
};

// 显示表单界面
const showEmailForm = (container) => {
    container.innerHTML = `
        <div class="text-left animate-in fade-in duration-300">
            <button id="auth-back" class="text-slate-400 mb-6 flex items-center gap-1 text-sm font-bold">
                <i class="fas fa-arrow-left"></i> 返回
            </button>
            <h3 class="text-xl font-bold mb-6 text-slate-800">邮箱登录 / 注册</h3>
            
            <div class="space-y-4">
                <input type="email" id="auth-email" placeholder="Email" class="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition-all">
                <input type="password" id="auth-password" placeholder="Password" class="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition-all">
            </div>

            <button id="btn-login" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold mt-8 shadow-lg active:scale-95 transition-all">
                立即登录
            </button>
            
            <div class="mt-6 text-center">
                <button id="btn-register" class="text-sm font-bold text-blue-600 hover:underline">
                    没有账号？立即注册验证
                </button>
            </div>
            <p id="auth-msg" class="mt-4 text-xs text-center font-medium hidden"></p>
        </div>
    `;

    document.getElementById('auth-back').onclick = () => location.reload();
    document.getElementById('btn-register').onclick = handleRegister;
    document.getElementById('btn-login').onclick = handleLogin;
};

// 核心改进逻辑
async function handleRegister() {
    const auth = getAuth();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const msgEl = document.getElementById('auth-msg');

    if (!email || password.length < 6) {
        alert("请输入有效的邮箱，且密码不少于6位");
        return;
    }

    try {
        // 1. 设置头像 API
        const initial = email.charAt(0).toUpperCase();
        const defaultAvatar = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;

        // 2. 创建用户
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. 更新资料（设置首字母头像）
        await updateProfile(user, {
            displayName: email.split('@')[0],
            photoURL: defaultAvatar
        });

        // 4. 发送验证邮件
        await sendEmailVerification(user);

        // 【关键步骤】立刻退出登录，防止主 HTML 脚本把页面切走
        await signOut(auth);

        // 5. UI 反馈
        msgEl.innerText = "验证邮件已发送至您的邮箱，请验证后再登录。";
        msgEl.className = "mt-4 text-xs text-center font-medium text-green-600 block";
        document.getElementById('auth-email').value = "";
        document.getElementById('auth-password').value = "";
        
        alert("注册成功！请前往邮箱点击验证链接，完成后再返回此处登录。");

    } catch (error) {
        let errorMsg = "注册失败";
        if (error.code === 'auth/email-already-in-use') errorMsg = "该邮箱已被注册";
        alert(errorMsg + ": " + error.message);
    }
}

async function handleLogin() {
    const auth = getAuth();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 【拦截逻辑】如果没验证邮箱，强制踢出
        if (!user.emailVerified) {
            alert("您的邮箱尚未验证，请点击邮件中的链接。");
            await signOut(auth); // 踢回登录状态
            return;
        }

        // 验证通过，不做任何操作，主 HTML 的 onAuthStateChanged 会带你进 App
    } catch (error) {
        alert("登录失败：邮箱或密码错误");
    }
}

// 启动执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailEntry);
} else {
    initEmailEntry();
}
