import { type StatusCodes } from 'http-status-codes';  
  
export interface ValidationType {  
 fields: string[];  
 constraint: string;  
}  

export class ValidationError extends Error {  
    public readonly statusCode: StatusCodes;  
    public readonly validationErrors: ValidationType[];  
     
    constructor(validationErrors: ValidationType[]) {  
     super('Validation Error');  
     Object.setPrototypeOf(this, new.target.prototype);  
     this.statusCode = 400;  
     this.validationErrors = validationErrors;  
     Error.captureStackTrace(this);  
    }  
   }