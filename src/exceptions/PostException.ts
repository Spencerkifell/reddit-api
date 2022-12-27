import Exception from './Exception';

export default class PostException extends Exception {
    constructor(message: string) {
        super(message, PostException);
    }
}