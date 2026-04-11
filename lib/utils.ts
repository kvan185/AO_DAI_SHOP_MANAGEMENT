export function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Normalize to decompose combined characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[đĐ]/g, 'd') // Replace Vietnamese character 'đ'
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}
