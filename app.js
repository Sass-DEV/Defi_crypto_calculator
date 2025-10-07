// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-cyan-400', 'border-b-2', 'border-cyan-400');
        btn.classList.add('hover:text-cyan-400');
    });
    
    event.target.classList.remove('hover:text-cyan-400');
    event.target.classList.add('text-cyan-400', 'border-b-2', 'border-cyan-400');
    
    // Initialize charts when switching tabs
    if (tabName === 'calculator') {
        setTimeout(() => drawYieldChart(), 100);
    } else if (tabName === 'comparison') {
        loadProtocolComparison();
    }
}

// Protocol Data
const protocols = [
    {
        name: 'Aave',
        symbol: 'AAVE',
        apy: {
            stable: 8.5,
            variable: 12.3
        },
        tvl: '5.2B',
        risk: 'Low',
        chains: ['Ethereum', 'Polygon', 'Avalanche'],
        color: '#B6509E'
    },
    {
        name: 'Compound',
        symbol: 'COMP',
        apy: {
            stable: 6.8,
            variable: 9.5
        },
        tvl: '3.8B',
        risk: 'Low',
        chains: ['Ethereum'],
        color: '#00D395'
    },
    {
        name: 'Curve',
        symbol: 'CRV',
        apy: {
            stable: 4.2,
            variable: 15.6
        },
        tvl: '4.5B',
        risk: 'Low-Medium',
        chains: ['Ethereum', 'Polygon', 'Arbitrum'],
        color: '#FF0420'
    },
    {
        name: 'Yearn',
        symbol: 'YFI',
        apy: {
            stable: 10.5,
            variable: 18.9
        },
        tvl: '1.2B',
        risk: 'Medium',
        chains: ['Ethereum', 'Fantom'],
        color: '#0657F9'
    },
    {
        name: 'PancakeSwap',
        symbol: 'CAKE',
        apy: {
            stable: 12.3,
            variable: 45.6
        },
        tvl: '2.1B',
        risk: 'Medium',
        chains: ['BSC'],
        color: '#633511'
    },
    {
        name: 'Convex',
        symbol: 'CVX',
        apy: {
            stable: 8.9,
            variable: 22.4
        },
        tvl: '3.6B',
        risk: 'Medium',
        chains: ['Ethereum'],
        color: '#3A3A3A'
    }
];

