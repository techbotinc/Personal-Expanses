let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function updateUI() {
    const filteredTransactions = filterTransactions();
    const balance = filteredTransactions.reduce((acc, transaction) => {
        return transaction.type === 'income' 
            ? acc + transaction.amount 
            : acc - transaction.amount;
    }, 0);

    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    document.getElementById('balance').textContent = `Rs ${Math.round(balance)}`;
    document.getElementById('income').textContent = `Rs ${Math.round(income)}`;
    document.getElementById('expense').textContent = `Rs ${Math.round(expenses)}`;

    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';

    filteredTransactions.forEach((transaction, index) => {
        const div = document.createElement('div');
        div.className = `transaction ${transaction.type}`;
        div.innerHTML = `
            <span>${transaction.date}</span>
            <span>${transaction.description}</span>
            <span>${transaction.category}</span>
            <span>Rs ${Math.round(transaction.amount)}</span>
        `;
        
        let startX = 0;
        let currentX = 0;
        
        div.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            div.classList.add('sliding');
            e.preventDefault();
        }, { passive: false });
        
        div.addEventListener('touchmove', (e) => {
            e.preventDefault();
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            if (diff < 0 && diff > -200) {
                div.style.transform = `translateX(${diff}px)`;
            }
        }, { passive: false });
        
        div.addEventListener('touchend', () => {
            const diff = currentX - startX;
            div.classList.remove('sliding');
            if (diff < -50) {
                div.style.transform = 'translateX(-100%)';
                setTimeout(() => deleteTransaction(index), 300);
            } else {
                div.style.transform = '';
            }
        });
        
        div.addEventListener('click', () => {
            editTransaction(index);
        });
        
        transactionList.appendChild(div);
    });
}

function editTransaction(index) {
    const transaction = transactions[index];
    document.getElementById('date').value = transaction.date;
    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('type').value = transaction.type;
    document.getElementById('category').value = transaction.category;

    // Remove old transaction
    transactions.splice(index, 1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

document.getElementById('transactionForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;

    transactions.push({ date, description, amount, type, category });
    localStorage.setItem('transactions', JSON.stringify(transactions));

    this.reset();
    updateUI();
});

function calculateTotals() {
    return {
        income: transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
        expenses: transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
        balance: transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0)
    };
}

function exportToCSV() {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const totals = calculateTotals();

    const csvContent = [
        ['Date', 'Description', 'Category', 'Type', 'Amount'].join(','),
        ...sortedTransactions.map(t => [
            t.date,
            `"${t.description}"`,
            t.category,
            t.type,
            Math.round(t.amount)
        ].join(',')),
        '',
        ['Summary', '', '', ''].join(','),
        ['Total Income', '', '', '', Math.round(totals.income)].join(','),
        ['Total Expenses', '', '', '', Math.round(totals.expenses)].join(','),
        ['Balance', '', '', '', Math.round(totals.balance)].join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expense_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function filterTransactions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.getElementById('filterType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    return transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm) ||
                            t.category.toLowerCase().includes(searchTerm);
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesDate = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
        return matchesSearch && matchesType && matchesDate;
    });
}

updateUI();