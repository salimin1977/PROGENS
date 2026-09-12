import type { Rng } from '../random';
import { randChoice } from '../random';

export type Gender = 'Male' | 'Female';

const MALAY_MALE_FIRST = ['Aiman', 'Danial', 'Haziq', 'Iskandar', 'Zulkarnain', 'Amir', 'Farid', 'Hakim', 'Rayyan', 'Syafiq', 'Danish', 'Airil', 'Fenriz', 'Akmal'];
const MALAY_FEMALE_FIRST = ['Nur Aisyah', 'Siti Hajar', 'Nurul Ain', 'Aleesya', 'Farah Diana', 'Batrisyia', 'Nadia', 'Alia', 'Sofea', 'Iman', 'Sofeya', 'Airis Hana', 'Juwita Zahra'];
const MALAY_LAST_M = ['bin Rahman', 'bin Ismail', 'bin Yusof', 'bin Hassan', 'bin Ahmad', 'bin Kassim', 'bin Zainal', 'bin Osman', 'bin Azlan', 'bin Zariman'];
const MALAY_LAST_F = ['binti Rahman', 'binti Ismail', 'binti Yusof', 'binti Hassan', 'binti Ahmad', 'binti Kassim', 'binti Zainal', 'binti Osman', 'binti Mazlan', 'binti Adli'];

const CHINESE_FIRST = ['Wei Jian', 'Mei Ling', 'Jia Hui', 'Kai Xin', 'Zhi Hao', 'Xin Yi', 'Yong Jie', 'Li Wen', 'Chen Hao', 'Hui Min'];
const CHINESE_LAST = ['Tan', 'Lim', 'Lee', 'Wong', 'Chong', 'Ng', 'Chan', 'Ooi', 'Teoh', 'Yap'];

const INDIAN_MALE_FIRST = ['Arjun', 'Vishal', 'Karthik', 'Dinesh', 'Suresh', 'Prakash', 'Ravin', 'Naveen'];
const INDIAN_FEMALE_FIRST = ['Priya', 'Divya', 'Kavitha', 'Meera', 'Shalini', 'Ananya', 'Nisha', 'Lavanya'];
const INDIAN_LAST_M = ['a/l Muthu', 'a/l Kumar', 'a/l Raj', 'a/l Samy', 'a/l Perumal'];
const INDIAN_LAST_F = ['a/p Muthu', 'a/p Kumar', 'a/p Raj', 'a/p Samy', 'a/p Perumal'];

export function generateName(rng: Rng, gender: Gender): string {
  const roll = rng();
  if (roll < 0.6) {
    return gender === 'Male'
      ? `${randChoice(rng, MALAY_MALE_FIRST)} ${randChoice(rng, MALAY_LAST_M)}`
      : `${randChoice(rng, MALAY_FEMALE_FIRST)} ${randChoice(rng, MALAY_LAST_F)}`;
  }
  if (roll < 0.85) {
    return `${randChoice(rng, CHINESE_FIRST)} ${randChoice(rng, CHINESE_LAST)}`;
  }
  return gender === 'Male'
    ? `${randChoice(rng, INDIAN_MALE_FIRST)} ${randChoice(rng, INDIAN_LAST_M)}`
    : `${randChoice(rng, INDIAN_FEMALE_FIRST)} ${randChoice(rng, INDIAN_LAST_F)}`;
}

export function initialsOf(name: string): string {
  const parts = name.split(' ').filter((p) => !['bin', 'binti', 'a/l', 'a/p'].includes(p));
  return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}
