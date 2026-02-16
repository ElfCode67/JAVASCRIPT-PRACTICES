// ============= BANKING SYSTEM WITH ADVANCED JS CONCEPTS =============

// Import/Export simulation (ES6 Modules)
export const BANK_NAME = 'FINFLOW';
export const BANK_VERSION = 'v1.0';

// Utility functions module (demonstrating modules)
const Formatter = {
    currency: (amount) => `$${amount.toFixed(2)}`,
    date: (date) => date.toLocaleDateString('en-US'),
    time: (date) => date.toLocaleTimeString('en-US', { hour12: false })
};

// ============= CLASSES & INHERITANCE =============

// Base Transaction class (Parent class)
class Transaction {
    static transactionCount = 0; // Static property - belongs to class, not instances
    
    constructor(amount, description, type) {
        this.id = Date.now() + Math.random().toString(36).substr(2, 9);
        this.date = new Date(); // Date object
        this.amount = amount;
        this.description = description;
        this.type = type;
        Transaction.transactionCount++;
    }
    
    // Static method - belongs to class
    static getTotalTransactions() {
        return Transaction.transactionCount;
    }
    
    // Getter
    get formattedDate() {
        return Formatter.date(this.date);
    }
    
    // Getter
    get formattedTime() {
        return Formatter.time(this.date);
    }
    
    // Getter
    get formattedAmount() {
        return (this.amount >= 0 ? '+' : '') + Formatter.currency(Math.abs(this.amount));
    }
}

// DepositTransaction class (Inheritance)
class DepositTransaction extends Transaction {
    constructor(amount, description) {
        super(amount, description, 'deposit'); // super keyword
    }
}

// WithdrawalTransaction class (Inheritance)
class WithdrawalTransaction extends Transaction {
    constructor(amount, description) {
        super(-Math.abs(amount), description, 'withdrawal'); // Ensure negative
    }
}

// ============= BANK ACCOUNT CLASS WITH GETTERS/SETTERS =============

class BankAccount {
    // Static properties
    static MAX_SAVINGS_GOAL = 20000;
    static MINIMUM_BALANCE = 0;
    
    constructor(type, number, initialBalance = 0) {
        this.type = type;
        this.number = number;
        this._balance = initialBalance; // Private by convention
        this.transactions = []; // Array of objects
        this.accountLimits = {
            // Nested object
            dailyWithdrawal: 1000,
            minimumBalance: 0,
            maximumBalance: type === 'savings' ? 50000 : 25000
        };
    }
    
    // Getter for balance (encapsulation)
    get balance() {
        return this._balance;
    }
    
    // Setter with validation
    set balance(value) {
        if (value < BankAccount.MINIMUM_BALANCE) {
            throw new Error('Balance cannot be negative');
        }
        if (value > this.accountLimits.maximumBalance) {
            throw new Error(`Balance exceeds maximum limit for ${this.type} account`);
        }
        this._balance = value;
    }
    
    // Getter for formatted balance
    get formattedBalance() {
        return Formatter.currency(this._balance);
    }
    
    // Getter for progress percentage
    get savingsProgress() {
        return (this._balance / BankAccount.MAX_SAVINGS_GOAL) * 100;
    }
    
    deposit(amount, description) {
        if (amount <= 0) throw new Error('Amount must be positive');
        
        // Create transaction using inheritance
        const transaction = new DepositTransaction(amount, description);
        this._balance += amount;
        transaction.balanceAfter = this._balance;
        this.transactions.unshift(transaction);
        
        return transaction;
    }
    
    withdraw(amount, description) {
        if (amount <= 0) throw new Error('Amount must be positive');
        if (amount > this._balance) throw new Error('Insufficient funds');
        if (amount > this.accountLimits.dailyWithdrawal) {
            throw new Error(`Withdrawal exceeds daily limit of $${this.accountLimits.dailyWithdrawal}`);
        }
        
        // Create transaction using inheritance
        const transaction = new WithdrawalTransaction(amount, description);
        this._balance -= amount;
        transaction.balanceAfter = this._balance;
        this.transactions.unshift(transaction);
        
        return transaction;
    }
    
