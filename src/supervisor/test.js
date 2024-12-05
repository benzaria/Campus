
import fs from 'fs'

export const echo = (...args) => console.log(...args);
/*
return
echo(JSON.parse(fs.readFileSync(new URL('toast.json', import.meta.url), 'utf-8')).YesNo)
const ar = ["a", "b", "c"]
echo(ar.join(''))

const obj = {
    "dd": [
        {
            "title": "ddd",
            "msg": "dd"
        },
        {
            "title": "ggg",
            "msg": "gg"
        }
    ],
    "00|08|03|12": [
        {
            "title": "fff",
            "msg": "ff"
        },
        {
            "title": "hhh",
            "msg": "hh"
        }
    ]
}

//for (const key in obj) {
//    const spl = key.split('|').filter(el => el);
//    console.log(key, spl);
//
//}
*/