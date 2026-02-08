/**
 * Seed script: creates realistic dummy users, feedbacks, and reports for testing.
 * Run from server directory: npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/feedback-collector';

const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Report = require('../models/Report');

const dummyUsers = [
  { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@example.com' },
  { firstName: 'Rahul', lastName: 'Patel', email: 'rahul.patel@example.com' },
  { firstName: 'Ananya', lastName: 'Reddy', email: 'ananya.reddy@example.com' },
  { firstName: 'Arjun', lastName: 'Kumar', email: 'arjun.kumar@example.com' },
  { firstName: 'Sneha', lastName: 'Iyer', email: 'sneha.iyer@example.com' },
  { firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@example.com' },
  { firstName: 'Divya', lastName: 'Nair', email: 'divya.nair@example.com' },
  { firstName: 'Rohan', lastName: 'Deshmukh', email: 'rohan.deshmukh@example.com' },
  { firstName: 'Kavya', lastName: 'Menon', email: 'kavya.menon@example.com' },
  { firstName: 'Aditya', lastName: 'Gupta', email: 'aditya.gupta@example.com' }
];

const feedbackMessages = [
  "The new dark mode is absolutely fantastic! My eyes thank you for this feature. Would love to see more customization options.",
  "I've been using this app for 3 months now and the experience has been great. The UI is clean and intuitive.",
  "Customer support responded within minutes when I had an issue. Very impressed with the service quality!",
  "The mobile app needs some work. It crashes occasionally when uploading images. Otherwise, solid product.",
  "Pricing is a bit steep for individual users. Would be great to have a more affordable plan for students.",
  "Love the recent updates! The performance improvements are noticeable. Keep up the good work!",
  "The export feature doesn't work properly. I tried multiple times but the file always comes out corrupted.",
  "This is exactly what I was looking for! Simple, elegant, and gets the job done without complications.",
  "Been waiting for the API access for months. Any updates on when this will be available?",
  "The onboarding process was smooth and helpful. Great first impression!",
  "Notifications are too frequent. Would appreciate a way to customize notification settings more granularly.",
  "Excellent product! Recommended it to my entire team and they all love it.",
  "The search functionality needs improvement. Sometimes it doesn't find content that I know exists.",
  "Best app in this category hands down. Worth every penny of the subscription.",
  "Had a bug where my data wasn't syncing across devices. Support team fixed it quickly though.",
  "The color scheme is beautiful. Whoever designed this has great taste!",
  "Would love to see integration with Google Calendar. That would make this perfect for me.",
  "Loading times have improved significantly since the last update. Much appreciated!",
  "The free tier is quite limited. I understand the need for premium features, but basic functionality should be more accessible.",
  "This app has become an essential part of my daily workflow. Can't imagine working without it now.",
  "Some features feel half-baked. Hope to see more polish in future updates.",
  "Great value for money. Been using it for a year and it just keeps getting better.",
  "The desktop app is perfect, but the mobile version needs serious optimization.",
  "Customer support is outstanding. They genuinely care about user feedback.",
  "Please add dark mode to the mobile app as well. It's my favorite feature on desktop!",
  "The recent redesign looks modern and clean. Much better than the old interface.",
  "Experiencing some lag when working with large files. Hope this gets addressed soon.",
  "This is the most user-friendly app I've used in this space. Kudos to the development team!",
  "The documentation is comprehensive and well-written. Made onboarding a breeze.",
  "Would give 5 stars if there was offline mode. That's the only thing missing for me."
];

const reportedMessages = [
  "🚨🚨🚨 CLICK HERE FOR AMAZING DEALS!!! Limited time offer, don't miss out! Visit sketchy-website.com NOW!!!",
  "This product is absolute garbage. The developers should be ashamed. Total waste of money and time. Complete scam!",
  "Hey everyone! Check out my new crypto investment scheme! Guaranteed 500% returns in 30 days! Message me for details! 💰💰💰"
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const dummyEmails = dummyUsers.map((u) => u.email);
    console.log('🗑️  Clearing existing dummy data...');
    await User.deleteMany({ email: { $in: dummyEmails } });
    await Feedback.deleteMany({ userEmail: { $in: dummyEmails } });
    await Report.deleteMany({});

    const hashedPassword = await bcrypt.hash('user@test', 10);

    console.log('👥 Creating 10 dummy users...');
    const createdUsers = [];

    for (const userData of dummyUsers) {
      const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        status: 'active',
        riskLevel: 'low'
      });
      createdUsers.push(user);
      console.log(`   ✓ Created: ${user.firstName} ${user.lastName} (${user.userId})`);
    }

    console.log('💬 Creating feedback from users...');
    const allFeedbacks = [];

    for (const user of createdUsers) {
      const feedbackCount = Math.floor(Math.random() * 3) + 2;

      for (let i = 0; i < feedbackCount; i++) {
        const randomMessage = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];

        const feedback = await Feedback.create({
          userId: user.userId,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          message: randomMessage,
          likes: Math.floor(Math.random() * 50),
          likedBy: [],
          commentCount: Math.floor(Math.random() * 15),
          status: 'normal',
          isVisible: true,
          reportsCount: 0,
          reportedBy: [],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });

        allFeedbacks.push(feedback);
        console.log(`   ✓ ${user.firstName}: "${feedback.message.substring(0, 50)}..."`);
      }
    }

    console.log('🚩 Creating 3 reported feedbacks...');
    const reportedFeedbacks = [];

    for (let i = 0; i < 3; i++) {
      const randomSpammer = createdUsers[Math.floor(Math.random() * createdUsers.length)];

      const spamFeedback = await Feedback.create({
        userId: randomSpammer.userId,
        userName: `${randomSpammer.firstName} ${randomSpammer.lastName}`,
        userEmail: randomSpammer.email,
        name: `${randomSpammer.firstName} ${randomSpammer.lastName}`,
        email: randomSpammer.email,
        message: reportedMessages[i],
        likes: Math.floor(Math.random() * 5),
        likedBy: [],
        commentCount: 0,
        status: 'normal',
        isVisible: true,
        reportsCount: 0,
        reportedBy: [],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });

      reportedFeedbacks.push(spamFeedback);
      console.log(`   ✓ Spam feedback by ${randomSpammer.firstName}: "${spamFeedback.message.substring(0, 50)}..."`);
    }

    console.log('📋 Creating reports for spam feedbacks...');

    for (const spamFeedback of reportedFeedbacks) {
      const reportCount = Math.floor(Math.random() * 3) + 2;
      const reporters = createdUsers
        .filter((u) => u.userId !== spamFeedback.userId)
        .sort(() => 0.5 - Math.random())
        .slice(0, reportCount);

      for (const reporter of reporters) {
        const reasons = ['spam', 'offensive', 'inappropriate'];
        const randomReason = reasons[Math.floor(Math.random() * reasons.length)];

        const report = await Report.create({
          feedbackId: spamFeedback._id,
          reportedBy: {
            userId: reporter.userId,
            userName: `${reporter.firstName} ${reporter.lastName}`,
            userEmail: reporter.email
          },
          feedbackAuthor: {
            userId: spamFeedback.userId,
            userName: spamFeedback.userName,
            userEmail: spamFeedback.userEmail
          },
          reason: randomReason,
          details: randomReason === 'spam' ? 'This looks like spam content' : 'Inappropriate content',
          status: 'pending',
          createdAt: new Date(spamFeedback.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        });

        spamFeedback.reportsCount += 1;
        spamFeedback.reportedBy.push({
          userId: reporter.userId,
          reportId: report.reportId,
          createdAt: report.createdAt
        });

        console.log(`   ✓ Report ${report.reportId} by ${reporter.firstName} (${randomReason})`);
      }

      if (spamFeedback.reportsCount >= 3) {
        spamFeedback.status = 'flagged';
        console.log(`   ⚠️  Feedback auto-flagged (${spamFeedback.reportsCount} reports)`);
      }

      await spamFeedback.save();

      const spammer = await User.findOne({ userId: spamFeedback.userId });
      if (spammer) {
        spammer.reportsReceived = (spammer.reportsReceived || 0) + spamFeedback.reportsCount;
        if (spammer.reportsReceived >= 5) {
          spammer.riskLevel = 'high';
          console.log(`   ⚠️  ${spammer.firstName} marked as HIGH RISK`);
        } else if (spammer.reportsReceived >= 3) {
          spammer.riskLevel = 'medium';
          console.log(`   ⚠️  ${spammer.firstName} marked as MEDIUM RISK`);
        }
        await spammer.save();
      }
    }

    console.log('❤️  Adding random likes to feedbacks...');

    for (const feedback of allFeedbacks) {
      const likeCount = feedback.likes;
      const likers = createdUsers
        .filter((u) => u.userId !== feedback.userId)
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(likeCount, createdUsers.length - 1));

      feedback.likedBy = likers.map((u) => u.userId);
      await feedback.save();
    }

    const totalReports = await Report.countDocuments();
    const flaggedCount = reportedFeedbacks.filter((f) => f.status === 'flagged').length;

    console.log('\n📊 SEED SUMMARY:');
    console.log(`   ✅ Users created: ${createdUsers.length}`);
    console.log(`   ✅ Feedbacks created: ${allFeedbacks.length + reportedFeedbacks.length}`);
    console.log(`   ✅ Spam feedbacks: ${reportedFeedbacks.length}`);
    console.log(`   ✅ Reports created: ${totalReports}`);
    console.log(`   ✅ Flagged feedbacks: ${flaggedCount}`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 TEST CREDENTIALS:');
    console.log('   All dummy users - Password: user@test');
    console.log('   Emails:');
    createdUsers.forEach((u) => console.log(`      - ${u.email} (${u.userId})`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
