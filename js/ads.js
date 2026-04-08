export function triggerAdSlide() {
    const adSlot = document.getElementById('adSlot');
    if (adSlot) {
        // User ke upload karne ke thodi der baad ad upar aayega
        setTimeout(() => {
            adSlot.classList.add('active');
            console.log("Ad Revenue Slot: ACTIVE");
        }, 1200); 
    }
}