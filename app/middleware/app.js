export const middleware = new Map();

middleware.set('daftar.js',await import('./daftar.js'));
middleware.set('antilink.js', await import("./antilink.js"));
middleware.set('bot-mode.js',await import("./bot-mode.js"));
middleware.set('group-mode.js',await import("./group-mode.js"));