// Visitor tracking function
function trackVisitor() {
    // Get current date
    const now = new Date();
    const visitDate = now.toISOString().split('T')[0];
    
    // Get existing visitor data from localStorage
    let visitorData = JSON.parse(localStorage.getItem('visitorData')) || {
        totalVisits: 0,
        uniqueVisitors: 0,
        visitsByDate: {},
        visitorIds: []
    };
    
    // Increment total visits
    visitorData.totalVisits++;
    
    // Generate a simple visitor identifier (in a real app, you might use a more robust method)
    const visitorId = 'visitor_' + Math.floor(Math.random() * 1000000);
    
    // Check if this is a new visitor (simple approach)
    if (!visitorData.visitorIds.includes(visitorId)) {
        visitorData.visitorIds.push(visitorId);
        visitorData.uniqueVisitors = visitorData.visitorIds.length;
    }
    
    // Track visits by date
    if (!visitorData.visitsByDate[visitDate]) {
        visitorData.visitsByDate[visitDate] = 0;
    }
    visitorData.visitsByDate[visitDate]++;
    
    // Save updated data
    localStorage.setItem('visitorData', JSON.stringify(visitorData));
    
    console.log('Visitor tracked:', visitorData);
}

// Secret Santa Game Functions
function startSecretSanta() {
    const participantName = document.getElementById('participantName').value.trim();
    const participantPhone = document.getElementById('participantPhone').value.trim();
    const participantList = document.getElementById('participantList').value.trim();
    const exclusions = document.getElementById('exclusions').value.trim();
    const budget = document.getElementById('budget').value;
    const wishlist = document.getElementById('wishlist').value.trim();
    const theme = document.getElementById('theme').value;
    const rounds = parseInt(document.getElementById('rounds').value);
    
    if (!participantName || !participantList) {
        alert('Please enter your name and at least one other participant.');
        return;
    }
    
    // Parse participants with phone numbers
    const participantsWithNumbers = {};
    const participantsList = participantList.split(',').map(entry => entry.trim()).filter(entry => entry);
    
    // Add current user
    participantsWithNumbers[participantName] = participantPhone;
    
    // Parse other participants
    participantsList.forEach(entry => {
        if (entry.includes(':')) {
            const [name, phone] = entry.split(':').map(item => item.trim());
            if (name && phone) {
                participantsWithNumbers[name] = phone;
            }
        } else {
            // If no phone number provided, just use the name
            participantsWithNumbers[entry] = '';
        }
    });
    
    const participants = Object.keys(participantsWithNumbers);
    
    if (participants.length < 2) {
        alert('Please enter at least one other participant.');
        return;
    }
    
    // Parse exclusions
    let exclusionRules = [];
    if (exclusions) {
        exclusionRules = exclusions.split(',').map(rule => {
            const [giver, receiver] = rule.split(':').map(name => name.trim());
            return { giver, receiver };
        });
    }
    
    // Generate assignments with exclusions
    let assignments = null;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        assignments = generateAssignments(participants, exclusionRules, rounds);
        if (assignments) break;
        attempts++;
    }
    
    if (!assignments) {
        alert('Could not generate valid assignments with the given exclusions. Please try different exclusions.');
        return;
    }
    
    // Save participant data
    const participantData = {
        name: participantName,
        phone: participantPhone,
        wishlist: wishlist,
        budget: budget,
        theme: theme
    };
    
    // Save to localStorage
    let santaData = JSON.parse(localStorage.getItem('santaData')) || {};
    santaData[participantName] = participantData;
    localStorage.setItem('santaData', JSON.stringify(santaData));
    
    // Display the assignment for the current user
    document.getElementById('participantNameDisplay').textContent = participantName;
    document.getElementById('recipientAssignment').textContent = assignments[participantName][0]; // First round
    
    // Display recipient's wishlist if available
    const recipientData = santaData[assignments[participantName][0]];
    const wishlistElement = document.getElementById('recipientWishlist');
    if (recipientData && recipientData.wishlist) {
        wishlistElement.innerHTML = `<strong>${assignments[participantName][0]}'s Wishlist:</strong><br>${recipientData.wishlist}`;
    } else {
        wishlistElement.innerHTML = `<em>${assignments[participantName][0]} hasn't provided a wishlist yet.</em>`;
    }
    
    // Display budget and theme
    const budgetText = {
        'any': 'Any amount',
        'low': '$10-$20',
        'medium': '$20-$50',
        'high': '$50+'
    };
    
    document.getElementById('budgetDisplay').textContent = budgetText[budget] || 'Any amount';
    document.getElementById('themeDisplay').textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    
    // Send WhatsApp notifications to all participants
    sendWhatsAppNotifications(assignments, participantsWithNumbers, budgetText[budget] || 'Any amount', theme);
    
    // Hide setup and show result
    document.getElementById('santaSetup').style.display = 'none';
    document.getElementById('santaResult').style.display = 'block';
}

