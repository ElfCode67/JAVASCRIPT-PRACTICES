// Bank Account Class
class BankAccount {
    constructor(type, number, initialBalance = 0) {
        this.type = type;
        this.number = number;
        this.balance = initialBalance;
        this.transactions = [];
    }

    deposit(amount, description) {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }

        this.balance += amount;
        this.addTransaction('deposit', amount, description);
        return this.balance;
    }

    withdraw(amount, description) {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }
        if (amount > this.balance) {
            throw new Error('Insufficient funds');
        }

        this.balance -= amount;
        this.addTransaction('withdrawal', -amount, description);
        return this.balance;
    }

    addTransaction(type, amount, description) {
        const transaction = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            date: new Date(),
            type: type,
            amount: amount,
            description: description,
            balanceAfter: this.balance
        };

        this.transactions.unshift(transaction);
        return transaction;
    }

    getRecentTransactions(limit = 10) {
        return this.transactions.slice(0, limit);
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
        this.createAccounts();
        this.setupEventListeners();
        this.startAnimations();
        this.render();
    }

    createAccounts() {
        // Create checking account
        const checking = new BankAccount('checking', '4512', 2450.00);
        checking.deposit(1500, 'Paycheck Deposit');
        checking.withdraw(250, 'Grocery Store');
        checking.deposit(800, 'Freelance Payment');
        checking.withdraw(150, 'Gas Station');
        checking.deposit(450, 'Tax Refund');

        // Create savings account
        const savings = new BankAccount('savings', '7834', 12500.00);
        savings.deposit(2000, 'Monthly Savings');
        savings.deposit(500, 'Birthday Gift');
        savings.withdraw(300, 'Emergency Fund');
        savings.deposit(1000, 'Bonus');

        this.accounts.set('checking', checking);
        this.accounts.set('savings', savings);
        this.currentAccount = checking;
    }

    setupEventListeners() {
        // Bank card selection
        document.querySelectorAll('.bank-card').forEach(card => {
            card.addEventListener('click', () => {
                const accountType = card.dataset.account;
                this.selectAccount(accountType);
            });

            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const accountType = card.dataset.account;
                    this.selectAccount(accountType);
                }
            });
        });

        // Action buttons
        document.querySelectorAll('.terminal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleAction(action);
            });
        });

        // Amount dial
        const dial = document.getElementById('amount-dial');
        const dialValue = document.getElementById('dial-value');
        const amountInput = document.getElementById('amount-input');

        dial.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            dialValue.textContent = `$${value.toFixed(2)}`;
            amountInput.value = value.toFixed(2);
        });

        amountInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) || 0;
            if (value <= 5000) {
                dial.value = value;
                dialValue.textContent = `$${value.toFixed(2)}`;
            }
        });

        // Transaction form
        const form = document.getElementById('transaction-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processTransaction(new FormData(form));
        });

        // Transaction type change
        const transactionType = document.getElementById('transaction-type');
        transactionType.addEventListener('change', () => {
            this.updateModalForTransactionType();
        });

        // Modal cancel buttons
        document.getElementById('modal-cancel').addEventListener('click', () => {
            this.closeModal('transaction-modal');
        });

        document.getElementById('analytics-close').addEventListener('click', () => {
            this.closeModal('analytics-modal');
        });

        // Close modal on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                }
            });
        });

        // Clock update
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

        // Update visual selection
        document.querySelectorAll('.bank-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-account="${accountType}"]`).classList.add('selected');

        // Update transactions display
        this.renderTransactions();
        this.showNotification(`${accountType.toUpperCase()} ACCOUNT SELECTED`, 'info');
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
        const descInput = document.getElementById('transaction-description');
        const transferAccount = document.getElementById('transfer-account');

        // Reset form
        form.reset();
        typeSelect.value = type;
        
        // Set amount from dial
        const dialValue = parseFloat(document.getElementById('amount-input').value) || 0;
        if (dialValue > 0) {
            amountInput.value = dialValue.toFixed(2);
        }

        // Update modal title and fields
        this.updateModalForTransactionType();

        // Update transfer account options
        if (this.currentAccount) {
            const otherAccount = this.currentAccount.type === 'checking' ? 'savings' : 'checking';
            transferAccount.value = otherAccount;
        }

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
        modal.style.display = 'none';
    }

    processTransaction(formData) {
        const type = formData.get('type');
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description').trim();
        const toAccountType = formData.get('toAccount');

        if (!amount || amount <= 0) {
            this.showNotification('Invalid amount', 'error');
            return;
        }

        if (!description) {
            this.showNotification('Description required', 'error');
            return;
        }

        try {
            switch(type) {
                case 'deposit':
                    this.currentAccount.deposit(amount, description);
                    this.showNotification(`Deposited $${amount.toFixed(2)}`, 'success');
                    break;

                case 'withdraw':
                    this.currentAccount.withdraw(amount, description);
                    this.showNotification(`Withdrew $${amount.toFixed(2)}`, 'success');
                    break;

                case 'transfer':
                    const toAccount = this.accounts.get(toAccountType);
                    if (!toAccount) {
                        throw new Error('Invalid destination account');
                    }
                    this.currentAccount.withdraw(amount, `Transfer to ${toAccountType}`);
                    toAccount.deposit(amount, `Transfer from ${this.currentAccount.type}`);
                    this.showNotification(`Transferred $${amount.toFixed(2)} to ${toAccountType}`, 'success');
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

        const transactions = this.currentAccount.transactions;
        const spending = transactions.filter(t => t.amount < 0);

        if (spending.length === 0) {
            this.showNotification('No spending data available', 'error');
            return;
        }

        const totalSpent = spending.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const categories = {};

        // Categorize spending
        spending.forEach(trans => {
            const desc = trans.description.toLowerCase();
            let category = 'Other';

            if (desc.includes('grocery') || desc.includes('food')) {
                category = 'Food & Groceries';
            } else if (desc.includes('gas') || desc.includes('fuel') || desc.includes('transport')) {
                category = 'Transportation';
            } else if (desc.includes('transfer')) {
                category = 'Transfers';
            } else if (desc.includes('emergency') || desc.includes('medical')) {
                category = 'Emergency';
            }

            categories[category] = (categories[category] || 0) + Math.abs(trans.amount);
        });

        // Sort categories by amount
        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1]);

        // Generate analytics HTML
        const analyticsContent = document.getElementById('analytics-content');
        analyticsContent.innerHTML = `
            <div style="margin-bottom: 1.5rem; text-align: center;">
                <div style="font-size: 0.9rem; opacity: 0.8;">Total Spending</div>
                <div style="font-size: 2rem; color: var(--led-on);">$${totalSpent.toFixed(2)}</div>
            </div>
            ${sortedCategories.map(([cat, amount]) => {
                const percent = (amount / totalSpent * 100);
                return `
                    <div class="analytics-row">
                        <span class="analytics-cat">${cat}</span>
                        <div class="analytics-bar" style="width: ${percent}%"></div>
                        <span class="analytics-percent">${percent.toFixed(1)}%</span>
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
                <td>${trans.date.toLocaleDateString()}</td>
                <td>${trans.description}</td>
                <td class="${trans.amount >= 0 ? 'credit' : 'debit'}">
                    ${trans.amount >= 0 ? '+' : ''}$${Math.abs(trans.amount).toFixed(2)}
                </td>
                <td>$${trans.balanceAfter.toFixed(2)}</td>
            </tr>
        `).join('');
    }

    render() {
        // Update all account balances and progress bars
        this.accounts.forEach((account, type) => {
            const balanceEl = document.getElementById(`${type}-balance`);
            const progressBar = document.getElementById(`${type}-progress`);

            if (balanceEl) {
                balanceEl.textContent = `$${account.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }

            if (progressBar) {
                // Calculate progress based on a max value (e.g., $20,000)
                const maxValue = 20000;
                const percent = Math.min((account.balance / maxValue) * 100, 100);
                setTimeout(() => {
                    progressBar.style.width = `${percent}%`;
                }, 100);
            }
        });

        // Update transactions for current account
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

        // Simulate realistic memory usage (70-95%)
        const usage = 70 + Math.random() * 25;
        memoryEl.textContent = `${Math.round(usage)}%`;

        // Change LED color based on usage
        if (usage > 90) {
            statusLed.style.background = '#ff0000';
        } else if (usage > 85) {
            statusLed.style.background = '#ffff00';
        } else {
            statusLed.style.background = '#00ff9d';
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-text">${message}</span>
            <span class="notification-led"></span>
        `;

        container.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s forwards';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    startAnimations() {
        // Animate progress bars on load
        setTimeout(() => {
            this.render();
        }, 300);

        // Random LED flickers for visual interest
        setInterval(() => {
            const leds = document.querySelectorAll('.btn-led');
            if (leds.length > 0) {
                const randomLed = leds[Math.floor(Math.random() * leds.length)];
                const originalBg = randomLed.style.background;
                randomLed.style.background = 'var(--led-on)';
                setTimeout(() => {
                    randomLed.style.background = originalBg || 'var(--led-off)';
                }, 200);
            }
        }, 4000);
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.finFlowApp = new FinFlowApp();
});