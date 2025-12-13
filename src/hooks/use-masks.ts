export const masks = {
  cpf: (value: string): string => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  },

  phone: (value: string): string => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  },

  cep: (value: string): string => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  },

  imei: (value: string): string => {
    return value.replace(/\D/g, "").slice(0, 15);
  },

  currency: (value: string): string => {
    const numericValue = value.replace(/\D/g, "");
    const number = parseInt(numericValue, 10) / 100;
    if (isNaN(number)) return "";
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  currencyToNumber: (value: string): number => {
    const numericValue = value.replace(/\D/g, "");
    return parseInt(numericValue, 10) / 100 || 0;
  },

  numberToCurrency: (value: number): string => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  date: (value: string): string => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{4})\d+?$/, "$1");
  },
};

export const validators = {
  cpf: (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf[10])) return false;

    return true;
  },

  phone: (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length === 11;
  },

  cep: (cep: string): boolean => {
    const cleanCep = cep.replace(/\D/g, "");
    return cleanCep.length === 8;
  },

  imei: (imei: string): boolean => {
    const cleanImei = imei.replace(/\D/g, "");
    return cleanImei.length === 15;
  },

  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};
