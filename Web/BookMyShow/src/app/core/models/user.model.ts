export enum UserRole {
  Customer = 0,
  Admin = 1,
  VenueManager = 2
}

export interface User {
  id: string; // Guid
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}