export class DateHelper {
  static today(format: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' = 'DD/MM/YYYY'): string {
    return this.formatDate(new Date(), format);
  }

  static addDays(days: number, from = new Date()): string {
    const d = new Date(from);
    d.setDate(d.getDate() + days);
    return this.formatDate(d);
  }

  static formatDate(date: Date, format = 'DD/MM/YYYY'): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear());
    return format.replace('DD', dd).replace('MM', mm).replace('YYYY', yyyy);
  }
}

export class StringHelper {
  static randomAlpha(length: number): string {
    return Array.from({ length }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26)),
    ).join('');
  }

  static randomNumeric(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }

  static randomAlphanumeric(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  static generatePAN(): string {
    return `${this.randomAlpha(5)}${this.randomNumeric(4)}${this.randomAlpha(1)}`.toUpperCase();
  }

  static generateMobile(): string {
    const prefixes = ['6', '7', '8', '9'];
    return prefixes[Math.floor(Math.random() * prefixes.length)] + this.randomNumeric(9);
  }

  static generateIFSC(): string {
    return `${this.randomAlpha(4)}0${this.randomAlphanumeric(6)}`.toUpperCase();
  }
}

export class NumberHelper {
  static formatCurrency(amount: number, locale = 'en-IN', currency = 'INR'): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  }

  static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
