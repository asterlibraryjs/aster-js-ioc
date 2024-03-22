/** Enumerate all available scopes */
export enum ServiceLifetime {
    /** New instance injected on each context */
    transient,
    /** Will create new instance on each scope */
    scoped,
    /** Avalaible to current scope and all children */
    singleton
}

/** Enumerate all available scopes */
export enum ServiceScope {
    /** The service is only available in current container */
    container = 0x1,

    /** The service is only available for children of current container */
    children = 0x2,

    /** The service is available for current container and its children */
    both = container | children
}
