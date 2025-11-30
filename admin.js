// Function to display visitor statistics
function displayStats() {
    // Get visitor data from localStorage
    const visitorData = JSON.parse(localStorage.getItem('visitorData')) || {
        totalVisits: 0,
        uniqueVisitors: 0,
        visitsByDate: {},
        visitorIds: []
    };
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Update stats
    document.getElementById('totalVisits').textContent = visitorData.totalVisits;
    document.getElementById('uniqueVisitors').textContent = visitorData.uniqueVisitors;
    document.getElementById('todaysVisits').textContent = visitorData.visitsByDate[today] || 0;
    
    // Display visits by date
    const visitsByDateContainer = document.getElementById('visitsByDate');
    
    if (Object.keys(visitorData.visitsByDate).length === 0) {
        visitsByDateContainer.innerHTML = '<p>No visit data available yet.</p>';
        return;
    }
    
    // Create a simple bar chart representation
    let chartHTML = '<div class="chart-container">';
    
    // Sort dates
    const sortedDates = Object.keys(visitorData.visitsByDate).sort();
    
    sortedDates.forEach(date => {
        const visits = visitorData.visitsByDate[date];
        chartHTML += `
            <div class="chart-bar">
                <div class="bar" style="height: ${visits * 20}px;">
                    <span class="visits-count">${visits}</span>
                </div>
                <div class="date-label">${date}</div>
            </div>
        `;
    });
    
    chartHTML += '</div>';
    visitsByDateContainer.innerHTML = chartHTML;
}

// Function to reset statistics
function resetStats() {
    if (confirm('Are you sure you want to reset all visitor statistics?')) {
        localStorage.removeItem('visitorData');
        displayStats();
        alert('Visitor statistics have been reset.');
    }
}

// Load stats when page loads
window.addEventListener('DOMContentLoaded', function() {
    displayStats();
});