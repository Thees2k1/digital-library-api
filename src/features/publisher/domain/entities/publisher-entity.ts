export class PublisherEntity {
  id: string;
  name: string;
  cover: string | null;
  contactInfo: string | null;
  address: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(
    id: string,
    name: string,
    cover: string | null,
    contactInfo: string | null,
    address: string | null,
    createdAt: Date | null,
    updatedAt: Date | null,
  ) {
    this.id = id;
    this.name = name;
    this.cover = cover;
    this.contactInfo = contactInfo;
    this.address = address;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
