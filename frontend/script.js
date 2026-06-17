// Store expenses in memory (replace with API calls in production)
        let expenses = [];
        

        // API Base URL - change this to your backend URL
        const API_BASE = 'http://localhost:3000/api';

        // DOM Elements
        const form = document.getElementById('expenseForm');
        const expensesList = document.getElementById('expensesList');
        const totalBalance = document.getElementById('totalBalance');
        const totalIncome = document.getElementById('totalIncome');
        const totalExpenses = document.getElementById('totalExpenses');

        // Load expenses on page load
        document.addEventListener('DOMContentLoaded', loadExpenses);

        // Form submission
        form.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("Button clicked");

    const expense = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        type: document.getElementById('type').value,
        date: new Date().toISOString()
    };

    console.log(expense);

    try {
        const response = await addExpenseToAPI(expense);
        console.log("Saved:", response);

        await loadExpenses();
        form.reset();

    } catch (error) {
        console.error(error);
    }
});
        // API Functions (replace with actual backend calls)
        async function addExpenseToAPI(expense) {
            try {
                const response = await fetch(`${API_BASE}/expenses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(expense)
                });
                
                if (!response.ok) throw new Error('Failed to add expense');
                return await response.json();
            } catch (error) {
                console.log('API not available, using local storage');
                throw error;
            }
        }

        async function loadExpenses() {
    try {
        const response = await fetch(`${API_BASE}/expenses`);

        if (!response.ok) {
            throw new Error('Failed to load expenses');
        }

        expenses = await response.json();
        updateDisplay();

    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}
         
          

       async function deleteExpense(id) {
    try {
        const response = await fetch(`${API_BASE}/expenses/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }

        await loadExpenses();

    } catch (error) {
        console.error('Error deleting expense:', error);
    }
}

        function updateDisplay() {
            updateSummary();
            renderExpenses();
        }

        function updateSummary() {
            const income = expenses
                .filter(expense => expense.type === 'income')
                .reduce((sum, expense) => sum + expense.amount, 0);
            
            const expenseTotal = expenses
                .filter(expense => expense.type === 'expense')
                .reduce((sum, expense) => sum + expense.amount, 0);
            
            const balance = income - expenseTotal;

            totalIncome.textContent = `₹${income.toFixed(2)}`;
            totalExpenses.textContent = `₹${expenseTotal.toFixed(2)}`;
            totalBalance.textContent = `₹${balance.toFixed(2)}`;
        }

        function renderExpenses() {
            if (expenses.length === 0) {
                expensesList.innerHTML = '<div class="no-expenses">No transactions yet. Add your first transaction above!</div>';
                return;
            }

            expensesList.innerHTML = expenses.map(expense => `
                <div class="expense-item ${expense.type}">
                    <div class="expense-details">
                        <h4>${expense.description}</h4>
                        <p>${expense.category} • ${new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div class="expense-amount ${expense.type}">
                            ${expense.type === 'income' ? '+' : '-'}₹${expense.amount.toFixed(2)}
                        </div>
                        <button class="delete-btn" onclick="deleteExpense('${expense._id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        }