
// script.js

// Investment Portfolio Tracker

// Initialize investments array
let investments = [];

// DOM Elements
const addInvestmentBtn = document.getElementById('add-investment-btn');
const addInvestmentForm = document.getElementById('add-investment-form');
const investmentForm = document.getElementById('investment-form');
const closeAddFormBtn = document.getElementById('close-add-form');

const updateInvestmentFormSection = document.getElementById('update-investment-form');
const investmentUpdateForm = document.getElementById('investment-update-form');
const closeUpdateFormBtn = document.getElementById('close-update-form');

const investmentTableBody = document.getElementById('investment-table-body');
const totalPortfolioElem = document.getElementById('total-portfolio');

let currentUpdateIndex = null;

// Chart.js Variables
let portfolioChart = null;

// Load investments from localStorage
window.onload = function() {
    const storedInvestments = localStorage.getItem('investments');
    if (storedInvestments) {
        investments = JSON.parse(storedInvestments);
    }
    renderInvestments();
    renderChart();
};

// Event Listeners

// Show Add Investment Form
addInvestmentBtn.addEventListener('click', () => {
    addInvestmentForm.classList.remove('hidden');
});

// Close Add Investment Form
closeAddFormBtn.addEventListener('click', () => {
    addInvestmentForm.classList.add('hidden');
    investmentForm.reset();
});

// Add Investment
investmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const assetName = document.getElementById('asset-name').value.trim();
    const amountInvested = parseFloat(document.getElementById('amount-invested').value);
    const currentValue = parseFloat(document.getElementById('current-value').value);

    // Data Validation
    if (!assetName) {
        alert('Asset Name cannot be empty.');
        return;
    }
    if (isNaN(amountInvested) || amountInvested < 0) {
        alert('Amount Invested must be a positive number.');
        return;
    }
    if (isNaN(currentValue) || currentValue < 0) {
        alert('Current Value must be a positive number.');
        return;
    }

    const newInvestment = {
        assetName,
        amountInvested,
        currentValue
    };

    investments.push(newInvestment);
    saveInvestments();
    renderInvestments();
    renderChart();
    addInvestmentForm.classList.add('hidden');
    investmentForm.reset();
});

// Close Update Investment Form
closeUpdateFormBtn.addEventListener('click', () => {
    updateInvestmentFormSection.classList.add('hidden');
    investmentUpdateForm.reset();
    currentUpdateIndex = null;
});

// Update Investment
investmentUpdateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentUpdateIndex === null) return;

    const updatedAmountInvested = parseFloat(document.getElementById('update-amount-invested').value);
    const updatedCurrentValue = parseFloat(document.getElementById('update-current-value').value);

    // Data Validation
    if (isNaN(updatedAmountInvested) || updatedAmountInvested < 0) {
        alert('Amount Invested must be a positive number.');
        return;
    }
    if (isNaN(updatedCurrentValue) || updatedCurrentValue < 0) {
        alert('Current Value must be a positive number.');
        return;
    }

    investments[currentUpdateIndex].amountInvested = updatedAmountInvested;
    investments[currentUpdateIndex].currentValue = updatedCurrentValue;
    saveInvestments();
    renderInvestments();
    renderChart();
    updateInvestmentFormSection.classList.add('hidden');
    investmentUpdateForm.reset();
    currentUpdateIndex = null;
});

// Save investments to localStorage
function saveInvestments() {
    localStorage.setItem('investments', JSON.stringify(investments));
}

// Render Investments in Table
function renderInvestments() {
    // Clear existing rows
    investmentTableBody.innerHTML = '';

    let totalPortfolio = 0;

    investments.forEach((investment, index) => {
        const { assetName, amountInvested, currentValue } = investment;
        const percentageChange = ((currentValue - amountInvested) / amountInvested * 100).toFixed(2);

        totalPortfolio += currentValue;

        // Create table row
        const row = document.createElement('tr');

        // Asset Name
        const assetCell = document.createElement('td');
        assetCell.textContent = assetName;
        row.appendChild(assetCell);

        // Amount Invested
        const investedCell = document.createElement('td');
        investedCell.textContent = `$${amountInvested.toFixed(2)}`;
        row.appendChild(investedCell);

        // Current Value
        const currentCell = document.createElement('td');
        currentCell.textContent = `$${currentValue.toFixed(2)}`;
        row.appendChild(currentCell);

        // Percentage Change
        const changeCell = document.createElement('td');
        changeCell.textContent = `${percentageChange}%`;
        changeCell.style.color = percentageChange >= 0 ? 'green' : 'red';
        row.appendChild(changeCell);

        // Actions
        const actionsCell = document.createElement('td');

        // Update Button
        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Update';
        updateBtn.classList.add('update-btn');
        updateBtn.addEventListener('click', () => openUpdateForm(index));
        actionsCell.appendChild(updateBtn);

        // Remove Button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.classList.add('remove-btn');
        removeBtn.style.backgroundColor = '#dc3545';
        removeBtn.addEventListener('click', () => removeInvestment(index));
        actionsCell.appendChild(removeBtn);

        row.appendChild(actionsCell);

        investmentTableBody.appendChild(row);
    });

    // Update Total Portfolio Value
    totalPortfolioElem.textContent = totalPortfolio.toFixed(2);
}

// Open Update Form with Selected Investment Data
function openUpdateForm(index) {
    currentUpdateIndex = index;
    const investment = investments[index];
    document.getElementById('update-asset-name').value = investment.assetName;
    document.getElementById('update-amount-invested').value = investment.amountInvested.toFixed(2);
    document.getElementById('update-current-value').value = investment.currentValue.toFixed(2);
    updateInvestmentFormSection.classList.remove('hidden');
}

// Remove Investment
function removeInvestment(index) {
    if (confirm('Are you sure you want to remove this investment?')) {
        investments.splice(index, 1);
        saveInvestments();
        renderInvestments();
        renderChart();
    }
}

// Render Pie Chart using Chart.js
function renderChart() {
    const ctx = document.getElementById('portfolio-chart').getContext('2d');

    const assetNames = investments.map(inv => inv.assetName);
    const currentValues = investments.map(inv => inv.currentValue);
    const backgroundColors = generateColors(investments.length);

    if (portfolioChart) {
        portfolioChart.destroy();
    }

    portfolioChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: assetNames,
            datasets: [{
                data: currentValues,
                backgroundColor: backgroundColors,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Portfolio Asset Distribution'
                }
            }
        },
    });
}

// Generate Distinct Colors for Pie Chart
function generateColors(num) {
    const colors = [];
    const predefinedColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#C9CBCF', '#8A2BE2',
        '#00FA9A', '#FFD700', '#DC143C', '#00CED1'
    ];
    for (let i = 0; i < num; i++) {
        colors.push(predefinedColors[i % predefinedColors.length]);
    }
    return colors;
}