    getRecentTransactions(limit = 10) {
        return this.transactions.slice(0, limit);
    }
    
    // Sort transactions by date (demonstrating sort method)
    getSortedTransactionsByDate(ascending = false) {
        return [...this.transactions].sort((a, b) => {
            return ascending ? a.date - b.date : b.date - a.date;
        });
    }
    
    // Destructuring in method parameter
    transfer({ amount, description, toAccount }) { // Object destructuring
        if (!toAccount) throw new Error('Destination account required');
        
        this.withdraw(amount, `Transfer to ${toAccount.type}: ${description}`);
        toAccount.deposit(amount, `Transfer from ${this.type}: ${description}`);
        
        return { success: true, fromBalance: this.balance, toBalance: toAccount.balance };
    }
}

// ============= ANALYTICS CLASS (DEMONSTRATING CLOSURES) =============

class SpendingAnalytics {
    constructor(account) {
        this.account = account;
        
        // Closure example: inner function maintains access to outer variables
        this.categorizeTransaction = (function() {
            const categoryKeywords = {
                'Food & Groceries': ['grocery', 'food', 'restaurant', 'lunch', 'dinner'],
                'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'transit'],
                'Entertainment': ['movie', 'netflix', 'spotify', 'game'],
                'Shopping': ['amazon', 'store', 'mall', 'clothing'],
                'Bills & Utilities': ['electric', 'water', 'internet', 'phone', 'rent']
            };
            
            // Inner function (closure)
            return function(description) {
                const desc = description.toLowerCase();
                
                // Array methods: find, includes
                const category = Object.keys(categoryKeywords).find(cat => 
                    categoryKeywords[cat].some(keyword => desc.includes(keyword))
                );
                
                return category || 'Other';
            };
        })(); // Immediately invoked function expression (IIFE)
    }
    
    getSpendingByCategory() {
        // Filter withdrawals (negative amounts)
        const spending = this.account.transactions.filter(t => t.amount < 0);
        
        // Using reduce to create nested object
        const categories = spending.reduce((acc, transaction) => {
            const category = this.categorizeTransaction(transaction.description);
            
            // Nested object structure
            if (!acc[category]) {
                acc[category] = {
                    total: 0,
                    count: 0,
                    transactions: []
                };
            }
            
            acc[category].total += Math.abs(transaction.amount);
            acc[category].count++;
            acc[category].transactions.push(transaction);
            
            return acc;
        }, {});
        
        return categories;
    }
    
    getTopSpendingCategories(limit = 3) {
        const categories = this.getSpendingByCategory();
        
        // Convert to array of objects and sort
        return Object.entries(categories)
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);
    }
    
    getTotalSpent() {
        return this.account.transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }
}

// ============= NOTIFICATION SYSTEM (DEMONSTRATING CLOSURES) =============

class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notification-container');
        this.notifications = [];
        this.maxNotifications = 5;
    }
    
    // Closure for auto-remove functionality
    createNotification(message, type = 'info') {
        const id = Date.now();
        const notification = document.createElement('div');
        
        notification.className = `notification ${type}`;
        notification.id = `notif-${id}`;
        notification.innerHTML = `
            <span class="notification-text">${message}</span>
            <span class="notification-led"></span>
        `;
        
        this.container.appendChild(notification);
        
        // Closure: remove function has access to id, notification
        const remove = () => {
            const element = document.getElementById(`notif-${id}`);
            if (element) {
                element.style.animation = 'slideOut 0.5s forwards';
                setTimeout(() => element.remove(), 500);
            }
        };
        
        // setTimeout example (asynchronous)
        setTimeout(remove, 3000);
        
        this.notifications.unshift({ id, message, type });
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.pop();
        }
        
        return { id, remove };
    }
}

// ============= MAIN APPLICATION CLASS =============

class FinFlowApp {
    constructor() {
        this.accounts = new Map();
        this.currentAccount = null;
        this.notifications = new NotificationSystem();
        
        // Bind methods to maintain 'this' context
        this.selectAccount = this.selectAccount.bind(this);
        this.handleAction = this.handleAction.bind(this);
        
        this.init();
    }
    
