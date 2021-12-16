
function hexToString(text) {
    return Buffer.from(text.replace(/^0x/, ''), 'hex').toString()
}

let str = '0x726d726b';
console.log(hexToString(str));

str='0x524d524b';
console.log(hexToString(str));