// Yield Calculator
function calculateYield() {
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const apy = parseFloat(document.getElementById('apy').value) / 100 || 0;
    const timeValue = parseFloat(document.getElementById('timeValue').value) || 1;
    const timePeriod = document.getElementById('timePeriod').value;
    const compoundFreq = parseFloat(document.getElementById('compoundFreq').value) || 365;
    
    // Convert time to years
    let years;
    switch(timePeriod) {
        case 'days':
            years = timeValue / 365;
            break;
        case 'months':
            years = timeValue / 12;
            break;
        default:
            years = timeValue;
    }
    
    // Calculate compound interest
    // A = P(1 + r/n)^(nt)
    const rate = apy;
    const finalAmount = principal * Math.pow((1 + rate/compoundFreq), compoundFreq * years);
    const totalEarnings = finalAmount - principal;
    const roi = (totalEarnings / principal) * 100;
    
    // Calculate daily, monthly, yearly earnings
    const dailyRate = Math.pow(1 + apy, 1/365) - 1;
    const monthlyRate = Math.pow(1 + apy, 1/12) - 1;
    
    const dailyEarnings = principal * dailyRate;
    const monthlyEarnings = principal * monthlyRate;
    const yearlyEarnings = principal * apy;
    
    // Update UI
    document.getElementById('finalAmount').textContent = `$${finalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('totalEarnings').textContent = `+$${totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('roi').textContent = `${roi.toFixed(2)}%`;
    
    document.getElementById('dailyEarnings').textContent = `$${dailyEarnings.toFixed(2)}`;
    document.getElementById('monthlyEarnings').textContent = `$${monthlyEarnings.toFixed(2)}`;
    document.getElementById('yearlyEarnings').textContent = `$${yearlyEarnings.toFixed(2)}`;
    
    // Draw chart
    drawYieldChart(principal, apy, years);
}

// Draw Yield Chart
let yieldChart = null;
function drawYieldChart(principal = 1000, apy = 0.2, years = 1) {
    const ctx = document.getElementById('yieldChart').getContext('2d');
    
    // Generate data points
    const months = Math.ceil(years * 12);
    const labels = [];
    const compoundData = [];
    const simpleData = [];
    
    for (let i = 0; i <= months; i++) {
        labels.push(`Month ${i}`);
        const t = i / 12; // Convert to years
        
        // Compound interest
        const compoundValue = principal * Math.pow((1 + apy), t);
        compoundData.push(compoundValue);
        
        // Simple interest
        const simpleValue = principal * (1 + apy * t);
        simpleData.push(simpleValue);
    }
    
    // Destroy existing chart
    if (yieldChart) {
        yieldChart.destroy();
    }
    
    // Create new chart
    yieldChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Compound Interest',
                data: compoundData,
                borderColor: 'rgb(34, 211, 238)',
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                tension: 0.4
            }, {
                label: 'Simple Interest',
                data: simpleData,
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderDash: [5, 5],
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        maxTicksLimit: 10
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Load Protocol Comparison
function loadProtocolComparison() {
    const container = document.getElementById('protocolCards');
    container.innerHTML = '';
    container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    
    protocols.forEach(protocol => {
        const card = document.createElement('div');
        card.className = 'bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer transform hover:scale-105';
        card.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style="background-color: ${protocol.color}20; border: 2px solid ${protocol.color}">
                        ${protocol.symbol.substring(0, 2)}
                    </div>
                    <div>
                        <div class="font-semibold">${protocol.name}</div>
                        <div class="text-xs text-gray-400">${protocol.symbol}</div>
                    </div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full ${
                    protocol.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                    protocol.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                }">${protocol.risk}</span>
            </div>
            
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Stable APY:</span>
                    <span class="text-cyan-400 font-semibold">${protocol.apy.stable}%</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Variable APY:</span>
                    <span class="text-purple-400 font-semibold">${protocol.apy.variable}%</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">TVL:</span>
                    <span>$${protocol.tvl}</span>
                </div>
            </div>
            
            <div class="mt-3 pt-3 border-t border-white/10">
                <div class="flex flex-wrap gap-1">
                    ${protocol.chains.map(chain => 
                        `<span class="text-xs bg-white/10 px-2 py-1 rounded">${chain}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Draw comparison chart
    drawComparisonChart();
}

// Draw Protocol Comparison Chart
let comparisonChart = null;
function drawComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    const labels = protocols.map(p => p.name);
    const stableData = protocols.map(p => p.apy.stable);
    const variableData = protocols.map(p => p.apy.variable);
    
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stable APY',
                data: stableData,
                backgroundColor: 'rgba(34, 211, 238, 0.6)',
                borderColor: 'rgb(34, 211, 238)',
                borderWidth: 1
            }, {
                label: 'Variable APY',
                data: variableData,
                backgroundColor: 'rgba(168, 85, 247, 0.6)',
                borderColor: 'rgb(168, 85, 247)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Calculate Impermanent Loss
function calculateIL() {
    const tokenAInitial = parseFloat(document.getElementById('tokenAInitial').value) || 0;
    const tokenBInitial = parseFloat(document.getElementById('tokenBInitial').value) || 0;
    const tokenACurrent = parseFloat(document.getElementById('tokenACurrent').value) || 0;
    const tokenBCurrent = parseFloat(document.getElementById('tokenBCurrent').value) || 0;
    const investment = parseFloat(document.getElementById('ilInvestment').value) || 0;
    
    // Calculate price ratios
    const initialRatio = tokenAInitial / tokenBInitial;
    const currentRatio = tokenACurrent / tokenBCurrent;
    const priceRatio = currentRatio / initialRatio;
    
    // Calculate impermanent loss
    const ilFactor = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio);
    const ilPercentage = (1 - ilFactor) * 100;
    
    // Calculate values
    const tokenAChange = tokenACurrent / tokenAInitial;
    const tokenBChange = tokenBCurrent / tokenBInitial;
    
    // Value if held (50/50 split initially)
    const hodlValue = investment * 0.5 * tokenAChange + investment * 0.5 * tokenBChange;
    
    // Value in LP
    const lpValue = investment * ilFactor * ((tokenAChange + tokenBChange) / 2);
    
    // Loss amount
    const lossAmount = hodlValue - lpValue;
    
    // Update UI
    document.getElementById('ilPercentage').textContent = ilPercentage.toFixed(2) + '%';
    document.getElementById('hodlValue').textContent = `$${hodlValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('lpValue').textContent = `$${lpValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('lossAmount').textContent = `-$${Math.abs(lossAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

// Gas Optimization Calculator
function optimizeGas() {
    const investment = parseFloat(document.getElementById('gasInvestment').value) || 0;
    const apy = parseFloat(document.getElementById('gasApy').value) / 100 || 0;
    const gasPrice = parseFloat(document.getElementById('gasPrice').value) || 30;
    const ethPrice = parseFloat(document.getElementById('ethPrice').value) || 2000;
    
    // Estimate gas units for compound transaction (approx 150k gas)
    const gasUnits = 150000;
    const gasCostWei = gasPrice * gasUnits * 1e9; // Convert gwei to wei
    const gasCostEth = gasCostWei / 1e18;
    const gasCostUsd = gasCostEth * ethPrice;
    
    // Calculate optimal frequency
    const frequencies = [
        { name: 'Hourly', times: 8760, factor: 8760 },
        { name: 'Daily', times: 365, factor: 365 },
        { name: 'Weekly', times: 52, factor: 52 },
        { name: 'Monthly', times: 12, factor: 12 },
        { name: 'Quarterly', times: 4, factor: 4 },
        { name: 'Annually', times: 1, factor: 1 }
    ];
    
    let bestFreq = null;
    let bestNetApy = 0;
    
    frequencies.forEach(freq => {
        // Calculate compound value
        const compoundValue = investment * Math.pow((1 + apy/freq.factor), freq.factor);
        const yearlyGasCost = gasCostUsd * freq.times;
        const netValue = compoundValue - yearlyGasCost;
        const netApy = ((netValue - investment) / investment) * 100;
        
        if (netApy > bestNetApy) {
            bestNetApy = netApy;
            bestFreq = freq;
        }
    });
    
    // Calculate break-even point (days until first compound is profitable)
    const dailyEarnings = investment * (Math.pow(1 + apy, 1/365) - 1);
    const breakEvenDays = Math.ceil(gasCostUsd / dailyEarnings);
    
    // Update UI
    document.getElementById('optimalFreq').textContent = bestFreq.name;
    document.getElementById('gasCost').textContent = `$${gasCostUsd.toFixed(2)}`;
    document.getElementById('netApy').textContent = `${bestNetApy.toFixed(2)}%`;
    document.getElementById('breakeven').textContent = `${breakEvenDays} days`;
}

// Toggle Learn Sections
function toggleLearnSection(section) {
    const element = document.getElementById(`learn-${section}`);
    const icon = event.currentTarget.querySelector('i.fa-chevron-down');
    
    if (element.classList.contains('hidden')) {
        element.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        element.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Calculate initial values
    calculateYield();
    
    // Add input listeners for real-time updates
    ['principal', 'apy', 'timeValue', 'timePeriod', 'compoundFreq'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateYield);
    });
    
    ['tokenAInitial', 'tokenBInitial', 'tokenACurrent', 'tokenBCurrent', 'ilInvestment'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateIL);
    });
    
    ['gasInvestment', 'gasApy', 'gasPrice', 'ethPrice'].forEach(id => {
        document.getElementById(id).addEventListener('input', optimizeGas);
    });
    
    // Initialize with sample data
    calculateIL();
    optimizeGas();
});
