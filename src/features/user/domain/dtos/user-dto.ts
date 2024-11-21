interface CreateUserDto{
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
}

interface UpdateUserDto{
    id:string;
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
}

export {CreateUserDto,UpdateUserDto}

