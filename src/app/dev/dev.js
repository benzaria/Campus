import $ from 'jquery';
import axios from 'axios';
import { __dirname, $DOM, $root, fs, path } from '../utils/global'

const log = console.log;

(async () => {

    async function test() {

        log(await fs.delete())

        const tree = await fs.read('data/form.json')

        log('list', await fs.list())
        log('read', tree)

    }

    test();


})()


