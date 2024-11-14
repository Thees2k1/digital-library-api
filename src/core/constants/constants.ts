export const VERSION_PREFIX = "/v1";

export const ONE_THOUSAND = 1000;
export const ONE_HUNDRED = 100;
export const SIXTY = 60;


export const INTERFACE_TYPE ={
    ProductRepository: Symbol.for("ProductRepository"),
    ProductInteractor: Symbol.for("ProductInteractor"),
    ProductController: Symbol.for("ProductController"),
    Mailer: Symbol.for("Mailer"),
    MessageBroker: Symbol.for("MessageBroker"),
}