// Only apply reveal animation if IntersectionObserver is supported
if ('IntersectionObserver' in window) {
  // Mark body so CSS knows JS is active
  document.body.classList.add('js-reveal-ready');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Animate proficiency bars inside revealed element
        entry.target.querySelectorAll('.bar-fill').forEach(bar => {
          bar.style.width = (parseFloat(bar.dataset.width) * 100) + '%';
          bar.classList.add('animated');
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

} else {
  // No observer support — just show everything immediately
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  document.querySelectorAll('.bar-fill').forEach(bar => {
    bar.style.width = (parseFloat(bar.dataset.width) * 100) + '%';
    bar.classList.add('animated');
  });
}

// Set initial bar widths collapsed (only when JS runs)
document.querySelectorAll('.bar-fill').forEach(bar => {
  bar.style.width = (parseFloat(bar.dataset.width) * 100) + '%';
  bar.style.transform = 'scaleX(0)';
});
