export function normalizeLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;

      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}