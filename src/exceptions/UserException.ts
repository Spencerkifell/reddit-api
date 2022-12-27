import Exception from './Exception';

export default class UserException extends Exception {
    constructor(message: string) {
        super(message, UserException);
    }
}