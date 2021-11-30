let totalPrice; // variável que armazena o somatório dos preços do carrinho

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

const emptyCartClass = 'empty-cart';
function btnDisable() {
  const elem = document.getElementsByClassName(emptyCartClass)[0];
  elem.style.backgroundColor = 'grey';
}

function btnEnable() {
  const elem = document.getElementsByClassName(emptyCartClass)[0];
  elem.style.backgroundColor = 'coral';
}

/* função criada para atualizar o valor total do carrinho (Requisito 5) */
function updateCartValue() {
  totalPrice = 0;
  if (localStorage.length === 0) { // caso o localStorage esteja vazio, não há necessidade de somar valores
    document.getElementsByClassName('total-price')[0].innerHTML = '0.00'; // atualiza o valor total na tela para zero
    btnDisable();
    return;
  }
  btnEnable();
  const dadosLocais = JSON.parse(localStorage.getItem('dadosCarrinho')); // lê os produtos do Carrinho salvos no localStorage
  for (let i = 0; i < dadosLocais.length; i += 1) { // percorre todos os dados do carrinho e faz o somatório dos preços totais
    totalPrice += dadosLocais[i].salePrice;
  }
  if (totalPrice === 0) { // se o último produto for retirado do carrinho
    totalPrice = '0.00';
    btnDisable();
  }
  document.getElementsByClassName('total-price')[0].innerHTML = totalPrice; // atualiza o valor total na tela
}

function cartItemClickListener(event) {
  // obtém uma referência do item clicado no carrinho
  const item = event.target;
  /* remove o elemento do localStorage (Requisito 4) ----------------------*/
  const dadosLocais = JSON.parse(localStorage.getItem('dadosCarrinho')); // obtém o array de produtos do carrinho salvos no localStorage
  const nodes = Array.from(item.parentElement.children); // obtém um array com todos os item no carrinho na página HTML
  const id = nodes.indexOf(item); // obtém o índice do item clicado na lista do carrinho
  dadosLocais.splice(id, 1); // remove o item do carrinho no localStorage
  localStorage.setItem('dadosCarrinho', JSON.stringify(dadosLocais)); // atualiza o localStorage
  // remove o item do carrinho na página HTML
  item.remove();
  updateCartValue(); // Atualiza o valor total dos itens do carrinho (Requisito 5)
}

function createCartItemElement(sku, name, salePrice) {
  const li = document.createElement('li');
  li.className = 'cart__item tooltip';
  li.setAttribute('data-title', 'Clique para remover do carrinho');
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function showOverlay() {
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('loadingCart').style.display = 'block';
}

function hideOverlay() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('loadingCart').style.display = 'none';
}

function addItemLocalStorage(k, n, s) {
  if (localStorage.length === 0) localStorage.setItem('dadosCarrinho', '[]'); // caso o localStorage esteja vazio, precisamos criar o registro de dados
  const dadosLocais = JSON.parse(localStorage.getItem('dadosCarrinho')); // obtém o array de produtos do carrinho salvos no localStorage
  dadosLocais.push({ sku: k, name: n, salePrice: s }); // adiciona o novo produto ao array do carrinho
  localStorage.setItem('dadosCarrinho', JSON.stringify(dadosLocais)); // atualiza o localStorage
  updateCartValue(); // Atualiza o valor total dos itens do carrinho (Requisito 5)
}

function addItemCarrinho(item) {
  const k = item.id;
  const n = item.title;
  const s = item.price;
  const elem = document.getElementsByClassName('cart__items')[0];
  elem.appendChild(createCartItemElement(k, n, s)); // add o elemento li no cart
  // adiciona o elemento também ao localStorage (Requisito 4)
  addItemLocalStorage(k, n, s);
  hideOverlay();
}

/* função criada para retornar os dados de cada produto do ENDPOINT do mercadolivre (Requisito 2) */
function loadingItem(id) {
  const promisse = fetch(`https://api.mercadolibre.com/items/${id}`); // obtém um request ao ENDPOINT
  promisse.then((response) => // função anônima para receptar o sucesso do request
    response.json()) // extração do JSON da resposta, o qual retorna outra promisse
  .then((jsonData) => { // função anônima para receptar a resposta assíncrona do JSON com os dados do produto clicado
    // passa o array de dados JSON do produto para serem adicionados ao carrinho
    addItemCarrinho(jsonData); // adiciona o elemento ao carrinho 
  })
  .catch((response) => { // função anônima para receptar o erro do request
    alert(`Produto não encontrado. Erro ${response}`);
  })
  .finally(() => {
    hideOverlay(); // limpa a menssagem de 'loading'
  });
}

