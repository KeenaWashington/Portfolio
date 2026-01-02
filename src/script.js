/*Coin stuff*/
const container = document.getElementById('coin-container');
const numberOfRings = 10;
const ringSize = 120;
const rings = [];
const spinningRings = new Set();
let spinningCount = 0;

const notification = document.createElement('a');
notification.href = "https://KeenaWashington.github.io/rrlevelup/index.html";
notification.target = "_blank";
notification.rel = "noreferrer";
notification.style.display = 'none';
notification.style.position = 'fixed';
notification.style.top = '50%';
notification.style.left = '50%';
notification.style.transform = 'translateX(-50%)';
notification.style.backgroundColor = '#a3a7f7';
notification.style.color = '#333447';
notification.style.padding = '15px 30px';
notification.style.borderRadius = '5px';
notification.style.zIndex = '1000';
notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
notification.textContent = '🎉 Congrats! Click to level up! 🎉';
document.body.appendChild(notification);

function isOverlapping(newX, newY) {
    for (const ring of rings) {
        const distance = Math.sqrt(
            Math.pow(newX - ring.x, 2) +
            Math.pow(newY - ring.y, 2)
        );
        if (distance < ringSize * 1.2) {
            return true;
        }
    }
    return false;
}

function findValidPosition(maxAttempts = 100) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = Math.random() * (window.innerWidth - ringSize);
        const y = Math.random() * (window.innerHeight - ringSize);

        if (!isOverlapping(x, y)) {
            return { x, y };
        }
    }
    return null;
}

for (let i = 0; i < numberOfRings; i++) {
    const position = findValidPosition();

    if (position) {
        const ring = document.createElement('div');
        ring.classList.add('coin-ring');

        ring.style.top = `${position.y}px`;
        ring.style.left = `${position.x}px`;

        ring.addEventListener('mouseenter', function() {
            this.classList.remove('spin-complete');
            this.classList.remove('spinning');
            void this.offsetWidth;
            this.classList.add('spinning');
            spinningRings.add(this);
            spinningCount = spinningRings.size;

            if (spinningCount === rings.length) {
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = `none`;
                }, 5000);
            }

            this.addEventListener('animationend', function() {
                this.classList.add('spin-complete');
                spinningRings.delete(this);
            }, {once: true});
        });

        rings.push({
            x: position.x,
            y: position.y
        });

        container.appendChild(ring);
    }

}
/*Banner*/
window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero');
    const textElement = hero.querySelector('.text');
    const heroRect = hero.getBoundingClientRect();

    if (heroRect.bottom <= textElement.offsetHeight) {
        textElement.classList.add('banner');
    }
    else if (heroRect.bottom >= textElement.offsetHeight){
        textElement.classList.remove('banner');
    }
});


/*Time Converter*/
function convertAndDisplayTimeRange() {

    const date = new Date();
    date.setHours(9, 0, 0);
    const startTime = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    date.setHours(17, 0, 0);
    const endTime = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    const localStartTime = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const localEndTime = endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    document.getElementById('timeRange').innerHTML =
        `${localStartTime} - ${localEndTime} in your current time zone (9AM-5PM EST)`;
}

convertAndDisplayTimeRange();
