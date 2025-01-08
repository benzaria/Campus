import $ from 'jquery';
import { $DOM, $root, icons, fs, path } from "./utils/global";
import './utils/startup';
import './dev/dev';


$(async function () {
    const tree = await fs.read('data/tree.json')

    generate('module', tree).catch(console.error)

});



function toggleBurger() {
    $('.navbar-burger').toggleClass('is-active');
    $('.navbar-menu').toggleClass('is-active');
}

function togglePasseye() {
    $('span.is-passeye i').toggleClass('fa-eye')
    const $input = $('span.is-passeye').siblings('input');
    $input.attr('type', $input.attr('type') === 'text' ? 'password' : 'text');
}


async function generate(sidebar = 'module', tree) {
    if (sidebar === 'module') {
        const $sidebar = $('div#module')
        const $tree = $('<ul class="tree-menu menu px-2 my-2 has-text-light-dark">')
        const $p = $('<p class="tree-label menu-label my-2 has-text-light-dark">').text('module')
        const $ul = $('<ul class="tree-list menu-list">')
        $ul.append($p, await renderTree(tree))
        $tree.append($ul)
        $sidebar.append($tree)
    }
}

async function renderTree(tree) {
    const $tree = $('<ul>')

    for (const key in tree) {
        const { _id, _type, _files } = tree[key]
        const icon = icons[_type] ? icons[_type] : icons['file']
        const $li = $('<li>')
        const $a = $('<a>').addClass(`is-${icon.split('-')[0]}`).data('_id', _id) //.attr('id', _id)
        const $span = $('<span>').addClass('icon-text')
        const $icon_pri = $('<span>').addClass('icon').append(`<i class="fas fa-${icon} ${icon === 'folder' ? 'pr-1' : null}"></i>`)

        if (icon === 'folder') {
            const $icon_sec = $('<span>').addClass('icon').append(`<i class="fas fa-angle-right"></i>`)
            $span.append($icon_sec)
        }

        $span.append($icon_pri, key)
        $a.append($span)

        $a.on('click', () => {
            $a.toggleClass('is-active-1')
            $a
                .find(`i.fa-angle-right`).toggleClass('fa-angle-down').end()
                .find(`i.fa-folder`).toggleClass('fa-folder-open');
            $li.children('ul').toggle()
        })

        $li.append($a, icon === 'folder' ? await renderTree(_files) : null)
        $li.children('ul').toggle()
        $tree.append($li)
    }

    return $tree;
}
