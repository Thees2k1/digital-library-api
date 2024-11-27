import { z } from "zod";
export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string().nullable(),
  avatar: z.string().nullable(),
  role: z.string().optional(),
});

export const UpdateUserSchema = CreateUserSchema.extend({id: z.string()});

interface CreateUserDto extends z.infer<typeof CreateUserSchema> {}

interface UpdateUserDto extends z.infer<typeof UpdateUserSchema> {}


interface User{
    id:string,
    email:string,
    firstName:string,
    lastName:string,
    avatarUrl:string,
}

interface Response<T>{
    message:string
    data:T
}

interface UserResponse extends Response<User>{
}

interface UpdateUserResponse extends Response<string>{}

interface DeleteUserResponse extends Response<string>{}

interface ListUserResponse extends Response<User[]>{}

export {CreateUserDto,UpdateUserDto,UserResponse, ListUserResponse,User,UpdateUserResponse,DeleteUserResponse}

