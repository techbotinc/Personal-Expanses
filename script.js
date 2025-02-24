let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function updateUI() {
    const balance = transactions.reduce((acc, transaction) => {
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

    document.getElementById('balance').textContent = `Rs ${balance.toFixed(2)}`;
    document.getElementById('income').textContent = `Rs ${income.toFixed(2)}`;
    document.getElementById('expense').textContent = `Rs ${expenses.toFixed(2)}`;

    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';

    transactions.forEach((transaction, index) => {
        const div = document.createElement('div');
        div.className = `transaction ${transaction.type}`;
        div.innerHTML = `
            <span>${transaction.date}</span>
            <span>${transaction.description}</span>
            <span>${transaction.category}</span>
            <span>Rs ${transaction.amount.toFixed(2)}</span>
            <div class="actions">
                <button onclick="editTransaction(${index})" class="edit-btn">Edit</button>
                <button onclick="deleteTransaction(${index})" class="delete-btn">Delete</button>
            </div>
        `;
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

updateUI();