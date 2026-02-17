const Core = {
    state: {
        lang: localStorage.getItem('ekhoo_lang') || 'ru',
        user: JSON.parse(localStorage.getItem('ekhoo_user')) || { name: "Operator", avatar: null, bio: "", birthDate: "" },
        posts: JSON.parse(localStorage.getItem('ekhoo_posts')) || [],
        messages: JSON.parse(localStorage.getItem('ekhoo_messages')) || {},
        currentView: 'feed',
        tempImage: null,
        activeChatId: null
    },

    t(key) { return CONFIG.translations[this.state.lang][key] || key; },

    init() {
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
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('app-workspace').classList.remove('hidden');
            document.getElementById('sidebar-username').innerText = this.state.user.name;
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

    renderNav() {
        const nav = document.getElementById('main-nav');
        nav.innerHTML = CONFIG.menu.map(item => `
            <button onclick="Core.renderView('${item.id}')" class="w-full flex items-center gap-5 px-8 py-5 border-l-4 transition-all ${this.state.currentView === item.id ? 'border-[#00FF7F] text-[#00FF7F] bg-[#00FF7F]/5' : 'border-transparent text-[#8B949E]'}">
                <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                <span class="text-[11px] font-bold uppercase tracking-widest hidden md:block">${item.label[this.state.lang]}</span>
            </button>
        `).join('');
        lucide.createIcons();
    },

    renderView(viewId) {
        this.state.currentView = viewId;
        this.renderNav();
        const container = document.getElementById('view-container');
        document.getElementById('view-title').innerText = `SYSTEM // ${viewId.toUpperCase()}`;
        
        container.innerHTML = '';
        if (viewId === 'feed') this.renderFeed();
        if (viewId === 'news') this.renderNews();
        if (viewId === 'dms') this.renderDms();
        if (viewId === 'profile') this.renderProfile();
        if (viewId === 'settings') this.renderSettings();
        lucide.createIcons();
    },

    // --- ЛЕНТА (MAIN FEED) ---
    renderFeed() {
        document.getElementById('view-container').innerHTML = `
            <div class="space-y-10">
                <div class="bg-[#0B0E14] border border-[#1E252E] p-8">
                    <textarea id="wave-input" class="w-full bg-[#05070A] text-white p-6 border border-[#1E252E] focus:border-[#00FF7F] outline-none mb-4 resize-none" rows="3" placeholder="${this.t('placeholder')}"></textarea>
                    <div id="prev-box" class="hidden mb-4 relative w-32 h-32">
                        <img id="img-render" class="w-full h-full object-cover border border-[#00FF7F]">
                        <button onclick="Core.clearImg()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px]">X</button>
                    </div>
                    <div class="flex justify-between items-center">
                        <label class="cursor-pointer text-[#8B949E] hover:text-[#00FF7F] transition-colors"><i data-lucide="image"></i><input type="file" class="hidden" onchange="Core.handleFile(this)"></label>
                        <button onclick="Core.post()" class="bg-[#00FF7F] text-[#05070A] font-extrabold px-10 py-3 uppercase text-[10px] hover:bg-white transition-all">${this.t('emit')}</button>
                    </div>
                </div>
                <div class="space-y-6">${this.state.posts.map(p => this.genPost(p)).join('')}</div>
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

    clearImg() { this.state.tempImage = null; document.getElementById('prev-box').classList.add('hidden'); },

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
            <div class="bg-[#0B0E14] border border-[#1E252E] p-8 hover:border-[#00FF7F]/30 transition-all">
                <div class="flex justify-between items-start mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-[#05070A] border border-[#1E252E] flex items-center justify-center text-[#00FF7F] font-bold">${p.author[0].toUpperCase()}</div>
                        <div>
                            <div class="text-xs font-bold text-[#00FF7F] uppercase tracking-tighter">${p.author}</div>
                            <div class="text-[9px] text-[#8B949E] uppercase tracking-widest">${p.authorBio || 'Operator'}</div>
                        </div>
                    </div>
                    <div class="text-[9px] font-mono text-[#8B949E] uppercase">${p.time}</div>
                </div>
                ${p.text ? `<p class="mb-4 text-[15px] text-[#F0F6FC] leading-relaxed">${p.text}</p>` : ''}
                ${p.image ? `<img src="${p.image}" class="w-full mb-4 border border-[#1E252E] grayscale hover:grayscale-0 transition-all">` : ''}
                <div class="flex gap-6 border-t border-[#1E252E]/30 pt-4">
                    <button onclick="Core.toggleEcho(${p.id})" class="text-[10px] font-bold ${hasEcho ? 'text-[#00FF7F]' : 'text-[#8B949E]'} hover:text-[#00FF7F] transition-colors">${this.t('echo')} [${p.echoes ? p.echoes.length : 0}]</button>
                    <button onclick="Core.openReply(${p.id})" class="text-[10px] font-bold text-[#8B949E] hover:text-white transition-colors">${this.t('reply')} [${p.replies ? p.replies.length : 0}]</button>
                </div>
                ${p.replies && p.replies.length ? `<div class="mt-4 space-y-2 border-l border-[#1E252E] pl-4">${p.replies.map(r => `<div class="text-xs text-[#8B949E]"><b class="text-[#00FF7F]">${r.author}:</b> ${r.text}</div>`).join('')}</div>` : ''}
            </div>
        `;
    },

    // --- НОВОСТИ ---
    renderNews() {
        document.getElementById('view-container').innerHTML = `
            <div class="space-y-8">
                <h2 class="text-[10px] font-bold text-[#00FF7F] tracking-[0.5em] uppercase mb-10 text-center">${this.t('news_title')}</h2>
                ${CONFIG.news.map(n => `
                    <div class="bg-[#0B0E14] border border-[#1E252E] p-10 hover:border-[#00FF7F]/50 transition-all">
                        <div class="text-[#00FF7F] font-mono text-[10px] mb-4">${n.date}</div>
                        <h3 class="text-2xl font-extrabold uppercase mb-4 tracking-tighter text-white">${n.title[this.state.lang]}</h3>
                        <p class="text-[#8B949E] text-sm leading-relaxed">${n.content[this.state.lang]}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // --- ПРОФИЛЬ (ОБНОВЛЕННЫЙ ДИЗАЙН 0.8.9 MONOLITH) ---
    renderProfile() {
        const myPosts = this.state.posts.filter(p => p.author === this.state.user.name);
        const bioText = this.state.user.bio || 'Operator EKHOO';

        document.getElementById('view-container').innerHTML = `
            <div class="space-y-8 fade-in">
                <div class="bg-[#0B0E14] border border-[#1E252E] p-8 md:p-12 relative flex items-center gap-8">
                    <div class="absolute top-8 right-8 flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-[#00FF7F] shadow-[0_0_8px_#00FF7F]"></div>
                        <span class="text-[10px] text-[#00FF7F] font-bold uppercase tracking-widest">${this.t('online')}</span>
                    </div>

                    <div class="w-24 h-24 bg-[#00FF7F] text-[#05070A] flex items-center justify-center text-5xl font-extrabold cursor-pointer relative group" onclick="document.getElementById('avatar-in').click()">
                        ${this.state.user.avatar ? `<img src="${this.state.user.avatar}" class="w-full h-full object-cover">` : this.state.user.name[0].toUpperCase()}
                        <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">UPDATE</div>
                        <input type="file" id="avatar-in" class="hidden" onchange="Core.upAvatar(this)">
                    </div>

                    <div class="flex-1">
                        <h2 class="text-3xl font-bold text-white mb-1 tracking-tighter">${this.state.user.name}</h2>
                        <p class="text-[#8B949E] text-[11px] mb-6">${bioText}</p>
                        <button onclick="Core.openProfileEdit()" class="bg-[#12171F] border border-[#1E252E] text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-[#00FF7F] hover:text-[#00FF7F] transition-colors rounded-sm shadow-sm">${this.t('edit_profile')}</button>
                    </div>
                </div>

                <div id="profile-edit-form" class="hidden bg-[#0B0E14] border border-[#00FF7F]/50 p-8 space-y-6">
                    <div>
                        <label class="text-[10px] text-[#00FF7F] uppercase font-bold mb-2 block tracking-widest">${this.t('bio')}</label>
                        <textarea id="p-bio" class="w-full bg-[#05070A] border border-[#1E252E] p-4 text-sm outline-none focus:border-[#00FF7F] text-white resize-none" rows="2">${this.state.user.bio}</textarea>
                    </div>
                    <div>
                        <label class="text-[10px] text-[#00FF7F] uppercase font-bold mb-2 block tracking-widest">${this.t('birth')}</label>
                        <input type="date" id="p-birth" class="w-full bg-[#05070A] border border-[#1E252E] p-4 text-sm outline-none focus:border-[#00FF7F] text-white" value="${this.state.user.birthDate || ''}">
                    </div>
                    <div class="flex gap-4">
                        <button onclick="Core.saveProfile()" class="flex-1 bg-[#00FF7F] text-[#05070A] font-extrabold py-3 uppercase text-[11px] tracking-[0.2em] hover:bg-white transition-all">${this.t('save')}</button>
                        <button onclick="Core.closeProfileEdit()" class="px-8 border border-[#1E252E] text-[#8B949E] hover:text-white uppercase text-[10px] font-bold tracking-widest transition-colors">${this.t('cancel')}</button>
                    </div>
                </div>

                <div class="mt-12 mb-4 text-[11px] font-bold text-[#8B949E] uppercase tracking-widest pl-2">
                    ${this.t('waves_by_operator')}
                </div>

                <div class="space-y-4">
                    ${myPosts.length > 0 ? myPosts.map(p => this.genProfilePost(p)).join('') : `<div class="text-center p-10 text-[#8B949E] text-xs uppercase tracking-widest border border-[#1E252E]">No waves yet</div>`}
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    openProfileEdit() {
        document.getElementById('profile-edit-form').classList.remove('hidden');
    },

    closeProfileEdit() {
        document.getElementById('profile-edit-form').classList.add('hidden');
    },

    upAvatar(input) {
        const reader = new FileReader();
        reader.onload = (e) => { this.state.user.avatar = e.target.result; this.save(); this.renderProfile(); };
        reader.readAsDataURL(input.files[0]);
    },

    saveProfile() {
        this.state.user.bio = document.getElementById('p-bio').value;
        this.state.user.birthDate = document.getElementById('p-birth').value;
        this.save();
        this.renderView('profile'); // Перерисовка профиля скрывает форму
    },

    // Специальный генератор постов для профиля (с кнопкой УНИЧТОЖИТЬ)
    genProfilePost(p) {
        return `
            <div class="bg-[#0B0E14] border border-[#1E252E] p-6 hover:border-[#1E252E]/80 transition-all">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div class="text-sm font-bold text-[#00FF7F]">${p.author}</div>
                        <div class="flex items-center gap-1 text-[9px] text-[#00FF7F] uppercase tracking-widest">
                            <div class="w-1.5 h-1.5 rounded-full bg-[#00FF7F]"></div> ${this.t('online')}
                        </div>
                        <div class="text-[10px] text-[#8B949E]">&bull; ${p.time}</div>
                    </div>
                    <button onclick="Core.deletePost(${p.id})" class="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors group">
                        <span class="group-hover:underline">${this.t('destruct')}</span>
                    </button>
                </div>
                ${p.text ? `<p class="mb-5 text-[14px] text-[#F0F6FC] leading-relaxed">${p.text}</p>` : ''}
                ${p.image ? `<img src="${p.image}" class="w-full mb-4 border border-[#1E252E]">` : ''}
                <div class="flex gap-6 pt-2">
                    <div class="flex items-center gap-2 text-[11px] font-bold text-[#00FF7F]">
                        <i data-lucide="zap" class="w-3.5 h-3.5"></i> ${p.echoes ? p.echoes.length : 0} Echoes
                    </div>
                    <div class="flex items-center gap-2 text-[11px] font-bold text-[#8B949E]">
                        <i data-lucide="message-square" class="w-3.5 h-3.5"></i> ${p.replies ? p.replies.length : 0} Replies
                    </div>
                </div>
            </div>
        `;
    },

    deletePost(id) {
        // Подтверждение перед удалением (опционально, но полезно)
        if(confirm("Вы уверены, что хотите уничтожить эту волну?")) {
            this.state.posts = this.state.posts.filter(p => p.id !== id);
            this.save();
            this.renderView('profile'); // Обновляем профиль
        }
    },

    // --- ЛИЧНЫЕ СООБЩЕНИЯ ---
    renderDms() {
        if(this.state.activeChatId) return this.renderChat();
        document.getElementById('view-container').innerHTML = `
            <div class="space-y-6">
                <div class="relative">
                    <i data-lucide="search" class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]"></i>
                    <input type="text" oninput="Core.search(this.value)" class="w-full bg-[#0B0E14] border border-[#1E252E] p-5 pl-14 text-sm outline-none focus:border-[#00FF7F]" placeholder="${this.t('search')}">
                </div>
                <div id="contact-stack" class="space-y-2">
                    ${CONFIG.contacts.map(c => this.genContactHtml(c)).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    genContactHtml(c) {
        return `
            <div onclick="Core.openChat('${c.id}')" class="bg-[#0B0E14] border border-[#1E252E] p-6 flex justify-between items-center cursor-pointer hover:border-[#00FF7F] transition-all group">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-[#05070A] border border-[#1E252E] flex items-center justify-center text-[#8B949E] group-hover:text-[#00FF7F] font-bold">${c.name[0]}</div>
                    <div>
                        <div class="text-xs font-bold uppercase tracking-tighter text-white">${c.name}</div>
                        <div class="text-[9px] text-[#8B949E] uppercase tracking-widest">${c.bio[this.state.lang]}</div>
                    </div>
                </div>
                <div class="w-2 h-2 bg-[#00FF7F] rounded-full animate-pulse shadow-[0_0_8px_#00FF7F]"></div>
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
            <div class="flex flex-col h-[70vh]">
                <div class="flex items-center gap-4 mb-8">
                    <button onclick="Core.state.activeChatId=null; Core.renderView('dms')" class="text-[#8B949E] hover:text-white flex items-center gap-2 text-[10px] font-bold uppercase"><i data-lucide="arrow-left" class="w-4 h-4"></i> ${this.t('back')}</button>
                    <div class="h-4 w-px bg-[#1E252E]"></div>
                    <div class="text-xs font-bold text-[#00FF7F] uppercase tracking-widest">${c.name} // ${this.t('online')}</div>
                </div>
                <div class="flex-1 overflow-y-auto space-y-4 mb-6 pr-4 custom-scroll flex flex-col">
                    ${msgs.map(m => `
                        <div class="${m.from==='me'?'self-end text-right':'self-start text-left'} max-w-[80%]">
                            <div class="inline-block p-4 ${m.from==='me'?'bg-[#00FF7F]/10 border border-[#00FF7F]/30 text-white':'bg-[#1E252E] text-[#8B949E]'} text-sm">
                                ${m.text}
                            </div>
                            <div class="text-[8px] font-mono mt-1 opacity-40 uppercase">${m.time || ''}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="flex gap-4">
                    <input id="msg-in" class="flex-1 bg-[#0B0E14] border border-[#1E252E] p-5 text-sm outline-none focus:border-[#00FF7F] text-white" placeholder="Broadcast message...">
                    <button onclick="Core.sendMsg()" class="bg-[#00FF7F] text-[#05070A] px-10 font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all">${this.t('send')}</button>
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
        this.state.messages[id].push({ 
            from: 'me', 
            text: input.value, 
            time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
        });
        this.save();
        this.renderChat();
        input.value = '';
    },

    // --- СИСТЕМА ---
    renderSettings() {
        document.getElementById('view-container').innerHTML = `
            <div class="max-w-md mx-auto space-y-6">
                <button onclick="Core.toggleLang()" class="w-full bg-[#0B0E14] border border-[#1E252E] p-8 flex justify-between items-center hover:border-[#00FF7F] transition-all group">
                    <span class="text-[11px] font-extrabold uppercase tracking-widest group-hover:text-[#00FF7F]">${this.t('langBtn')}</span>
                    <span class="text-[#00FF7F] font-mono text-xs font-bold">${this.state.lang.toUpperCase()}</span>
                </button>
                <div class="h-px bg-[#1E252E] w-full"></div>
                <button onclick="localStorage.removeItem('ekhoo_session'); location.reload();" class="w-full bg-[#0B0E14] border border-[#1E252E] p-6 flex justify-between items-center hover:border-white transition-all text-[#8B949E] hover:text-white">
                    <span class="text-[10px] font-bold uppercase tracking-widest">${this.t('logout')}</span>
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                </button>
                <button onclick="localStorage.clear(); location.reload();" class="w-full bg-red-500/5 border border-red-500/20 p-6 flex justify-between items-center hover:bg-red-500 hover:text-white transition-all text-red-500 group">
                    <span class="text-[10px] font-bold uppercase tracking-widest">${this.t('reset')}</span>
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
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
        this.renderView('feed');
    },

    openReply(id) { 
        this.state.activeReplyId = id; 
        document.getElementById('reply-modal').classList.remove('hidden'); 
    },
    closeReply() { document.getElementById('reply-modal').classList.add('hidden'); },
    submitReply() {
        const txt = document.getElementById('reply-input').value;
        if(!txt) return;
        const p = this.state.posts.find(x => x.id === this.state.activeReplyId);
        if(!p.replies) p.replies = [];
        p.replies.push({ author: this.state.user.name, text: txt });
        this.save();
        this.closeReply();
        this.renderView('feed');
    }
};

window.onload = () => Core.init();