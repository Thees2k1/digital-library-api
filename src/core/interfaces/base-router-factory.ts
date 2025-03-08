import { Router } from 'express';

export abstract class BaseRouterFactory<T> {
  protected _router: Router;
  protected controller: T;

  constructor(controller: T) {
    this._router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  abstract setupRoutes(): void;

  get router(): Router {
    return this._router;
  }
}
