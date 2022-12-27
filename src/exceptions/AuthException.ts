import Exception from "./Exception";

export default class AuthException extends Exception {
    constructor(message: string) {
        super(message, AuthException);
    }
}