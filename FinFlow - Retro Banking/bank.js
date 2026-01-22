// bank.js
class BankAccount {
    #balance;
    #transactions;
    #accountNumber;
    
    constructor(owner, type, initialBalance = 0) {
        this.owner = owner;
        this.type = type;
        this.#balance = initialBalance;
        this.#accountNumber = this.#generateAccountNumber();
        this.#transactions = [];
        this.createdAt = new Date();
    }
    
    // Private method (closure)
    #generateAccountNumber() {
        const prefix = 'FIN';
        const random = () => Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${random()}-${random()}`;
    }
    
    // Getter
    get balance() {
        return this.#balance;
    }
    
    get accountNumber() {
        return this.#accountNumber;
    }
    
    get transactions() {
        return [...this.#transactions]; // Return copy for encapsulation
    }
    
    // Methods with validation
    deposit(amount, description = 'Deposit') {
        if (amount <= 0) throw new Error('Amount must be positive');
        
        this.#balance += amount;
        this.#addTransaction('deposit', amount, description);
        this.#updateUI();
        return this.#balance;
    }
    
    withdraw(amount, description = 'Withdrawal') {
        if (amount <= 0) throw new Error('Amount must be positive');
        if (amount > this.#balance) throw new Error('Insufficient funds');
        
        this.#balance -= amount;
        this.#addTransaction('withdrawal', -amount, description);
        this.#updateUI();
        return this.#balance;
    }
    
    transfer(amount, toAccount, description = 'Transfer') {
        this.withdraw(amount, `Transfer to ${toAccount.accountNumber}`);
        toAccount.deposit(amount, `Transfer from ${this.accountNumber}`);
        return this.#balance;
    }
    
    // Private method
    #addTransaction(type, amount, description) {
        const transaction = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            date: new Date(),
            type,
            amount,
            description,
            balanceAfter: this.#balance
        };
        
        this.#transactions.unshift(transaction); // Add to beginning
        this.#saveToStorage();
        
        return transaction;
    }
    
    // LocalStorage integration
    #saveToStorage() {
        const data = {
            owner: this.owner,
            type: this.type,
            balance: this.#balance,
            accountNumber: this.#accountNumber,
            transactions: this.#transactions
        };
        localStorage.setItem(this.#accountNumber, JSON.stringify(data));
    }
    
    #updateUI() {
        // Update balance display
        const balanceEl = document.querySelector(`[data-account="${this.type}"] .card-balance`);
        if (balanceEl) {
            balanceEl.textContent = `$${this.#balance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
        
        // Update transaction list
        this.renderTransactions();
    }
    
