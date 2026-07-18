export const handleRipple = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const diameter = Math.max(card.clientWidth, card.clientHeight);
  const radius = diameter / 2;

  // Create circle element
  const circle = document.createElement('span');
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;
  circle.className = 'ripple-circle';

  // Find or create ripple container inside the card
  let container = card.querySelector('.ripple-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'ripple-container';
    card.appendChild(container);
  }

  container.appendChild(circle);

  // Clean up
  setTimeout(() => {
    circle.remove();
    if (container.children.length === 0) {
      container.remove();
    }
  }, 600);
};
