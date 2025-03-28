import z from 'zod';
export class UserEntity {
  constructor(
    public id: string,
    public firstName: string,
    public lastName: string | null,
    public email: string,
    public avatarUrl: string,
    public password: string,
    public role: 'user' | 'admin',
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  public static fromJson(data: any): UserEntity {
    //TODO: Add validation

    return new UserEntity(
      data.id,
      data.firstName,
      data.lastName,
      data.email,
      data.password,
      data.role,
      data.avatarUrl,
      new Date(data.createdAt),
      new Date(data.updatedAt),
    );
  }

  public static parse(data: any): UserEntity {
    return UserEntitySchema.parse(data);
  }
}

const UserEntitySchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  email: z.string().email(),
  password: z.string(),
  role: z.union([z.literal('user'), z.literal('admin')]),
  avatarUrl: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
