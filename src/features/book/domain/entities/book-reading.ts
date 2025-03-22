export class BookReading {
  constructor(
    public id: string,
    public bookId: string,
    public userId: string,
    public currentPage: number,
    public progress: number,
    public isFinished: boolean,
    public lastRead: Date,
    public title?: string,
    public cover?: string,
    public author?: {
      id: string;
      name: string;
    },
  ) {}
}
