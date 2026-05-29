const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://tangyclass_db_user:123456tzq@ac-tircupp-shard-00-00.enufkn7.mongodb.net:27017,ac-tircupp-shard-00-01.enufkn7.mongodb.net:27017,ac-tircupp-shard-00-02.enufkn7.mongodb.net:27017/mycigsdb_dev?ssl=true&replicaSet=atlas-12dlky-shard-0&authSource=admin&appName=Cluster0';

const CampaignSchema = new mongoose.Schema({
  name: String,
  description: String,
  type: String,
  isActive: Boolean,
  scope: String,
  targetProducts: [mongoose.Schema.Types.ObjectId],
  rules: {
    buyQuantity: Number,
    getQuantity: Number,
    minSpend: Number,
    discountAmount: Number,
    freeShippingThreshold: Number
  },
  startDate: Date,
  endDate: Date
}, { timestamps: true });

async function checkCampaigns() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Campaign = mongoose.model('Campaign', CampaignSchema);
    const campaigns = await Campaign.find({}).lean();

    console.log(`📊 Total Campaigns Found: ${campaigns.length}\n`);
    console.log('=' .repeat(80));

    const now = new Date();

    for (const camp of campaigns) {
      console.log(`\n🎯 Campaign: ${camp.name}`);
      console.log(`   Type: ${camp.type}`);
      console.log(`   isActive: ${camp.isActive}`);
      console.log(`   Scope: ${camp.scope}`);

      if (camp.rules) {
        console.log(`   Rules:`, JSON.stringify(camp.rules, null, 6));
      }

      if (camp.startDate || camp.endDate) {
        const startStr = camp.startDate ? new Date(camp.startDate).toISOString() : 'Not set';
        const endStr = camp.endDate ? new Date(camp.endDate).toISOString() : 'Not set';
        console.log(`   Start Date: ${startStr}`);
        console.log(`   End Date: ${endStr}`);

        const isInDateRange = (!camp.startDate || new Date(camp.startDate) <= now) &&
                              (!camp.endDate || new Date(camp.endDate) >= now);
        console.log(`   📅 Date Valid: ${isInDateRange ? '✅ YES' : '❌ NO'}`);
      }

      const wouldBeIncluded = camp.isActive && (!camp.startDate || new Date(camp.startDate) <= now) &&
                              (!camp.endDate || new Date(camp.endDate) >= now);
      console.log(`   ✅ Would appear in /api/campaigns/active: ${wouldBeIncluded ? 'YES' : 'NO'}`);

      console.log('-' .repeat(80));
    }

    console.log('\n📋 Summary:');
    console.log(`   - Total: ${campaigns.length}`);
    console.log(`   - Active: ${campaigns.filter(c => c.isActive).length}`);
    console.log(`   - Buy X Get Y: ${campaigns.filter(c => c.type === 'buy_x_get_y').length}`);
    console.log(`   - Tiered Discount: ${campaigns.filter(c => c.type === 'tiered_discount').length}`);
    console.log(`   - Free Shipping: ${campaigns.filter(c => c.type === 'free_shipping').length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
    process.exit(0);
  }
}

checkCampaigns();