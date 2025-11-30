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
    
    message += `As we welcome December, may this new month bring you peace, joy, and fulfillment in all your endeavors. Here's to new beginnings and wonderful possibilities!<br><br>`;
    message += `❄️ May your December be filled with warmth and happiness ❄️`;
    
    // Display the message
    generatedMessage.innerHTML = message;
    senderName.textContent = "Nile Hub";
    
    // Generate shareable link
    // Get current month name
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const currentMonth = monthNames[new Date().getMonth()];
    
    const params = new URLSearchParams({
        to: recipientName,
        msg: customMessage,
        month: currentMonth
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

// Check for URL parameters on page load
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipient = urlParams.get('to');
    const message = urlParams.get('msg');
    const month = urlParams.get('month');
    
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