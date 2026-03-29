const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const User = require('../server/src/models/User').default;
const Referral = require('../server/src/models/Referral').default;
const Meeting = require('../server/src/models/Meeting').default;

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xoonhub');
  console.log('Connected to MongoDB');

  const admin = await User.findOne({ email: 'admin@xoon.com' });
  const members = await User.find({ role: 'MEMBER' }).limit(3);

  if (members.length < 2) {
    console.log('Not enough members to seed referrals. Please register at least 2 members.');
    process.exit(0);
  }

  const user1 = members[0];
  const user2 = members[1];

  // Seed Meetings
  const meetingCount = await Meeting.countDocuments();
  if (meetingCount === 0) {
    await Meeting.create([
      {
        chapter: user1.chapter || 'Default',
        title: 'Weekly Strategy Session',
        date: new Date(Date.now() + 86400000 * 2),
        location: 'Xoon Hub Main Hall',
        description: 'Monthly strategy and networking'
      },
      {
        chapter: user1.chapter || 'Default',
        title: 'Referral Power Hour',
        date: new Date(Date.now() + 86400000 * 5),
        location: 'Zoom Conference',
        description: 'Fast-track your referrals'
      }
    ]);
    console.log('Meetings seeded');
  }

  // Seed Referrals
  const referralCount = await Referral.countDocuments();
  if (referralCount === 0) {
    await Referral.create([
      {
        referrer: user1._id,
        recipient: user2._id,
        leadName: 'John Doe',
        leadContact: '9876543210',
        businessType: 'Real Estate',
        status: 'Closed',
        date: new Date()
      },
      {
        referrer: user2._id,
        recipient: user1._id,
        leadName: 'Jane Smith',
        leadContact: '9123456780',
        businessType: 'Web Design',
        status: 'Pending',
        date: new Date()
      },
      {
        referrer: user1._id,
        recipient: user2._id,
        leadName: 'Construction Lead',
        leadContact: '9000000001',
        businessType: 'Civil Works',
        status: 'Contacted',
        date: new Date()
      }
    ]);
    console.log('Referrals seeded');
  }

  console.log('Seeding complete');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
