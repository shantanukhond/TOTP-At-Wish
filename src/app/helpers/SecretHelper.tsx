import { TOTP } from 'otpauth';


export const validateTotpSecret = (secret:string) => {
  try {
    // Attempt to create a TOTP object
    const totp = new TOTP({
      secret, // The secret to validate
      digits: 6, // Default TOTP digits
      period: 30, // Default TOTP period
    });

    const base32Regex = /^[A-Z2-7]+=*$/; // Base32 character set with optional padding
    if(secret.length >= 16 && base32Regex.test(secret.toUpperCase())){
      totp.generate();
      // console.log(gen_secret)
      return true;
    }else{
      return false
    }

  } catch (error) {
    return false;
  }
};

