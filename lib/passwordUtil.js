import bcrypt from "bcrypt";
export const generatePassword = async (bodyPassword) => {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(bodyPassword, salt)
    return password;
}
