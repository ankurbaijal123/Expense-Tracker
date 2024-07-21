
    const expenseData = [];
    let chart;

    document.getElementById('expense-form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        
        if (description && !isNaN(amount) && category && date) {
            addExpense(description, amount, category, date);
            document.getElementById('description').value = '';
            document.getElementById('amount').value = '';
            document.getElementById('category').value = '';
            document.getElementById('date').value = '';
        } else {
            alert('Please enter valid details.');
        }
    });

    document.getElementById('download-csv').addEventListener('click', function() {
        downloadCSV();
    });

    document.getElementById('download-pdf').addEventListener('click', function() {
        downloadPDF();
    });

    let totalAmount = 0;

    function addExpense(description, amount, category, date) {
        const table = document.getElementById('expense-table').getElementsByTagName('tbody')[0];
        const newRow = table.insertRow();
        const descCell = newRow.insertCell(0);
        const amountCell = newRow.insertCell(1);
        const catCell = newRow.insertCell(2);
        const dateCell = newRow.insertCell(3);
        descCell.textContent = description;
        amountCell.textContent = `Rs.${amount.toFixed(2)}`;
        catCell.textContent = category;
        dateCell.textContent = date;

        updateTotal(amount);

        expenseData.push({ description, amount, category, date });
        updateChart();
    }

    function updateTotal(amount) {
        totalAmount += amount;
        document.getElementById('total-amount').innerText = `Rs.${totalAmount.toFixed(2)}`;
    }

    function updateChart() {
        const ctx = document.getElementById('expense-chart').getContext('2d');
        const labels = [...new Set(expenseData.map(expense => expense.category))];
        const data = labels.map(label => {
            return expenseData
                .filter(expense => expense.category === label)
                .reduce((sum, expense) => sum + expense.amount, 0);
        });

        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update();
        } else {
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Expense Amount by Category',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    responsive: true
                }
            });
        }
    }

    function downloadCSV() {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Description,Amount,Category,Date\n";

        expenseData.forEach(expense => {
            csvContent += `${expense.description},Rs.${expense.amount.toFixed(2)},${expense.category},${expense.date}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'expenses.csv');
        document.body.appendChild(link);
        link.click();
    }

    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yOffset = 10;
        doc.text("Expense Report", 10, yOffset);
        yOffset += 10;

        expenseData.forEach(expense => {
            doc.text(`Rs.${expense.description}: Rs.${expense.amount.toFixed(2)}`, 10, yOffset);
            yOffset += 10;
        });

        doc.text(`Total: Rs.${totalAmount.toFixed(2)}`, 10, yOffset);
        doc.save('expenses.pdf');
    }
