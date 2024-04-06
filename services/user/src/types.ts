export interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export type ExtendedUserData = Omit<UserData, 'password'> & {
  id: string;
};

export interface LoginData {
  email: string;
  password: string;
}
