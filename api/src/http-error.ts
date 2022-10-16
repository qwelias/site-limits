export class HTTPError extends Error {
    override name = 'HTTPError'

    constructor(
        override readonly message: string,
        readonly status: number = 500,
        override readonly cause?: string,
    ) {
        super(message)
    }
}
