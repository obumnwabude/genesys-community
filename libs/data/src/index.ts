export const constants = {
  LIGHT_MODE: 'light_mode',
  DARK_MODE: 'dark_mode',
  THEMES: ['light_mode', 'dark_mode'],
  DEFAULT_THEME: 'light_mode',
  LOCALSTORAGE_THEME_KEY: 'theme'
};

export interface AuthMember {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber: string;
}
