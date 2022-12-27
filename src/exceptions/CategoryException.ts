import Exception from './Exception';

export default class CategoryException extends Exception {
    constructor(message: string) {
        super(message, CategoryException);
    }
}