const crypto = require('crypto');

/**
 * Banking Service for SmartVet Platform
 * Handles real bank transfers to doctors' accounts
 */

class BankingService {
  constructor() {
    this.vetcareAccount = {
      accountNumber: process.env.SMARTVET_BANK_ACCOUNT,
      ifscCode: process.env.SMARTVET_BANK_IFSC,
      holderName: process.env.SMARTVET_BANK_HOLDER_NAME,
      bankName: process.env.SMARTVET_BANK_NAME
    };
  }

  /**
   * Transfer money from SmartVet account to doctor's account
   * In production, integrate with:
   * - Razorpay Route API
   * - IMPS/NEFT APIs
   * - Bank's direct API
   * - UPI transfer APIs
   */
  async transferToDoctor(doctorBankDetails, amount, reference) {
    try {
      console.log(`🏦 Initiating bank transfer: ₹${amount} to Dr. ${doctorBankDetails.accountHolderName}`);
      console.log(`From: SmartVet Account ${this.vetcareAccount.accountNumber}`);
      console.log(`To: ${doctorBankDetails.accountNumber} (${doctorBankDetails.ifscCode})`);

      // Validate doctor's bank details
      if (!this.validateBankDetails(doctorBankDetails)) {
        throw new Error('Invalid bank details');
      }

      // Validate transfer amount
      if (amount < 100) {
        throw new Error('Minimum transfer amount is ₹100');
      }

      // Generate unique transaction ID
      const transactionId = this.generateTransactionId();

      // In PRODUCTION, replace this with actual bank API call:
      /*
      // Example with Razorpay Route API:
      const transfer = await razorpay.transfers.create({
        account: doctorBankDetails.razorpayContactId,
        amount: amount * 100, // amount in paise
        currency: 'INR',
        notes: {
          reference: reference,
          doctor_name: doctorBankDetails.accountHolderName,
          purpose: 'Doctor consultation payout'
        }
      });

      // Example with direct bank API:
      const bankTransfer = await this.callBankAPI({
        fromAccount: this.vetcareAccount.accountNumber,
        toAccount: doctorBankDetails.accountNumber,
        toIFSC: doctorBankDetails.ifscCode,
        amount: amount,
        purpose: 'Medical consultation payment',
        reference: reference
      });
      */

      // FOR DEMO: Simulate successful transfer
      const transferResult = await this.simulateBankTransfer(doctorBankDetails, amount, transactionId);

      return {
        success: true,
        transactionId: transactionId,
        amount: amount,
        status: 'completed',
        transferDate: new Date(),
        bankReference: transferResult.bankReference,
        doctorAccount: {
          accountNumber: doctorBankDetails.accountNumber.slice(-4), // Show only last 4 digits
          bankName: doctorBankDetails.bankName,
          holderName: doctorBankDetails.accountHolderName
        },
        vetcareAccount: {
          accountNumber: this.vetcareAccount.accountNumber.slice(-4),
          bankName: this.vetcareAccount.bankName
        }
      };

    } catch (error) {
      console.error('❌ Bank transfer failed:', error);
      return {
        success: false,
        error: error.message,
        transactionId: null,
        status: 'failed'
      };
    }
  }

  /**
   * Validate bank account details
   */
  validateBankDetails(bankDetails) {
    const required = ['accountHolderName', 'accountNumber', 'ifscCode', 'bankName'];
    
    for (const field of required) {
      if (!bankDetails[field]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate IFSC code format
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankDetails.ifscCode)) {
      console.error('Invalid IFSC code format');
      return false;
    }

    // Validate account number (basic check)
    if (bankDetails.accountNumber.length < 9 || bankDetails.accountNumber.length > 18) {
      console.error('Invalid account number length');
      return false;
    }

    return true;
  }

  /**
   * Generate unique transaction ID
   */
  generateTransactionId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `SMARTVET_${timestamp}_${random}`;
  }

  /**
   * Simulate bank transfer for demo purposes
   * In production, replace with actual bank API calls
   */
  async simulateBankTransfer(doctorBankDetails, amount, transactionId) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 95% success rate
    const isSuccess = Math.random() > 0.05;

    if (!isSuccess) {
      throw new Error('Bank transfer failed - insufficient funds or network error');
    }

    return {
      bankReference: `BNK${Date.now()}`,
      status: 'completed',
      charges: Math.round(amount * 0.005), // 0.5% bank charges
      netAmount: amount - Math.round(amount * 0.005)
    };
  }

  /**
   * Get SmartVet platform account balance
   * In production, integrate with bank API to get real balance
   */
  async getPlatformBalance() {
    // Simulate platform balance
    return {
      balance: 25000.00, // ₹25,000 available
      currency: 'INR',
      lastUpdated: new Date(),
      accountNumber: this.vetcareAccount.accountNumber.slice(-4)
    };
  }

  /**
   * Batch transfer to multiple doctors
   */
  async batchTransferToDoctors(transfers) {
    const results = [];
    
    for (const transfer of transfers) {
      const result = await this.transferToDoctor(
        transfer.doctorBankDetails, 
        transfer.amount, 
        transfer.reference
      );
      
      results.push({
        doctorId: transfer.doctorId,
        doctorName: transfer.doctorBankDetails.accountHolderName,
        ...result
      });
    }

    return {
      totalTransfers: transfers.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: results
    };
  }
}

module.exports = new BankingService();