// Try multiple import approaches
let SQLite: any;

try {
  console.log('🧪 Trying default import...');
  SQLite = require('expo-sqlite');
  console.log('✅ Default import successful');
} catch (error) {
  console.log('❌ Default import failed:', error?.message);
  try {
    console.log('🧪 Trying named import...');
    const { openDatabaseAsync, openDatabaseSync } = require('expo-sqlite');
    SQLite = { openDatabaseAsync, openDatabaseSync };
    console.log('✅ Named import successful');
  } catch (error2) {
    console.log('❌ Named import failed:', error2?.message);
  }
}

export async function testSQLiteBasic(): Promise<void> {
  try {
    console.log('🧪 Testing basic SQLite functionality...');
    console.log('SQLite object:', SQLite);
    console.log('SQLite type:', typeof SQLite);
    console.log('Available SQLite methods:', SQLite ? Object.keys(SQLite) : 'SQLite is null/undefined');
    
    if (!SQLite) {
      throw new Error('SQLite library not available');
    }
    
    // Test database name validation
    const testDbName = 'test.db';
    console.log('🧪 Test database name:', testDbName);
    console.log('🧪 Test database name type:', typeof testDbName);
    
    if (!testDbName || typeof testDbName !== 'string') {
      throw new Error('Invalid test database name');
    }
    
    // Try different methods
    if (SQLite.openDatabaseAsync) {
      console.log('🧪 Attempting to open database with openDatabaseAsync...');
      console.log('🧪 openDatabaseAsync type:', typeof SQLite.openDatabaseAsync);
      console.log('🧪 Calling openDatabaseAsync with:', testDbName);
      
      const db = await SQLite.openDatabaseAsync(testDbName);
      console.log('✅ Database opened successfully');
      console.log('🧪 Database object:', typeof db);
      
    } else if (SQLite.openDatabaseSync) {
      console.log('🧪 Attempting to open database with openDatabaseSync...');
      console.log('🧪 openDatabaseSync type:', typeof SQLite.openDatabaseSync);
      console.log('🧪 Calling openDatabaseSync with:', testDbName);
      
      const db = SQLite.openDatabaseSync(testDbName);
      console.log('✅ Database opened successfully');
      console.log('🧪 Database object:', typeof db);
      
    } else {
      console.log('❌ No suitable database open method found');
      console.log('Available methods:', Object.keys(SQLite));
      throw new Error('No compatible SQLite open method available');
    }
    
  } catch (error) {
    console.error('❌ SQLite test failed:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Error constructor:', error?.constructor?.name);
    throw error;
  }
}