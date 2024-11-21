export class UserEntity {
  constructor(
    public id: string,
    public firstName: string,
    public lastName: string | null,
    public email: string,
    public password: string,
    public role: 'user'|'admin',
    public createdAt: Date,
    public updatedAt: Date
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
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}



