export type SignUpValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
};

export type PersonalDetailsErrors = Partial<Record<'firstName' | 'lastName' | 'phone', string>>;
export type CredentialsErrors = Partial<Record<'email' | 'password' | 'confirmPassword' | 'terms', string>>;
