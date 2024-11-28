export abstract class BaseInteractor {
  abstract execute(): Promise<void>;
}
