// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Expense Schema
const expenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Income', 'Other']
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);

// Routes
app.use(express.static(path.join(__dirname, '../frontend')));
// Get all expenses
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ createdAt: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
    try {
        const expense = new Expense(req.body);
        const savedExpense = await expense.save();
        res.status(201).json(savedExpense);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
        if (!deletedExpense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get expense summary
app.get('/api/expenses/summary', async (req, res) => {
    try {
        const income = await Expense.aggregate([
            { $match: { type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const expenses = await Expense.aggregate([
            { $match: { type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalIncome = income[0]?.total || 0;
        const totalExpenses = expenses[0]?.total || 0;
        const balance = totalIncome - totalExpenses;

        res.json({
            totalIncome,
            totalExpenses,
            balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

