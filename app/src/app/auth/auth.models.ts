export interface UserProfile {
  id: number;
  email: string;
  displayName: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}
