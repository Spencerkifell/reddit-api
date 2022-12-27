import Exception from './Exception';

export default class CommentException extends Exception {
    constructor(message: string) {
        super(message, CommentException);
    }
}