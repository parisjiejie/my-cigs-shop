import mongoose from 'mongoose';

const testDatabases = [
  {
    name: '测试数据库 (mycigsdb_dev)',
    uri: 'mongodb+srv://tangyclass_db_user:123456tzq@cluster0.enufkn7.mongodb.net/mycigsdb_dev?appName=Cluster0'
  },
  {
    name: '正式数据库 (parisjiejie)',
    uri: 'mongodb+srv://parisjiejie_db_user:TncwGxVIo0SphmGp@cluster0.blcqvp8.mongodb.net/?appName=Cluster0'
  }
];

async function testConnection(name, uri) {
  console.log(`\n🔄 测试连接: ${name}`);
  console.log(`   URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`);
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false
    });
    
    const state = mongoose.connection.readyState;
    if (state === 1) {
      console.log(`   ✅ 连接成功!`);
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`   📋 数据库集合: ${collections.map(c => c.name).join(', ')}`);
      
      await mongoose.disconnect();
      return true;
    }
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
    return false;
  }
  return false;
}

async function main() {
  console.log('🚀 开始测试数据库连接...\n');
  
  const results = [];
  
  for (const db of testDatabases) {
    results.push({
      name: db.name,
      success: await testConnection(db.name, db.uri)
    });
  }
  
  console.log('\n========== 测试结果 ==========');
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.name}`);
  });
  
  const allSuccess = results.every(r => r.success);
  console.log(`\n${allSuccess ? '🎉 所有数据库连接正常!' : '⚠️  部分数据库连接失败，请检查'}`);
  
  process.exit(allSuccess ? 0 : 1);
}

main();
