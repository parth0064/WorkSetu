const mongoose = require('mongoose');
require('dotenv').config();

const resetWallets = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const result = await mongoose.connection.collection('users').updateMany(
            {},
            { $set: { 'wallet.balance': 0, 'wallet.pending': 0 } }
        );

        console.log(`✅ Reset wallets for ${result.modifiedCount} users to ₹0`);

        // Also clear all transaction history so it's clean
        const txResult = await mongoose.connection.collection('transactions').deleteMany({});
        console.log(`🗑️  Cleared ${txResult.deletedCount} old transactions`);

        await mongoose.disconnect();
        console.log('✅ Done! All user wallets are now reset to ₹0');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

resetWallets();
