// Try multiple import approaches
let SQLite: any;

try {
  SQLite = require('expo-sqlite');
} catch (error) {
  try {
    const { openDatabaseAsync, openDatabaseSync } = require('expo-sqlite');
    SQLite = { openDatabaseAsync, openDatabaseSync };
  } catch (error2) {
    // SQLite import failed
  }
}

export async function testSQLiteBasic(): Promise<void> {
  try {
    if (!SQLite) {
      throw new Error('SQLite library not available');
    }
    
    const testDbName = 'test.db';
    
    if (!testDbName || typeof testDbName !== 'string') {
      throw new Error('Invalid test database name');
    }
    
    // Try different methods
    if (SQLite.openDatabaseAsync) {
      const db = await SQLite.openDatabaseAsync(testDbName);
      // Database opened successfully
    } else if (SQLite.openDatabaseSync) {
      const db = SQLite.openDatabaseSync(testDbName);
      // Database opened successfully
    } else {
      throw new Error('No compatible SQLite open method available');
    }
    
  } catch (error) {
    console.error('❌ SQLite test failed:', error);
    throw error;
  }
}