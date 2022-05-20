import { clearDatabase } from './database/database';
import { clearStorage } from '../utility/storage';

export const clearLocal = async () => {
  clearStorage();
  await clearDatabase();
};

export const forceLogout = async authContext => {
  await clearLocal();
  authContext.logout();
};
