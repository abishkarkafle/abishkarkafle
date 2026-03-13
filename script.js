// Scroll reveal + proficiency bar animation
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Animate any bar fills inside the revealed element
      entry.target.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = (parseFloat(bar.dataset.width) * 100) + '%';
        bar.classList.add('animated');
      });
    }
  });
}, { threshold: 0.1 });

reveals.forEach(r => observer.observe(r));

// Set initial bar widths (collapsed) before animation triggers
document.querySelectorAll('.bar-fill').forEach(bar => {
  bar.style.width = (parseFloat(bar.dataset.width) * 100) + '%';
  bar.style.transform = 'scaleX(0)';
});
