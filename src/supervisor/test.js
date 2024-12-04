
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

for (const key in obj) {
    const spl = key.split('|').filter(el => el);
    console.log(key, spl);

}
