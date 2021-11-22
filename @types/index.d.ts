import _fetch, {Response} from "node-fetch";

type NodeFetch = typeof _fetch;

/**
 * @param cookieJars A {@link CookieJar} instance, an array of CookieJar instances or null, if you don't want to send or store cookies.
 * @params `url` and `options` as in https://github.com/node-fetch/node-fetch#fetchurl-options
 * @returns Returns a Promise resolving to a {@link Response} instance on success.
 */
export default function fetch(
    cookieJars: CookieJar | CookieJar[] | null,
    ...nodeFetchParams: Parameters<NodeFetch>
): Promise<Response>;

export {fetch};

/**
 * A class that stores cookies.
 */
export class CookieJar {
    flags: string; // The read/write flags as specified below.
    file: string; // The path of the cookie jar on the disk.
    /**
     * A {@link Map} mapping hostnames to maps, which map cookie names to the respective {@link Cookie} instance.
     */
    cookies: Map<string, Map<string, Cookie>>;
    cookieIgnomeCallback: (cookie: Cookie, reason: string) => void; // The callback function passed to `new CookieJar()`, that is called whenever a cookie couldn't be parsed.x

    /**
     *
     * @param file An optional string containing a relative or absolute path to the file on the disk to use.
     * @param flags  An optional string specifying whether cookies should be read and/or written from/to the jar when passing it as parameter to fetch. Default: `rw`
     * @param cookies An optional initializer for the cookie jar - either an array of {@link Cookie} instances or a single Cookie instance.
     * @param cookieIgnoreCallback An optional callback function which will be called when a cookie is ignored instead of added to the cookie jar.
     *    - `cookie` The cookie string
     *    - `reason` A string containing the reason why the cookie has been ignored
     */
    constructor(
        file?: string,
        flags?: "r" | "w" | "rw" | "wr",
        cookies?: Cookie | Cookie[],
        cookieIgnoreCallback?: (cookie: Cookie, reason: string) => void
    );

    /**
     * Adds a cookie to the jar.
     * @param cookie  A {@link Cookie} instance to add to the cookie jar. Alternatively this can also be a string, for example a serialized cookie received from a website. In this case `fromURL` must be specified.
     * @param fromURL The url a cookie has been received from.
     * @returns Returns `true` if the cookie has been added successfully. Returns `false` otherwise.
If the parser throws a {@link CookieParseError}, it will be caught and `cookieIgnoreCallback` will be called with the respective cookie string and error message.
     */
    addCookie(cookie: Cookie | string, fromURL?: string): boolean;

    /**
     * @returns Returns an iterator over all domains currently stored cookies for.
     */
    domains(): Iterator<Map<string, Cookie>>;

    /**
     * @returns Returns an iterator over all cookies currently stored for `domain`.
     */
    cookiesDomain(domain: string): Generator<Cookie>;

    /**
     * @param withSession A boolean. Iterator will include session cookies if set to `true`.
     * @returns Returns an iterator over all valid (non-expired) cookies.
     */
    cookiesValid(withSession: boolean): Generator<Cookie>;

    /**
     * @returns Returns an iterator over all cookies currently stored.
     */
    cookiesAll(): Generator<Cookie>;

    /**
     * @returns Returns an iterator over all cookies valid for a request to `url`.
     */
    cookiesValidForRequest(requestURL: string): Generator<Cookie>;

    /**
     * Removes all expired cookies from the jar.
     * @param sessionEnded A boolean. Also removes session cookies if set to `true`.
     */
    deleteExpired(sessionEnded: boolean): void;

    /**
     * Reads cookies from `file` on the disk and adds the contained cookies.
     * @param file Path to the file where the cookies should be saved. Default: `this.file`, the file that has been passed to the constructor.
     */
    load(file?: string): Promise<void>;

    /**
     * Saves the cookie jar to `file` on the disk. Only non-expired non-session cookies are saved.
     * @param file Path to the file where the cookies should be saved. Default: `this.file`, the file that has been passed to the constructor.
     */
    save(file?: string): Promise<void>;
}

interface ICookie {
    name: string;
    value: string;
    expiry: Date | null;
    domain: string;
    path: string;
    secure: boolean;
    subdomains: boolean;
}

/**
 * An abstract representation of a cookie.
 */
export class Cookie {
    name: string; // The identifier of the cookie.
    value: string; // The value of the cookie.
    /**
     * A {@link Date} object of the cookies expiry date or `null`, if the cookie expires with the session.
     */
    expiry: Date | null;
    domain: string; // The domain the cookie is valid for.
    path: string; // The path the cookie is valid for.
    secure: boolean; // A boolean value representing the cookie's secure attribute. If set the cookie will only be used for `https` requests.
    subdomains: boolean; // A boolean value specifying whether the cookie should be used for requests to subdomains of `domain` or not.

    /**
     * Creates a cookie instance from the string representation of a cookie as send by a webserver.
     * @param str The string representation of a cookie.
     * @param requestURL The url the cookie has been received from.
     * @throws Will throw a {@link CookieParseError} if `str` couldn't be parsed.
     */
    constructor(str: string, requestURL: string);

    /**
     * Creates a cookie instance from an already existing object with the same properties.
     */
    static fromObject(obj: ICookie): Cookie;

    /**
     * Serializes the cookie, transforming it to `name=value` so it can be used in requests.
     */
    serialize(): string;

    /**
     * @param sessionEnded A boolean that specifies whether the current session has ended, meaning if set to `true`, the function will return `true` for session cookies.
     * @returns Returns whether the cookie has expired or not.
     */
    hasExpired(sessionEnded: boolean): boolean;

    /**
     * @returns Returns whether the cookie is valid for a request to `url`.
     */
    isValidForRequest(requestURL: string): boolean;
}

/**
 * The Error that is thrown when the cookie parser located in the constructor of the {@link Cookie} class is unable to parse the input.
 */
export class CookieParseError extends Error {}
