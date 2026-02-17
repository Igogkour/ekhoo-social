const CONFIG = {
    version: "9.0.6 MONOLITH UI",
    languages: ["ru", "en"],
    menu: [
        { id: 'feed', icon: 'zap', label: { ru: 'Волны', en: 'Waves' } },
        { id: 'news', icon: 'globe', label: { ru: 'Новости', en: 'News' } },
        { id: 'dms', icon: 'message-square', label: { ru: 'Каналы', en: 'Channels' } },
        { id: 'profile', icon: 'user', label: { ru: 'Профиль', en: 'Profile' } },
        { id: 'settings', icon: 'sliders', label: { ru: 'Система', en: 'System' } }
    ],
    contacts: [
        { id: 'root', name: 'ROOT_ADMIN', bio: { ru: 'Системный страж', en: 'System Guardian' } },
        { id: 'echo', name: 'ECHO_BOT', bio: { ru: 'Нейро-ретранслятор', en: 'Neural Repeater' } }
    ],
    news: [
        { 
            id: 1, 
            date: "17.02.2026", 
            title: { ru: "Интерфейс Монолита", en: "Monolith Interface" },
            content: { ru: "Профиль оператора обновлен в соответствии с протоколами дизайна 0.8.9.", en: "Operator profile updated according to 0.8.9 design protocols." }
        }
    ],
    translations: {
        ru: {
            placeholder: "Что транслируете в эфир?",
            emit: "Излучить",
            echo: "ЭХО",
            reply: "ОТВЕТИТЬ",
            search: "Поиск операторов...",
            bio: "БИОГРАФИЯ",
            birth: "ДАТА РОЖДЕНИЯ",
            save: "СОХРАНИТЬ ИЗМЕНЕНИЯ",
            logout: "ВЫЙТИ ИЗ СИСТЕМЫ",
            reset: "ПОЛНЫЙ СБРОС ДАННЫХ",
            langBtn: "ПРОТОКОЛ ЯЗЫКА",
            online: "В СЕТИ",
            stats_waves: "ВОЛНЫ",
            stats_echoes: "РЕАКЦИИ",
            back: "НАЗАД",
            send: "ОТПРАВИТЬ",
            news_title: "АРХИВ НОВОСТЕЙ",
            time_now: "СЕЙЧАС",
            // Новые ключи для профиля 0.8.9
            edit_profile: "РЕДАКТИРОВАТЬ ПРОФИЛЬ",
            waves_by_operator: "ВОЛНЫ ОПЕРАТОРА",
            destruct: "УНИЧТОЖИТЬ",
            cancel: "ОТМЕНА"
        },
        en: {
            placeholder: "What are you broadcasting?",
            emit: "Emit",
            echo: "ECHO",
            reply: "REPLY",
            search: "Search operators...",
            bio: "BIOGRAPHY",
            birth: "DATE OF BIRTH",
            save: "SAVE CHANGES",
            logout: "LOGOUT",
            reset: "FULL SYSTEM RESET",
            langBtn: "LANGUAGE PROTOCOL",
            online: "ONLINE",
            stats_waves: "WAVES",
            stats_echoes: "ECHOES",
            back: "BACK",
            send: "SEND",
            news_title: "NEWS ARCHIVE",
            time_now: "NOW",
            // New keys for 0.8.9 profile
            edit_profile: "EDIT PROFILE",
            waves_by_operator: "WAVES BY OPERATOR",
            destruct: "DESTRUCT",
            cancel: "CANCEL"
        }
    }
};