    init() {
        try {
            this.createAccounts();
            this.setupEventListeners();
            this.startAnimations();
            this.render();
            
            // Async simulation (Promise + async/await)
            this.simulateAsyncOperation();
            
        } catch (error) {
            // Error object and try/catch
            console.error('Initialization error:', error);
            this.showNotification('System initialization failed', 'error');
        }
    }
    
    async simulateAsyncOperation() {
        // Promise example
        const fetchBalance = new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const total = Array.from(this.accounts.values())
                        .reduce((sum, acc) => sum + acc.balance, 0);
                    resolve(total);
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });
        
        try {
            // Await example
            const totalBalance = await fetchBalance;
            console.log('Total system balance:', totalBalance);
        } catch (error) {
            this.showNotification('Failed to fetch balance', 'error');
        }
    }
    
    createAccounts() {
        // Create accounts with initial data
        const checking = new BankAccount('checking', '4512', 2450.00);
        const savings = new BankAccount('savings', '7834', 12500.00);
        
        // Add sample transactions
        const sampleTransactions = [
            { account: checking, amount: 1500, desc: 'Paycheck Deposit', type: 'deposit' },
            { account: checking, amount: 250, desc: 'Grocery Store', type: 'withdraw' },
            { account: checking, amount: 800, desc: 'Freelance Payment', type: 'deposit' },
            { account: checking, amount: 150, desc: 'Gas Station', type: 'withdraw' },
            { account: checking, amount: 450, desc: 'Tax Refund', type: 'deposit' },
            { account: savings, amount: 2000, desc: 'Monthly Savings', type: 'deposit' },
            { account: savings, amount: 500, desc: 'Birthday Gift', type: 'deposit' },
            { account: savings, amount: 300, desc: 'Emergency Fund', type: 'withdraw' },
            { account: savings, amount: 1000, desc: 'Bonus', type: 'deposit' }
        ];
        
        sampleTransactions.forEach(({ account, amount, desc, type }) => {
            if (type === 'deposit') {
                account.deposit(amount, desc);
            } else {
                account.withdraw(amount, desc);
            }
        });
        
        this.accounts.set('checking', checking);
        this.accounts.set('savings', savings);
        this.currentAccount = checking;
    }
    
    setupEventListeners() {
        // DOM element selectors
        const cards = document.querySelectorAll('.bank-card');
        const buttons = document.querySelectorAll('.terminal-btn');
        const dial = document.getElementById('amount-dial');
        const dialValue = document.getElementById('dial-value');
        const amountInput = document.getElementById('amount-input');
        const form = document.getElementById('transaction-form');
        const transactionType = document.getElementById('transaction-type');
        const modalCancel = document.getElementById('modal-cancel');
        const analyticsClose = document.getElementById('analytics-close');
        
        // Bank card selection
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const accountType = card.dataset.account;
                this.selectAccount(accountType);
            });
            
            // Keyboard events
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const accountType = card.dataset.account;
                    this.selectAccount(accountType);
                }
            });
        });
        
        // Action buttons
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleAction(action);
            });
        });
        
        // Amount dial (range input)
        dial.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            dialValue.textContent = Formatter.currency(value);
            amountInput.value = value.toFixed(2);
        });
        
        // Amount text input
        amountInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) || 0;
            if (value <= 5000) {
                dial.value = value;
                dialValue.textContent = Formatter.currency(value);
            }
        });
        
        // Transaction form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // FormData destructuring
            const formData = new FormData(form);
            const data = {
                type: formData.get('type'),
                amount: parseFloat(formData.get('amount')),
                description: formData.get('description').trim(),
                toAccount: formData.get('toAccount')
            };
            
            this.processTransaction(data);
        });
        
        // Transaction type change
        transactionType.addEventListener('change', () => {
            this.updateModalForTransactionType();
        });
        
        // Modal cancel button
        modalCancel.addEventListener('click', () => {
            this.closeModal('transaction-modal');
        });
        
        // Analytics close button
        analyticsClose.addEventListener('click', () => {
            this.closeModal('analytics-modal');
        });
        
        // Close modals on overlay click (DOM navigation)
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                }
            });
        });
        
        // Clock update (setInterval)
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Memory usage simulation
        this.updateMemoryUsage();
        setInterval(() => this.updateMemoryUsage(), 3000);
    }
    
    selectAccount(accountType) {
        const account = this.accounts.get(accountType);
        if (!account) return;
        
        this.currentAccount = account;
        
        // DOM manipulation: classList
        document.querySelectorAll('.bank-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-account="${accountType}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Update display
        this.renderTransactions();
        this.showNotification(`${accountType.toUpperCase()} ACCOUNT SELECTED`, 'success');
    }
    
    handleAction(action) {
        if (!this.currentAccount && action !== 'analytics') {
            this.showNotification('Please select an account first', 'error');
            return;
        }
        
        switch(action) {
            case 'deposit':
            case 'withdraw':
            case 'transfer':
                this.openTransactionModal(action);
                break;
            case 'analytics':
                this.showAnalytics();
                break;
        }
    }
    
    openTransactionModal(type) {
        const modal = document.getElementById('transaction-modal');
        const form = document.getElementById('transaction-form');
        const typeSelect = document.getElementById('transaction-type');
        const amountInput = document.getElementById('transaction-amount');
        const transferGroup = document.getElementById('transfer-account-group');
        const transferSelect = document.getElementById('transfer-account');
        
        // Reset form
        form.reset();
        typeSelect.value = type;
        
        // Set amount from dial
        const dialValue = parseFloat(document.getElementById('amount-input').value) || 0;
        if (dialValue > 0) {
            amountInput.value = dialValue.toFixed(2);
        }
        
        // Update modal title
        document.getElementById('modal-title').textContent = `${type.toUpperCase()} CONSOLE`;
        
        // Show/hide transfer account field
        transferGroup.style.display = type === 'transfer' ? 'block' : 'none';
        
        // Set transfer options
        if (this.currentAccount && transferSelect) {
            const otherAccount = this.currentAccount.type === 'checking' ? 'savings' : 'checking';
            transferSelect.value = otherAccount;
        }
        
        // Show modal
        modal.style.display = 'flex';
        amountInput.focus();
    }
    
    updateModalForTransactionType() {
        const type = document.getElementById('transaction-type').value;
        const modalTitle = document.getElementById('modal-title');
        const transferGroup = document.getElementById('transfer-account-group');
        
        modalTitle.textContent = `${type.toUpperCase()} CONSOLE`;
        transferGroup.style.display = type === 'transfer' ? 'block' : 'none';
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    processTransaction(data) {
        // Destructure data
        const { type, amount, description, toAccount: toAccountType } = data;
        
        try {
            if (!amount || amount <= 0) {
                throw new Error('Invalid amount');
            }
            
            if (!description) {
                throw new Error('Description required');
            }
            
            let result;
            
            switch(type) {
                case 'deposit':
                    result = this.currentAccount.deposit(amount, description);
                    this.showNotification(`Deposited ${Formatter.currency(amount)}`, 'success');
                    break;
                    
                case 'withdraw':
                    result = this.currentAccount.withdraw(amount, description);
                    this.showNotification(`Withdrew ${Formatter.currency(amount)}`, 'success');
                    break;
                    
                case 'transfer':
                    const toAccount = this.accounts.get(toAccountType);
                    if (!toAccount) {
                        throw new Error('Invalid destination account');
                    }
                    
                    // Using transfer method with object destructuring
                    result = this.currentAccount.transfer({
                        amount,
                        description,
                        toAccount
                    });
                    
                    this.showNotification(
                        `Transferred ${Formatter.currency(amount)} to ${toAccountType}`,
                        'success'
                    );
                    break;
            }
            
            // Update UI
            this.render();
            this.closeModal('transaction-modal');
            
            // Reset dial
            document.getElementById('amount-dial').value = 0;
            document.getElementById('amount-input').value = '';
            document.getElementById('dial-value').textContent = '$0.00';
            
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }
    
    showAnalytics() {
        if (!this.currentAccount) {
            this.showNotification('Please select an account first', 'error');
            return;
        }
        
        const analytics = new SpendingAnalytics(this.currentAccount);
        const topCategories = analytics.getTopSpendingCategories();
        const totalSpent = analytics.getTotalSpent();
        
        if (totalSpent === 0) {
            this.showNotification('No spending data available', 'error');
            return;
        }
        
        // Generate analytics HTML
        const analyticsContent = document.getElementById('analytics-content');
        
        analyticsContent.innerHTML = `
            <div style="margin-bottom: 1.5rem; text-align: center;">
                <div style="font-size: 0.9rem; opacity: 0.8;">Total Spending</div>
                <div style="font-size: 2rem; color: var(--led-on);">${Formatter.currency(totalSpent)}</div>
            </div>
            ${topCategories.map(({ category, total, count }) => {
                const percent = (total / totalSpent) * 100;
                return `
                    <div class="analytics-row">
                        <span class="analytics-cat">${category}</span>
                        <div class="analytics-bar" style="width: ${percent}%"></div>
                        <span class="analytics-percent">${percent.toFixed(1)}% (${count})</span>
                    </div>
                `;
            }).join('')}
        `;
        
        document.getElementById('analytics-modal').style.display = 'flex';
    }
    
    renderTransactions() {
        const tbody = document.getElementById('transaction-list');
        
        if (!this.currentAccount) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-transactions">SELECT AN ACCOUNT</td></tr>';
            return;
        }
        
        const transactions = this.currentAccount.getRecentTransactions();
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-transactions">NO TRANSACTIONS</td></tr>';
            return;
        }
        
        tbody.innerHTML = transactions.map(trans => `
            <tr>
                <td>${trans.formattedDate}</td>
                <td>${trans.description}</td>
                <td class="${trans.amount >= 0 ? 'credit' : 'debit'}">${trans.formattedAmount}</td>
                <td>${Formatter.currency(trans.balanceAfter)}</td>
            </tr>
        `).join('');
    }
    
    render() {
        // Update all account balances and progress bars
        this.accounts.forEach((account, type) => {
            const balanceEl = document.getElementById(`${type}-balance`);
            const progressBar = document.getElementById(`${type}-progress`);
            
            if (balanceEl) {
                balanceEl.textContent = account.formattedBalance;
            }
            
            if (progressBar) {
                const percent = Math.min(account.savingsProgress, 100);
                setTimeout(() => {
                    progressBar.style.width = `${percent}%`;
                }, 100);
            }
        });
        
        this.renderTransactions();
    }
    
    updateClock() {
        const clock = document.getElementById('digital-clock');
        if (!clock) return;
        
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    updateMemoryUsage() {
        const memoryEl = document.getElementById('memory-usage');
        const statusLed = document.querySelector('.status-led');
        if (!memoryEl) return;
        
        const usage = 70 + Math.random() * 25;
        memoryEl.textContent = `${Math.round(usage)}%`;
        
        if (usage > 90) {
            statusLed.style.background = '#ff0000';
        } else if (usage > 85) {
            statusLed.style.background = '#ffff00';
        } else {
            statusLed.style.background = 'var(--led-on)';
        }
    }
    
    showNotification(message, type = 'info') {
        this.notifications.createNotification(message, type);
    }
    
    startAnimations() {
        setTimeout(() => this.render(), 300);
        
        // Random LED flickers
        setInterval(() => {
            const leds = document.querySelectorAll('.btn-led');
            if (leds.length > 0) {
                const randomLed = leds[Math.floor(Math.random() * leds.length)];
                randomLed.style.background = 'var(--led-on)';
                setTimeout(() => {
                    randomLed.style.background = 'var(--led-off)';
                }, 200);
            }
        }, 4000);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.finFlowApp = new FinFlowApp();
});

// Export for module demonstration
export { BankAccount, Transaction, SpendingAnalytics, Formatter };