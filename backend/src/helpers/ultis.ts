const bcrypt = require('bcrypt');
const saltRounds = 10;

export const hashDataHelper = async (plainData: string) => {
  try {
    return await bcrypt.hash(plainData, saltRounds);
  } catch (error) {
    console.log(error);
  }
};

export const compareHashedDataHelper = async (
  plainData: string,
  hashedData: string,
) => {
  try {
    return await bcrypt.compare(plainData, hashedData);
  } catch (error) {
    console.log(error);
  }
};
