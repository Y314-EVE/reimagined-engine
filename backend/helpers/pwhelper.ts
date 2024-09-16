import bcrypt from "bcrypt";

export const hashMaker = (pwstr: string) => {
  const salt = bcrypt.genSaltSync(12);
  return bcrypt.hashSync(pwstr, salt);
};

export const hashCompare = (pwstr: string, hash: string) => {
  return bcrypt.compareSync(pwstr, hash);
};
