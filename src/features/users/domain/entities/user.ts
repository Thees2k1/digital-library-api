export class UserEntity {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string | null,
    public email: string,
    public password: string,
    public permission: number,
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
      data.permission,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}

