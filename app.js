/**
 * EKHOO OS // CORE TERMINAL 
 * VERSION: 9.2.0 [EXPANDED SIDEBAR BUILD]
 * FOCUS: Large Navigation, Profile Routing, Birthday Protocol.
 */

const Core = {
    state: {
        lang: localStorage.getItem('ekhoo_lang') || 'ru',
        user: JSON.parse(localStorage.getItem('ekhoo_user')) || { 
            name: "Operator", 
            avatar: null, 
            bio: "System Guardian", 
            birthDate: "" 
        },
        posts: JSON.parse(localStorage.getItem('ekhoo_posts')) || [],
        messages: JSON.parse(localStorage.getItem('ekhoo_messages')) || {},
        currentView: 'feed',
        tempImage: null,
        activeChatId: null,
        viewingProfile: null 
    },

    t(key) { return CONFIG.translations[this.state.lang][key] || key; },

    init() {
        console.log(">> SYSTEM: INITIALIZING EXPANDED MONOLITH UI...");
        this.checkSession();
        this.renderNav();
        setInterval(() => {
            const el = document.getElementById('clock-display');
            if(el) el.innerText = new Date().toLocaleTimeString();
        }, 1000);
    },

    save() {
        localStorage.setItem('ekhoo_user', JSON.stringify(this.state.user));
        localStorage.setItem('ekhoo_posts', JSON.stringify(this.state.posts));
        localStorage.setItem('ekhoo_messages', JSON.stringify(this.state.messages));
        localStorage.setItem('ekhoo_lang', this.state.lang);
    },

    checkSession() {
        if (localStorage.getItem('ekhoo_session')) {
            const auth = document.getElementById('auth-screen');
            const app = document.getElementById('app-workspace');
            if(auth) auth.style.display = 'none';
            if(app) app.classList.remove('hidden');
            
            const nameEl = document.getElementById('sidebar-username');
            if(nameEl) nameEl.innerText = this.state.user.name;
            this.renderView('feed');
        }
    },

    attemptLogin() {
        const val = document.getElementById('login-input').value;
        if (val.length < 2) return;
        this.state.user.name = val;
        localStorage.setItem('ekhoo_session', 'true');
        this.save();
        location.reload();
    },

    // --- ОБНОВЛЕННАЯ НАВИГАЦИЯ (Увеличенные таб-бары) ---
    renderNav() {
        const nav = document.getElementById('main-nav');
        // Увеличено: py-5 (отступы), border-l-4 (толщина линии), text-[11px] (размер шрифта)
        nav.innerHTML = CONFIG.menu.map(item => `
            <button onclick="Core.renderView('${item.id}')" 
                class="w-full flex items-center gap-5 px-8 py-5 border-l-4 transition-all duration-300 ${this.state.currentView === item.id && !this.state.viewingProfile ? 'border-[#00FF7F] text-[#00FF7F] bg-[#00FF7F]/5 shadow-[inset_10px_0_20px_-10px_rgba(0,255,127,0.1)]' : 'border-transparent text-[#8B949E] hover:text-white hover:bg-white/5'}">
                <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                <span class="text-[11px] font-bold uppercase tracking-[0.2em] hidden md:block">${item.label[this.state.lang]}</span>
            </button>
        `).join('');
        lucide.createIcons();
    },

    renderView(viewId) {
        this.state.currentView = viewId;
        this.state.viewingProfile = null; 
        this.renderNav();
        
        const container = document.getElementById('view-container');
        const titleEl = document.getElementById('view-title');
        if(titleEl) titleEl.innerText = `SYSTEM // ${viewId.toUpperCase()}`;
        
        container.innerHTML = '';
        if (viewId === 'feed') this.renderFeed();
        if (viewId === 'news') this.renderNews();
        if (viewId === 'dms') this.renderDms();
        if (viewId === 'profile') this.renderProfile();
        if (viewId === 'settings') this.renderSettings();
        lucide.createIcons();
    },

    // --- ГЛАВНАЯ ЛЕНТА (WAVES) ---
    renderFeed() {
        document.getElementById('view-container').innerHTML = `
            <div class="space-y-6 fade-in max-w-3xl mx-auto">
                <div class="bg-[#0B0E14] border border-[#1E252E] p-6 shadow-sm">
                    <textarea id="wave-input" class="w-full bg-[#05070A] text-[#F0F6FC] p-4 text-[13px] border border-[#1E252E] focus:border-[#00FF7F] outline-none mb-4 resize-none transition-all" rows="3" placeholder="${this.t('placeholder')}"></textarea>
                    
                    <div id="prev-box" class="hidden mb-4 relative w-24 h-24">
                        <img id="img-render" class="w-full h-full object-cover border border-[#00FF7F]">
                        <button onclick="Core.clearImg()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[9px] flex items-center justify-center hover:bg-white hover:text-red-500 transition-colors font-black">✕</button>
                    </div>

                    <div class="flex justify-between items-center">
                        <label class="cursor-pointer text-[#8B949E] hover:text-[#00FF7F] transition-colors p-2 -ml-2">
                            <i data-lucide="image" class="w-5 h-5"></i>
                            <input type="file" class="hidden" onchange="Core.handleFile(this)">
                        </label>
                        <button onclick="Core.post()" class="bg-[#00FF7F] text-[#05070A] font-extrabold px-10 py-3 uppercase text-[10px] tracking-[0.2em] hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">${this.t('emit')}</button>
                    </div>
                </div>
                <div class="space-y-4" id="feed-stack">
                    ${this.state.posts.map(p => this.genPost(p)).join('')}
                </div>
            </div>
        `;
    },

    handleFile(input) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.state.tempImage = e.target.result;
            document.getElementById('img-render').src = e.target.result;
            document.getElementById('prev-box').classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    },

    clearImg() { 
        this.state.tempImage = null; 
        document.getElementById('prev-box').classList.add('hidden'); 
    },

    post() {
        const txt = document.getElementById('wave-input').value;
        if (!txt && !this.state.tempImage) return;
        const newPost = {
            id: Date.now(),
            author: this.state.user.name,
            authorBio: this.state.user.bio,
            text: txt,
            image: this.state.tempImage,
            time: new Date().toLocaleString(this.state.lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
            echoes: [],
            replies: []
        };
        this.state.posts.unshift(newPost);
        this.clearImg();
        this.save();
        this.renderFeed();
    },

    genPost(p) {
        const hasEcho = p.echoes && p.echoes.includes(this.state.user.name);
        return `
            <div class="bg-[#0B0E14] border border-[#1E252E] p-6 hover:border-[#1E252E]/80 transition-all">
                <div class="flex justify-between items-start mb-5">
                    <div class="flex items-center gap-4 group cursor-pointer" onclick="Core.viewUserProfile('${p.author}')">
                        <div class="w-11 h-11 bg-[#05070A] border border-[#1E252E] flex items-center justify-center text-[#00FF7F] font-bold text-base group-hover:border-[#00FF7F] transition-all">
                            ${p.author[0].toUpperCase()}
                        </div>
                        <div>
                            <div class="text-[13px] font-bold text-[#00FF7F] uppercase tracking-tighter group-hover:underline">${p.author}</div>
                            <div class="text-[10px] text-[#8B949E] uppercase tracking-widest">${p.authorBio || 'Operator'}</div>
                        </div>
                    </div>
                    <div class="text-[9px] font-mono text-[#8B949E] uppercase tracking-tighter">${p.time}</div>
                </div>
                
                ${p.text ? `<p class="mb-5 text-[14px] text-[#F0F6FC] leading-relaxed">${p.text}</p>` : ''}
                ${p.image ? `<img src="${p.image}" class="w-full mb-5 border border-[#1E252E] grayscale hover:grayscale-0 transition-all duration-500">` : ''}
                
                <div class="flex gap-8 border-t border-[#1E252E]/50 pt-4">
                    <button onclick="Core.toggleEcho(${p.id})" class="text-[11px] font-bold flex items-center gap-2 ${hasEcho ? 'text-[#00FF7F]' : 'text-[#8B949E]'} hover:text-[#00FF7F] transition-colors uppercase tracking-widest">
                        <i data-lucide="zap" class="w-4 h-4"></i> ${p.echoes ? p.echoes.length : 0}
                    </button>
                    <button onclick="Core.openReply(${p.id})" class="text-[11px] font-bold flex items-center gap-2 text-[#8B949E] hover:text-white transition-colors uppercase tracking-widest">
                        <i data-lucide="message-square" class="w-4 h-4"></i> ${p.replies ? p.replies.length : 0}
                    </button>
                </div>
                
                ${p.replies && p.replies.length ? `
                    <div class="mt-5 space-y-3 border-l-2 border-[#1E252E] pl-5">
                        ${p.replies.map(r => `
                            <div class="text-[12px] text-[#8B949E]">
                                <b class="text-[#00FF7F] cursor-pointer hover:underline uppercase tracking-tighter" onclick="Core.viewUserProfile('${r.author}')">${r.author}:</b> 
                                <span class="ml-2 text-[#D1D5DB]">${r.text}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    // --- РОУТИНГ ПРОФИЛЕЙ ---
    viewUserProfile(username) {
        this.state.viewingProfile = username;
        this.renderProfile(username);
        this.renderNav(); // Обновляем навигацию, чтобы снять активный статус с кнопок
        const titleEl = document.getElementById('view-title');
        if(titleEl) titleEl.innerText = `OPERATOR // ${username.toUpperCase()}`;
    },

    // --- ПРОФИЛЬ С BIRTHDAY PROTOCOL ---
    renderProfile(targetUser = null) {
        const isMyProfile = !targetUser || targetUser === this.state.user.name;
        let displayUser = isMyProfile ? this.state.user : { name: targetUser, bio: "External Operator", avatar: null, birthDate: "" };
        
        if (!isMyProfile) {
            const userPost = this.state.posts.find(p => p.author === targetUser);
            if (userPost && userPost.authorBio) displayUser.bio = userPost.authorBio;
        }

        const myPosts = this.state.posts.filter(p => p.author === displayUser.name);

        // Логика проверки дня рождения
        let isBirthday = false;
        if (displayUser.birthDate) {
            const today = new Date();
            const bDate = new Date(displayUser.birthDate);
            isBirthday = (today.getDate() === bDate.getDate() && today.getMonth() === bDate.getMonth());
        }

        document.getElementById('view-container').innerHTML = `
            <div class="space-y-6 fade-in max-w-3xl mx-auto">
                <div class="bg-[#0B0E14] border-2 ${isBirthday ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'border-[#1E252E]'} p-8 md:p-10 relative flex items-center gap-8 transition-all duration-700">
                    
                    ${isBirthday ? `<div class="absolute -top-3 left-10 bg-yellow-500 text-black text-[10px] font-black px-4 py-1 uppercase tracking-[0.3em] z-10 shadow-lg">Birthday Protocol Active</div>` : ''}

                    <div class="w-24 h-24 ${isBirthday ? 'bg-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.4)]' : 'bg-[#00FF7F]'} text-[#05070A] flex items-center justify-center text-4xl font-black relative group transition-all shrink-0">
                        ${displayUser.avatar ? `<img src="${displayUser.avatar}" class="w-full h-full object-cover">` : displayUser.name[0].toUpperCase()}
                        ${isMyProfile ? `<div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity cursor-pointer uppercase tracking-widest" onclick="document.getElementById('avatar-in').click()">Upload</div>` : ''}
                        <input type="file" id="avatar-in" class="hidden" onchange="Core.upAvatar(this)">
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3 mb-2">
                            <h2 class="text-3xl font-black text-white tracking-tighter truncate uppercase">${displayUser.name}</h2>
                            ${isBirthday ? '<span class="text-yellow-500 text-2xl animate-bounce">🎂</span>' : ''}
                        </div>
                        <p class="text-[#8B949E] text-[12px] mb-5 uppercase tracking-[0.2em] font-bold">${displayUser.bio || 'Operator'}</p>
                        
                        ${displayUser.birthDate ? `<div class="text-[10px] text-[#00FF7F] font-mono uppercase tracking-[0.3em] mb-6 opacity-60 flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-[#00FF7F]"></div> [ DATA: ${displayUser.birthDate} ]</div>` : ''}
                        
                        ${isMyProfile ? `<button onclick="Core.openProfileEdit()" class="bg-[#12171F] border border-[#1E252E] text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:border-[#00FF7F] hover:text-[#00FF7F] transition-all hover:bg-[#00FF7F]/5">${this.t('edit_profile')}</button>` : ''}
                    </div>
                </div>

                ${isMyProfile ? `
                    <div id="profile-edit-form" class="hidden bg-[#0B0E14] border-x-2 border-b-2 border-[#00FF7F]/30 p-8 space-y-6 slide-down">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="text-[10px] text-[#00FF7F] uppercase font-bold mb-3 block tracking-widest">${this.t('bio')}</label>
                                <input type="text" id="p-bio" class="w-full bg-[#05070A] border border-[#1E252E] p-4 text-[13px] outline-none focus:border-[#00FF7F] text-white transition-colors" value="${this.state.user.bio}">
                            </div>
                            <div>
                                <label class="text-[10px] text-[#00FF7F] uppercase font-bold mb-3 block tracking-widest">${this.t('birth')}</label>
                                <input type="date" id="p-birth" class="w-full bg-[#05070A] border border-[#1E252E] p-4 text-[13px] outline-none focus:border-[#00FF7F] text-white transition-colors" value="${this.state.user.birthDate || ''}">
                            </div>
                        </div>
                        <div class="flex gap-4 pt-2">
                            <button onclick="Core.saveProfile()" class="flex-1 bg-[#00FF7F] text-[#05070A] font-black py-4 uppercase text-[11px] tracking-[0.3em] hover:bg-white transition-all">${this.t('save')}</button>
                            <button onclick="Core.closeProfileEdit()" class="px-10 border border-[#1E252E] text-[#8B949E] hover:text-white uppercase text-[10px] font-bold tracking-widest transition-colors">${this.t('cancel')}</button>
                        </div>
                    </div>
                ` : ''}

                <div class="mt-12 mb-4 text-[11px] font-black text-[#8B949E] uppercase tracking-[0.4em] border-b border-[#1E252E] pb-3 flex justify-between items-center">
                    <span>${isMyProfile ? this.t('waves_by_operator') : `WAVES // ${displayUser.name}`}</span>
                    <span class="text-[#00FF7F] opacity-50 font-mono">${myPosts.length}</span>
                </div>

                <div class="space-y-4">
                    ${myPosts.length > 0 ? myPosts.map(p => this.genProfilePost(p, isMyProfile)).join('') : `<div class="text-center py-20 text-[#8B949E] text-[10px] uppercase tracking-[0.5em] border border-[#1E252E] bg-[#0B0E14]/30">Null Data</div>`}
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    openProfileEdit() { document.getElementById('profile-edit-form').classList.remove('hidden'); },
    closeProfileEdit() { document.getElementById('profile-edit-form').classList.add('hidden'); },

    upAvatar(input) {
        const reader = new FileReader();
        reader.onload = (e) => { this.state.user.avatar = e.target.result; this.save(); this.renderProfile(); };
        reader.readAsDataURL(input.files[0]);
    },

    saveProfile() {
        this.state.user.bio = document.getElementById('p-bio').value;
        this.state.user.birthDate = document.getElementById('p-birth').value;
        this.save();
        this.renderView('profile');
    },

    genProfilePost(p, isMyProfile) {
        return `
            <div class="bg-[#0B0E14] border border-[#1E252E] p-6 hover:border-[#1E252E]/80 transition-all">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div class="text-[13px] font-bold text-[#00FF7F] uppercase tracking-tighter">${p.author}</div>
                        <div class="text-[10px] text-[#8B949E] font-mono">&bull; ${p.time}</div>
                    </div>
                    ${isMyProfile ? `
                    <button onclick="Core.deletePost(${p.id})" class="text-[10px] font-bold text-red-500/70 hover:text-red-500 uppercase tracking-widest transition-colors">
                        [ ${this.t('destruct')} ]
                    </button>
                    ` : ''}
                </div>
                ${p.text ? `<p class="mb-4 text-[14px] text-[#F0F6FC] leading-relaxed font-medium">${p.text}</p>` : ''}
                ${p.image ? `<img src="${p.image}" class="w-full mb-4 border border-[#1E252E] grayscale hover:grayscale-0 transition-all">` : ''}
            </div>
        `;
    },

    deletePost(id) {
        if(confirm("Confirm system destruction?")) {
            this.state.posts = this.state.posts.filter(p => p.id !== id);
            this.save();
            this.state.viewingProfile ? this.renderProfile(this.state.viewingProfile) : this.renderProfile();
        }
    },

    // --- ОСТАЛЬНЫЕ МОДУЛИ (Новости, ДМ, Настройки) ---
    renderNews() {
        document.getElementById('view-container').innerHTML = `
            <div class="space-y-6 max-w-3xl mx-auto">
                <h2 class="text-[11px] font-black text-[#00FF7F] tracking-[0.6em] uppercase mb-12 text-center underline underline-offset-8 decoration-1">${this.t('news_title')}</h2>
                ${CONFIG.news.map(n => `
                    <div class="bg-[#0B0E14] border border-[#1E252E] p-10 hover:border-[#00FF7F]/30 transition-all group">
                        <div class="text-[#00FF7F] font-mono text-[10px] mb-5 flex items-center gap-3">
                            <span class="w-8 h-px bg-[#00FF7F]/30"></span> ${n.date}
                        </div>
                        <h3 class="text-2xl font-black uppercase mb-4 tracking-tighter text-white group-hover:text-[#00FF7F] transition-colors">${n.title[this.state.lang]}</h3>
                        <p class="text-[#8B949E] text-[14px] leading-relaxed">${n.content[this.state.lang]}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderDms() {
        if(this.state.activeChatId) return this.renderChat();
        document.getElementById('view-container').innerHTML = `
            <div class="space-y-4 max-w-3xl mx-auto">
                <div class="relative mb-8">
                    <i data-lucide="search" class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B949E]"></i>
                    <input type="text" oninput="Core.search(this.value)" class="w-full bg-[#0B0E14] border border-[#1E252E] p-6 pl-16 text-[13px] outline-none focus:border-[#00FF7F] text-white tracking-widest uppercase transition-all" placeholder="${this.t('search')}">
                </div>
                <div id="contact-stack" class="space-y-3">
                    ${CONFIG.contacts.map(c => this.genContactHtml(c)).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    genContactHtml(c) {
        return `
            <div onclick="Core.openChat('${c.id}')" class="bg-[#0B0E14] border border-[#1E252E] p-6 flex justify-between items-center cursor-pointer hover:border-[#00FF7F] hover:bg-[#00FF7F]/5 transition-all group">
                <div class="flex items-center gap-5">
                    <div class="w-12 h-12 bg-[#05070A] border border-[#1E252E] flex items-center justify-center text-[#8B949E] group-hover:text-[#00FF7F] group-hover:border-[#00FF7F] font-black text-lg transition-all">${c.name[0]}</div>
                    <div>
                        <div class="text-[14px] font-black uppercase tracking-tighter text-white">${c.name}</div>
                        <div class="text-[10px] text-[#8B949E] uppercase tracking-[0.2em] font-bold">${c.bio[this.state.lang]}</div>
                    </div>
                </div>
                <div class="w-2.5 h-2.5 bg-[#00FF7F] rounded-full animate-pulse shadow-[0_0_10px_#00FF7F]"></div>
            </div>
        `;
    },

    search(val) {
        const res = CONFIG.contacts.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
        document.getElementById('contact-stack').innerHTML = res.map(c => this.genContactHtml(c)).join('');
        lucide.createIcons();
    },

    openChat(id) { this.state.activeChatId = id; this.renderView('dms'); },

    renderChat() {
        const c = CONFIG.contacts.find(x => x.id === this.state.activeChatId);
        const msgs = this.state.messages[c.id] || [];
        document.getElementById('view-container').innerHTML = `
            <div class="flex flex-col h-[70vh] max-w-3xl mx-auto">
                <div class="flex items-center gap-5 mb-8 pb-5 border-b border-[#1E252E]">
                    <button onclick="Core.state.activeChatId=null; Core.renderView('dms')" class="text-[#8B949E] hover:text-white flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all"><i data-lucide="arrow-left" class="w-5 h-5"></i> ${this.t('back')}</button>
                    <div class="h-5 w-px bg-[#1E252E]"></div>
                    <div class="text-[12px] font-black text-[#00FF7F] uppercase tracking-[0.3em]">${c.name} // SECURE_CHANNEL</div>
                </div>
                <div class="flex-1 overflow-y-auto space-y-4 mb-6 pr-4 custom-scroll flex flex-col">
                    ${msgs.map(m => `
                        <div class="${m.from==='me'?'self-end text-right':'self-start text-left'} max-w-[80%]">
                            <div class="inline-block p-4 ${m.from==='me'?'bg-[#00FF7F]/10 border border-[#00FF7F]/30 text-white font-medium':'bg-[#1E252E] text-[#D1D5DB]'} text-[13px] shadow-sm">
                                ${m.text}
                            </div>
                            <div class="text-[9px] font-mono mt-2 opacity-50 uppercase text-[#8B949E] tracking-tighter">${m.time || ''}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="flex gap-4">
                    <input id="msg-in" class="flex-1 bg-[#0B0E14] border border-[#1E252E] p-5 text-[13px] outline-none focus:border-[#00FF7F] text-white transition-all" placeholder="Enter transmission...">
                    <button onclick="Core.sendMsg()" class="bg-[#00FF7F] text-[#05070A] px-12 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white transition-all">${this.t('send')}</button>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    sendMsg() {
        const input = document.getElementById('msg-in');
        if(!input.value) return;
        const id = this.state.activeChatId;
        if(!this.state.messages[id]) this.state.messages[id] = [];
        this.state.messages[id].push({ from: 'me', text: input.value, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
        this.save();
        this.renderChat();
        input.value = '';
    },

    renderSettings() {
        document.getElementById('view-container').innerHTML = `
            <div class="max-w-md mx-auto space-y-5 mt-12">
                <button onclick="Core.toggleLang()" class="w-full bg-[#0B0E14] border-2 border-[#1E252E] p-8 flex justify-between items-center hover:border-[#00FF7F] transition-all group">
                    <span class="text-[11px] font-black uppercase tracking-[0.3em] group-hover:text-[#00FF7F]">${this.t('langBtn')}</span>
                    <span class="text-[#00FF7F] font-mono text-[13px] font-black underline decoration-2">${this.state.lang.toUpperCase()}</span>
                </button>
                <div class="h-px bg-[#1E252E] my-10"></div>
                <button onclick="localStorage.removeItem('ekhoo_session'); location.reload();" class="w-full bg-[#0B0E14] border border-[#1E252E] p-6 flex justify-between items-center hover:border-white transition-all text-[#8B949E] hover:text-white group">
                    <span class="text-[10px] font-black uppercase tracking-[0.3em]">${this.t('logout')}</span>
                    <i data-lucide="log-out" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
                </button>
                <button onclick="localStorage.clear(); location.reload();" class="w-full bg-red-500/5 border border-red-500/20 p-6 flex justify-between items-center hover:bg-red-500 hover:text-white transition-all text-red-500 group">
                    <span class="text-[10px] font-black uppercase tracking-[0.3em]">${this.t('reset')}</span>
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
        `;
        lucide.createIcons();
    },

    toggleLang() {
        this.state.lang = this.state.lang === 'ru' ? 'en' : 'ru';
        this.save();
        this.renderView('settings');
        this.renderNav();
    },

    toggleEcho(id) {
        const p = this.state.posts.find(x => x.id === id);
        if(!p.echoes) p.echoes = [];
        const idx = p.echoes.indexOf(this.state.user.name);
        idx === -1 ? p.echoes.push(this.state.user.name) : p.echoes.splice(idx, 1);
        this.save();
        if(this.state.viewingProfile) this.renderProfile(this.state.viewingProfile);
        else if(this.state.currentView === 'profile') this.renderProfile();
        else this.renderView('feed');
    },

    openReply(id) { 
        this.state.activeReplyId = id; 
        const modal = document.getElementById('reply-modal');
        if(modal) modal.classList.remove('hidden'); 
    },
    closeReply() { 
        const modal = document.getElementById('reply-modal');
        if(modal) modal.classList.add('hidden'); 
    },
    submitReply() {
        const txt = document.getElementById('reply-input').value;
        if(!txt) return;
        const p = this.state.posts.find(x => x.id === this.state.activeReplyId);
        if(!p.replies) p.replies = [];
        p.replies.push({ author: this.state.user.name, text: txt });
        this.save();
        this.closeReply();
        if(this.state.viewingProfile) this.renderProfile(this.state.viewingProfile);
        else this.renderView('feed');
        document.getElementById('reply-input').value = '';
    }
};

window.onload = () => Core.init();