function generateAssignments(participants, exclusionRules, rounds) {
    // Create a copy of participants to shuffle
    let shuffled = [...participants];
    
    // For each round, create assignments
    const assignments = {};
    
    for (let r = 0; r < rounds; r++) {
        // Reset assignments for this round
        const roundAssignments = {};
        
        // Shuffle participants
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Try to assign recipients
        let validAssignment = true;
        for (let i = 0; i < shuffled.length; i++) {
            const giver = shuffled[i];
            const receiver = shuffled[(i + 1) % shuffled.length];
            
            // Check exclusions
            const isExcluded = exclusionRules.some(rule => 
                (rule.giver === giver && rule.receiver === receiver) ||
                (rule.giver === '*' && rule.receiver === receiver) ||
                (rule.giver === giver && rule.receiver === '*')
            );
            
            if (isExcluded) {
                validAssignment = false;
                break;
            }
            
            if (!roundAssignments[giver]) {
                roundAssignments[giver] = [];
            }
            roundAssignments[giver].push(receiver);
        }
        
        if (!validAssignment) {
            return null; // Invalid assignment, try again
        }
        
        // Merge with overall assignments
        for (const giver in roundAssignments) {
            if (!assignments[giver]) {
                assignments[giver] = [];
            }
            assignments[giver] = assignments[giver].concat(roundAssignments[giver]);
        }
        
        // Rotate for next round
        shuffled = [...shuffled.slice(1), shuffled[0]];
    }
    
    return assignments;
}

function saveGame() {
    // Get current game data
    const gameData = {
        timestamp: new Date().toISOString(),
        participantName: document.getElementById('participantNameDisplay').textContent,
        recipient: document.getElementById('recipientAssignment').textContent,
        budget: document.getElementById('budgetDisplay').textContent,
        theme: document.getElementById('themeDisplay').textContent
    };
    
    // Save to localStorage
    let savedGames = JSON.parse(localStorage.getItem('savedSantaGames')) || [];
    savedGames.push(gameData);
    localStorage.setItem('savedSantaGames', JSON.stringify(savedGames));
    
    alert('Game saved successfully!');
}