/* função criada para escutar os eventos de clique dos botões dos produtos da listagem (Requisito 2) */
function itemClickListener(event) {
  showOverlay();
  const id = getSkuFromProductItem(event.target.parentNode); // captura o id do item selecionado
  loadingItem(id);
}

function createProductItemElement(sku, name, image) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  const botao = createCustomElement('button', 'item__add', 'Adicionar ao carrinho!');
  // adicionei um evendo ao botão da listagem (não veio no exercício! precisei colocar!)
  botao.addEventListener('click', itemClickListener);
  section.appendChild(botao);
  return section;
}

/* função criada para receber os dados obtidos no ENDPOINT e construir a listagem dos produtos (Requisito 1) */
function buildListagem(dados) {
  // percorre cada um dos itens retornados pelo JSON e cria uma section para cada um deles
  for (let i = 0; i < dados.length; i += 1) {
    // obtém cada um dos componentes
    const section = createProductItemElement(dados[i].id, dados[i].title, dados[i].thumbnail);
    // adiciona dinamicamente os itens no DOM,especificamente dentro da section 'items'
    document.getElementsByClassName('items')[0].appendChild(section);
  }
}

/* função criada para retornar a lista de produtos do ENDPOINT do mercadolivre (Requisito 1) */
function loadingAllItems() {
  // cria um request usando a API fetch, para obter os dados JSON do ENDPOINT passado como parâmetro
  const promisse = fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador');
  promisse.then((response) => // função anônima para receptar o sucesso do request
    response.json()) // extração do JSON da resposta, o qual retorna outra promisse
  .then((jsonData) => // função anônima para receptar a resposta assíncrona do JSON com os dados dos produtos
    // invoca a função de contrução da listagem, passando o array de dados do JSON
    buildListagem(jsonData.results))
  .catch((response) => // função anônima para receptar o erro do request
    alert(`Nada encontrado. Erro ${response}`))
  .finally(() => { // função anônima para limpar a mensagem de 'loading', após a requisição ser resolvida
    document.getElementsByClassName('loading')[0].remove();
    document.getElementById('overlay').style.display = 'none';
  });
}

/* função criada para carregar os itens de carrinho possivelmente armazenados no localStorage (Requisito 4) -------- */
function carregaDadosCarrinho() {
  if (localStorage.length === 0) return; // caso o localStorage esteja vazio, não há necessidade de carregar dados 
  const dadosLocais = JSON.parse(localStorage.getItem('dadosCarrinho')); // lê os produtos do Carrinho salvos no localStorage
  for (let i = 0; i < dadosLocais.length; i += 1) { // percorre todos os dados do carrinho salvos no localStorage
    // extrai os dados de cada elemento do carrinho
    const k = dadosLocais[i].sku;
    const n = dadosLocais[i].name;
    const s = dadosLocais[i].salePrice;
    const li = createCartItemElement(k, n, s); // constrói o elemento 'li'
    document.getElementsByClassName('cart__items')[0].appendChild(li); // adiciona dinamicamente o elemento li no carrinho
  }
}

/* função criada para escutar os eventos de clique do botão de esvaziar carrinho (Requisito 6) */
function cleanCartListener() {
  // remove todos os produtos do carrinho na tela
  const item = document.getElementsByClassName('cart__items')[0];
  while (item.firstChild) {
    item.removeChild(item.firstChild);
  }
  localStorage.clear(); // remove todos os produtos do carrinho armazenados no localStorage
  updateCartValue(); // Atualiza o valor total dos itens do carrinho (Requisito 5)
}

window.onload = () => {
  document.getElementById('loadingCart').style.display = 'none';
  loadingAllItems(); // faz um request ao ENDPOINT para carregar os produtos (Requisito 1)
  carregaDadosCarrinho(); // carrega os dados do carrinho, salvos no localStorage
  const botaoEsvaziar = document.getElementsByClassName(emptyCartClass)[0]; // define o evento do botão de "esvaziar carrinho (Requisito 6)"
  botaoEsvaziar.addEventListener('click', cleanCartListener);
  updateCartValue(); // Atualiza o valor total dos itens do carrinho (Requisito 5)
};