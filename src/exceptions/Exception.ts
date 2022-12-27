export default class Exception extends Error {
    constructor(message: string, exception: any) {
        super(message);
        Error.captureStackTrace(this, exception);
        this.name = exception.name;
    }
}