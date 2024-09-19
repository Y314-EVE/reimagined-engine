import argon2 from "argon2";

export const hashMaker = (pwstr: string) => {
  const hashedPw = argon2.hash(pwstr);

  return hashedPw;
};

export const hashCompare = (hash: string, pwstr: string) => {
  return argon2.verify(hash, pwstr);
};
