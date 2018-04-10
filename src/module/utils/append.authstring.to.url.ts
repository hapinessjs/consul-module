export function appendAuthStringToUrl(authString: string, url: string): string {
    // No auth string provided, just return the url
    if (!authString || !authString.length) {
        return url;
    }

    // Auth string already in url, skipping
    if (url.split('@').length > 1) {
        return url;
    }

    const splitted = url.split('://');
    splitted.splice(0, 1, `${splitted[0]}://`);
    splitted.splice(1, 0, `${authString}@`);

    return splitted.join('');
}
