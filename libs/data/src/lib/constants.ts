export const constants = {
  DARK_MODE: 'dark_mode',
  DEFAULT_ORDER_BY: 'authInfo.lastSignInTime',
  DEFAULT_ORDER_DIRECTION: 'desc',
  DEFAULT_PAGE_SIZE: 50,
  DEFAULT_THEME: 'light_mode',
  LIGHT_MODE: 'light_mode',
  LOCALSTORAGE_ORDER_BY_KEY: 'order_by',
  LOCALSTORAGE_ORDER_DIRECTION_KEY: 'order_direction',
  LOCALSTORAGE_THEME_KEY: 'theme',
  ORDER_BY_OPTIONS: [
    { value: 'stats.achievements', viewValue: 'Achievement Count' },
    { value: 'authInfo.creationTime', viewValue: 'Creation Time' },
    { value: 'profile.department', viewValue: 'Department' },
    { value: 'authInfo.email', viewValue: 'Email' },
    { value: 'profile.faculty', viewValue: 'Faculty' },
    { value: 'profile.gender', viewValue: 'Gender' },
    { value: 'authInfo.lastSignInTime', viewValue: 'Last Sign In Time' },
    { value: 'profile.level', viewValue: 'Level' },
    { value: 'authInfo.displayName', viewValue: 'Name' },
    { value: 'authInfo.phoneNumber', viewValue: 'Phone Number' },
    { value: 'stats.progress', viewValue: 'Progress Count' },
    { value: 'profile.twitter', viewValue: 'Twitter' },
    { value: 'authInfo.uid', viewValue: 'User Id' }
  ],
  ORDER_DIRECTION_OPTIONS: [
    { value: 'asc', viewValue: 'Ascending' },
    { value: 'desc', viewValue: 'Descending' }
  ],
  THEMES: ['light_mode', 'dark_mode']
};
