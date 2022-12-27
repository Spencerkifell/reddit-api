import Exception from './Exception';

export default class HttpException extends Exception {
    constructor(message: string) {
        super(message, HttpException);
    }
}