function showSavedGames() {
    const savedGamesContainer = document.getElementById('savedGames');
    const savedGamesList = document.getElementById('savedGamesList');
    
    const savedGames = JSON.parse(localStorage.getItem('savedSantaGames')) || [];
    
    if (savedGames.length === 0) {
        savedGamesList.innerHTML = '<li>No saved games found.</li>';
    } else {
        savedGamesList.innerHTML = '';
        savedGames.forEach((game, index) => {
            const date = new Date(game.timestamp).toLocaleDateString();
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>Game from ${date}</strong><br>
                Participant: ${game.participantName}<br>
                Recipient: ${game.recipient}<br>
                Budget: ${game.budget}<br>
                Theme: ${game.theme}
            `;
            savedGamesList.appendChild(listItem);
        });
    }
    
    savedGamesContainer.style.display = 'block';
}

function clearSavedGames() {
    if (confirm('Are you sure you want to delete all saved games?')) {
        localStorage.removeItem('savedSantaGames');
        showSavedGames(); // Refresh the display
        alert('All saved games have been cleared.');
    }
}

function resetSecretSanta() {
    // Clear inputs
    document.getElementById('participantName').value = '';
    document.getElementById('participantList').value = '';
    document.getElementById('exclusions').value = '';
    document.getElementById('wishlist').value = '';
    document.getElementById('budget').value = 'any';
    document.getElementById('theme').value = 'christmas';
    document.getElementById('rounds').value = '1';
    
    // Hide result and show setup
    document.getElementById('santaResult').style.display = 'none';
    document.getElementById('santaSetup').style.display = 'block';
    document.getElementById('savedGames').style.display = 'none';
}

// Get DOM elements
const wishForm = document.getElementById('wishForm');
const messageDisplay = document.getElementById('messageDisplay');
const generatedMessage = document.getElementById('generatedMessage');
const senderName = document.getElementById('senderName');
const shareLink = document.getElementById('shareLink');

// Form submission handler
wishForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const recipientName = document.getElementById('recipientName').value;
    const customMessage = document.getElementById('customMessage').value;
    
    // Generate the message
    let message = `Wishing you a very Happy New Month, ${recipientName}! 🎉<br><br>`;
    
    if (customMessage) {
        message += `"${customMessage}"<br><br>`;
    }
    
    message += `May this new month bring you joy, success, and fulfillment in all your endeavors. Here's to new beginnings and amazing possibilities!<br><br>`;
    message += `✨ May your days be bright and your heart be light ✨`;
    
    // Display the message
    generatedMessage.innerHTML = message;
    senderName.textContent = "Nile Hub";
    
    // Generate shareable link
    const params = new URLSearchParams({
        to: recipientName,
        msg: customMessage
    });
    shareLink.value = `${window.location.href}?${params.toString()}`;
    
    // Show the message display section
    messageDisplay.style.display = 'block';
    
    // Scroll to the message
    messageDisplay.scrollIntoView({ behavior: 'smooth' });
});

// Sharing functions
function shareToWhatsApp() {
    const message = encodeURIComponent(generatedMessage.innerText);
    const url = `https://wa.me/?text=${message}%0A%0ACheck%20out%20this%20awesome%20New%20Month%20greeting:%20${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

function shareToFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

function shareToInstagram() {
    alert("To share on Instagram, please copy the link and paste it in your Instagram story or post.");
}

function shareToTikTok() {
    alert("To share on TikTok, please copy the link and paste it in your TikTok video description.");
}

function copyLink() {
    shareLink.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}

function sendWhatsAppNotifications(assignments, participantsWithNumbers, budget, theme) {
    // Send notification to each participant
    for (const giver in assignments) {
        const phoneNumber = participantsWithNumbers[giver];
        if (phoneNumber) {
            // Create message for each round
            let message = `🎄 *Secret Santa Assignment* 🎁\n\n`;
            message += `Hello ${giver}!\n\n`;
            message += `You have been assigned as Secret Santa for:\n`;
            
            assignments[giver].forEach((receiver, index) => {
                message += `${index + 1}. ${receiver}\n`;
            });
            
            message += `\nBudget: ${budget}\n`;
            message += `Theme: ${theme}\n\n`;
            message += `Happy Gifting! 🎁✨`;
            
            // In a real implementation, you would send this via a WhatsApp API
            // For now, we'll log it to the console and show an alert
            console.log(`WhatsApp notification for ${giver}:`, message);
            
            // Show notification to the current user if they have a phone number
            if (giver === document.getElementById('participantName').value.trim()) {
                alert(`WhatsApp notification would be sent to ${phoneNumber} with the assignment details.`);
            }
        }
    }
}

// Check for URL parameters on page load
window.addEventListener('DOMContentLoaded', function() {
    // Track visitor
    trackVisitor();
    
    const urlParams = new URLSearchParams(window.location.search);
    const recipient = urlParams.get('to');
    const message = urlParams.get('msg');
    
    if (recipient) {
        // Pre-fill the form with URL parameters
        document.getElementById('recipientName').value = recipient;
        document.getElementById('customMessage').value = message || '';
        
        // Automatically generate the message
        setTimeout(() => {
            wishForm.dispatchEvent(new Event('submit'));
        }, 500);
    }
});