import { pool, testConnection } from './db/config.js';

async function updateReferralEarnings() {
  try {
    // Test DB connection
    const dbTest = await testConnection();
    if (!dbTest.success) {
      console.error('❌ Database connection failed:', dbTest.error);
      return;
    }

    console.log('🔄 Starting earnings update...');

    // Get all users with their referral counts
    const usersResult = await pool.query(`
      SELECT 
          u.user_id,
          u.total_earning AS current_earning,
          COUNT(r.id) AS referral_count,
          COUNT(r.id) * 10 AS expected_earning
      FROM users u
      LEFT JOIN users r ON u.user_id = r.referral_id
      GROUP BY u.user_id, u.total_earning
    `);

    const users = usersResult.rows;

    // Update each user's total_earning
    for (const user of users) {
      if (user.current_earning !== user.expected_earning) {
        console.log(`📝 Updating ${user.user_id}: current ₹${user.current_earning} → expected ₹${user.expected_earning}`);
        await pool.query(
          'UPDATE users SET total_earning = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
          [user.expected_earning, user.user_id]
        );
        console.log(`✅ Updated ${user.user_id} to ₹${user.expected_earning}`);
      } else {
        console.log(`✅ ${user.user_id} earnings correct: ₹${user.current_earning}`);
      }
    }

    console.log('🏁 Earnings update completed!');
  } catch (error) {
    console.error('❌ Error updating earnings:', error.message);
  } finally {
    await pool.end(); // Close DB connection
  }
}

updateReferralEarnings();