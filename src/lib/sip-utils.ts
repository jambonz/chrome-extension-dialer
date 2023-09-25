function normalizeNumber(number: string): string {
    if (/^(sips?|tel):/i.test(number)) {
        return number;
    } else if (/@/i.test(number)) {
        return number;
    } else {
        return number.replace(/[()\-. ]*/g, '');
    }
}

function randomId(prefix: string): string {
    const id: string = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    if (prefix) {
        return `${prefix}-${id}`;
    } else {
        return id;
    }
}

export {
    normalizeNumber,
    randomId
}