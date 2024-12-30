const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: '無料会員'
  },
  avatar: {
    type: String
  },
  posterCounts: {
    type: Number,
    default: 0
  },
  viewCounts: {
    type: Number,
    default: 0
  },
  totalPlayedTime:{
    type: Number,
    default: 0
  },
  totalIncome : {
    type:Number,
    default: 0
  },
  paidDate:[{
    type:Date,
    require:false
  }],
  lastPaidDate:{
    type:Date,
    require:false
  },
  paid : {
    type: Number,
    default : 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    default: null
  }],
  expired: {
    start: {
      type: Date
    },
    end: {
      type: Date
    }
  },
  uploads:{type:Number, default:0},
  searchField:{
    type:String
  },
  status:{
    type:Boolean, default:true
  },
  paymentStatus:{
    type : Boolean, default:false
  },
  requestAction:{
    type:Boolean, default:false
  },
  paymentInfo : {
    cardNumber: {
      type:String,
    },
    expiredDate:{
      type:Date
    },
    cvc:{
      type:String
    }
  },
  dailyIncome: [
    {
      date: {
        type: Date,
        required: true
      },
      amount: {
        type: Number,
        required: true
      }
    }
  ],
  monthlyIncome: [
    {
      month: {
        type: String, // Format: 'YYYY-MM'
        required: true
      },
      income: {
        type: Number,
        default: 0
      }
    }
  ]
}, { timestamps: true });

userSchema.pre('save', function (next) {
  this.searchField = `${this.name} ${this.email} ${this.role}`;

  if(this.role === 'admin') {
    next();
  }else{
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`; // Format: YYYY-MM
  
    // Calculate the total income for the current month
    const totalIncomeForMonth = this.dailyIncome
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getFullYear() === today.getFullYear() &&
          entryDate.getMonth() === today.getMonth()
        );
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
  
    // Check if there's already an entry for the current month
    const existingMonthlyIncome = this.monthlyIncome.find(income => income.month === currentMonth);
  
    if (existingMonthlyIncome) {
      // Update the income for the current month
      existingMonthlyIncome.income = totalIncomeForMonth;
    } else {
      // Add a new entry for the current month
      this.monthlyIncome.push({ month: currentMonth, income: totalIncomeForMonth });
    }
    next();
  }
});

// Add indexes to frequently queried fields
userSchema.index({ searchField: 'text' });

module.exports = mongoose.model('User', userSchema);