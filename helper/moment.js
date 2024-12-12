import moments from "moment-timezone";

export let moment = moments.tz.setDefault(process.env.TZ || 'Asia/Jakarta');