    renderTransactions() {
        const tbody = document.getElementById('transaction-list');
        if (!tbody) return;
        
        tbody.innerHTML = this.#transactions.slice(0, 10).map(trans => `
            <tr>
                <td>${trans.date.toLocaleDateString()}</td>
                <td>${trans.description}</td>
                <td class="${trans.amount >= 0 ? 'credit' : 'debit'}">
                    ${trans.amount >= 0 ? '+' : ''}$${Math.abs(trans.amount).toFixed(2)}
                </td>
                <td>$${trans.balanceAfter.toFixed(2)}</td>
            </tr>
        `).join('');
    }
}

// Main Application Class
class FinFlowApp {
    constructor() {
        this.accounts = new Map();
        this.currentAccount = null;
        this.init();
    }
    
    init() {
        // Load from localStorage or create demo accounts
        this.loadAccounts();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start animations
        this.startAnimations();
        
        // Initial render
        this.render();
    }
    
    loadAccounts() {
        // Try loading from localStorage
        const keys = Object.keys(localStorage);
        const bankKeys = keys.filter(key => key.startsWith('FIN-'));
        
        if (bankKeys.length > 0) {
            bankKeys.forEach(key => {
                const data = JSON.parse(localStorage.getItem(key));
                const account = new BankAccount(data.owner, data.type, data.balance);
                // Manually restore transactions (constructor doesn't handle this)
                account.transactions = data.transactions;
                this.accounts.set(key, account);
            });
        } else {
            // Create demo accounts
            const checking = new BankAccount('John Doe', 'main', 2450.00);
            const savings = new BankAccount('John Doe', 'savings', 12500.00);
            
            // Add some demo transactions
            checking.deposit(500, 'Paycheck');
            checking.withdraw(150, 'Grocery Store');
            checking.deposit(300, 'Freelance Work');
            
            savings.deposit(1000, 'Monthly Savings');
            
            this.accounts.set(checking.accountNumber, checking);
            this.accounts.set(savings.accountNumber, savings);
            
            this.currentAccount = checking;
        }
    }
    
    setupEventListeners() {
        // Terminal button clicks
        document.querySelectorAll('.terminal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                this.handleAction(action);
                
                // Button press animation
                btn.classList.add('pressed');
                setTimeout(() => btn.classList.remove('pressed'), 200);
            });
        });
        
        // Amount dial interaction
        const dial = document.getElementById('amount-dial');
        const dialValue = document.querySelector('.dial-value');
        
        dial.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            dialValue.textContent = `$${value.toLocaleString()}`;
            
            // Create visual feedback
            const dialDisplay = document.querySelector('.dial-display');
            dialDisplay.style.transform = `translateX(-50%) scale(${1 + value / 10000})`;
        });
        
        // Modal form submission
        const modal = document.getElementById('transaction-modal');
        modal.addEventListener('close', (e) => {
            if (modal.returnValue === 'confirm') {
                const formData = new FormData(modal.querySelector('form'));
                this.processTransaction(formData);
            }
        });
        
        // Bank card selection
        document.querySelectorAll('.bank-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const accountType = card.dataset.account;
                this.selectAccount(accountType);
                
                // Visual feedback
                document.querySelectorAll('.bank-card').forEach(c => {
                    c.classList.remove('selected');
                });
                card.classList.add('selected');
            });
        });
        
        // Real-time clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Memory usage simulation
        this.updateMemoryUsage();
        setInterval(() => this.updateMemoryUsage(), 3000);
    }
    
    handleAction(action) {
        const modal = document.getElementById('transaction-modal');
        
        switch(action) {
            case 'deposit':
            case 'withdraw':
            case 'transfer':
                modal.showModal();
                modal.querySelector('[name="type"]').value = action;
                break;
                
            case 'analytics':
                this.showAnalytics();
                break;
        }
    }
    
    processTransaction(formData) {
        const type = formData.get('type');
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description');
        
        if (!this.currentAccount || !amount || amount <= 0) return;
        
        try {
            switch(type) {
                case 'deposit':
                    this.currentAccount.deposit(amount, description);
                    break;
                case 'withdraw':
                    this.currentAccount.withdraw(amount, description);
                    break;
                case 'transfer':
                    // For demo, transfer to savings account
                    const savings = Array.from(this.accounts.values())
                        .find(acc => acc.type === 'savings');
                    if (savings) {
                        this.currentAccount.transfer(amount, savings, description);
                    }
                    break;
            }
            
            // Visual confirmation
            this.showNotification(`${type.toUpperCase()} COMPLETE`, 'success');
            
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }
    
    selectAccount(accountType) {
        this.currentAccount = Array.from(this.accounts.values())
            .find(acc => acc.type === accountType);
        
        if (this.currentAccount) {
            this.currentAccount.renderTransactions();
            this.showNotification(`${accountType.toUpperCase()} SELECTED`, 'info');
        }
    }
    
    showAnalytics() {
        // Create a simple spending chart using CSS gradients
        const transactions = this.currentAccount?.transactions || [];
        const spending = transactions.filter(t => t.amount < 0);
        
        if (spending.length === 0) return;
        
        const totalSpent = spending.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const categories = {};
        
        spending.forEach(trans => {
            // Simple category detection
            const desc = trans.description.toLowerCase();
            let category = 'Other';
            
            if (desc.includes('grocery')) category = 'Food';
            else if (desc.includes('fuel') || desc.includes('gas')) category = 'Transport';
            else if (desc.includes('netflix') || desc.includes('spotify')) category = 'Entertainment';
            
            categories[category] = (categories[category] || 0) + Math.abs(trans.amount);
        });
        
        // Display analytics
        const analyticsHTML = Object.entries(categories)
            .map(([cat, amount]) => {
                const percent = (amount / totalSpent * 100).toFixed(1);
                return `
                    <div class="analytics-row">
                        <span class="analytics-cat">${cat}</span>
                        <div class="analytics-bar" style="--width: ${percent}%"></div>
                        <span class="analytics-percent">${percent}%</span>
                    </div>
                `;
            }).join('');
        
        // Show in modal or dedicated area
        this.showNotification('ANALYTICS GENERATED', 'info');
        
        // For demo, just log to console
        console.table(categories);
    }
    
    // UI Utility Methods
    updateClock() {
        const clock = document.getElementById('digital-clock');
        if (clock) {
            const now = new Date();
            clock.textContent = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    
    updateMemoryUsage() {
        const memoryEl = document.getElementById('memory-usage');
        if (memoryEl) {
            // Simulate realistic memory usage
            const usage = 70 + Math.random() * 30;
            memoryEl.textContent = `${Math.round(usage)}%`;
            
            // Change LED color based on usage
            const statusLed = document.querySelector('.status-led');
            if (usage > 90) {
                statusLed.style.background = '#ff0000';
            } else if (usage > 80) {
                statusLed.style.background = '#ffff00';
            } else {
                statusLed.style.background = '#00ff9d';
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-text">${message}</span>
            <span class="notification-led"></span>
        `;
        
        // Add to DOM
        document.querySelector('.banking-terminal').appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s forwards';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    startAnimations() {
        // Animate progress bars
        document.querySelectorAll('.progress-bar').forEach(bar => {
            const width = bar.style.getPropertyValue('--progress') || '0%';
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.transition = 'width 2s ease-in-out';
                bar.style.width = width;
            }, 500);
        });
        
        // Random LED flickers
        setInterval(() => {
            const leds = document.querySelectorAll('.btn-led');
            const randomLed = leds[Math.floor(Math.random() * leds.length)];
            if (randomLed) {
                randomLed.style.animation = 'none';
                setTimeout(() => {
                    randomLed.style.animation = 'blink 1s infinite';
                }, 10);
            }
        }, 3000);
    }
    
    render() {
        // Render all accounts
        this.accounts.forEach(account => {
            const card = document.querySelector(`[data-account="${account.type}"]`);
            if (card) {
                const balanceEl = card.querySelector('.card-balance');
                if (balanceEl) {
                    balanceEl.textContent = `$${account.balance.toFixed(2)}`;
                }
            }
        });
        
        // Render transactions for current account
        if (this.currentAccount) {
            this.currentAccount.renderTransactions();
        }
    }
}

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.finFlow = new FinFlowApp();
    
    // Add some CSS for dynamic elements
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 20, 20, 0.9);
            border: 1px solid var(--terminal-glow);
            padding: 1rem;
            border-radius: 6px;
            animation: slideIn 0.5s forwards;
            z-index: 10000;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .credit { color: #00ff9d; }
        .debit { color: #ff4444; }
        
        .pressed {
            transform: translateY(4px) scale(0.98);
        }
        
        .selected {
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.5) !important;
        }
    `;
    document.head.appendChild(style);
});