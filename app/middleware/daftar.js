export default {
    handler : async (sock, m, $next, command) => {
        if(m.fromMe) return $next
        
        // if user not register and try command bot
        if (!m.db?.user && m.body.prefix) {
            // console.log(m);
        }
        
        return $next;
    }
}