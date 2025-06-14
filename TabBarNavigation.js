document.addEventListener('DOMContentLoaded', () => {
  console.log('TabBarNavigation.js: Carregado');
  
  const routes = {
    'index': 'index.html',
    'business': 'business.html',
    'pesquisa': 'pesquisa.html',
    'favoritos': 'favoritos.html',
    'login': 'login.html',
    'viagens-reservas': 'viagens-reservas.html'
  };
  
  const tabs = document.querySelectorAll('.tab-bar .tab');
  if (!tabs.length) {
    console.error('TabBarNavigation.js: Nenhuma aba .tab encontrada em .tab-bar');
    return;
  }
  
  console.log(`TabBarNavigation.js: Encontradas ${tabs.length} abas`);
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const sectionId = tab.getAttribute('data-section');
      console.log(`TabBarNavigation.js: Aba clicada: ${sectionId}`);
      if (routes[sectionId]) {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        console.log(`TabBarNavigation.js: Redirecionando para: ${routes[sectionId]}`);
        window.location.href = routes[sectionId];
      } else {
        console.error(`TabBarNavigation.js: Rota não encontrada: ${sectionId}`);
        alert('Página não encontrada.');
      }
    });
  });
});