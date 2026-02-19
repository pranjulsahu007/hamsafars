import { UserProfile } from '../types';

const DB_KEY = 'unimatch_db_v1';

interface DB {
  users: Record<string, UserProfile>;
}

const getDB = (): DB => {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    return { users: {} };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { users: {} };
  }
};

const saveDB = (db: DB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const loginUser = (rollNumber: string): UserProfile => {
  const db = getDB();
  if (!db.users[rollNumber]) {
    db.users[rollNumber] = {
      rollNumber,
      choices: [],
    };
    saveDB(db);
  }
  return db.users[rollNumber];
};

export const saveChoices = (rollNumber: string, choices: string[]): UserProfile => {
  const db = getDB();
  // Ensure we don't modify other fields if they existed
  const existing = db.users[rollNumber] || { rollNumber, choices: [] };
  
  // Clean inputs: trim, lowercase for matching consistency
  const cleanChoices = choices
    .map(c => c.trim())
    .filter(c => c !== '' && c !== rollNumber); // Remove self-selection and empty

  // Enforce exactly 3 constraint logic is handled in UI, but storage accepts valid array
  db.users[rollNumber] = {
    ...existing,
    choices: cleanChoices,
  };
  saveDB(db);
  return db.users[rollNumber];
};

export const findMatches = (currentUserRoll: string): string[] => {
  const db = getDB();
  const currentUser = db.users[currentUserRoll];
  
  if (!currentUser || !currentUser.choices || currentUser.choices.length === 0) {
    return [];
  }

  const matches: string[] = [];

  // A match is when Current User picks Target, AND Target picks Current User
  currentUser.choices.forEach(targetRoll => {
    const targetUser = db.users[targetRoll];
    if (targetUser && targetUser.choices.includes(currentUserRoll)) {
      matches.push(targetRoll);
    }
  });

  return matches;
};

// Helper to simulate "Other" users for demo purposes if DB is empty
export const seedDemoData = () => {
  const db = getDB();
  if (Object.keys(db.users).length === 0) {
    const demoUsers = [
      { rollNumber: '101', choices: ['102', '103', '104'] },
      { rollNumber: '102', choices: ['101', '105', '106'] }, // Match with 101
      { rollNumber: '103', choices: ['107', '108', '109'] }, // No match with 101
    ];
    demoUsers.forEach(u => {
      db.users[u.rollNumber] = u;
    });
    saveDB(db);
  }
};
