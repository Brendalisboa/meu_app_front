/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  let url = 'http://127.0.0.1:5000/produtos';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.produtos.forEach(item => insertList(item.sku, item.nome, item.quantidade, item.valor));
      // Atualiza os totais após o carregamento inicial
      getInventoryTotal();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
getList();


/*
  --------------------------------------------------------------------------------------
  Função para colocar um item na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (inputSku, inputObject, inputQuantity, inputPrice) => {
  const formData = new FormData();
  formData.append('sku', inputSku);
  formData.append('nome', inputObject);
  formData.append('quantidade', inputQuantity);
  formData.append('valor', inputPrice);

  let url = 'http://127.0.0.1:5000/produto';
  return fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.message); });
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
      throw error;
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  parent.appendChild(span);
}


/*
  --------------------------------------------------------------------------------------
  Função para remover um item da lista de acordo com o click no botão close
  --------------------------------------------------------------------------------------
*/
const removeElement = () => {
  let close = document.getElementsByClassName("close");
  let i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const skuItem = div.getElementsByTagName('td')[0].innerHTML;
      if (confirm("Deseja remover?")) {
        div.remove();
        deleteItem(skuItem);
        alert("Removido!");
        // Atualiza os totais após a remoção
        getInventoryTotal();
      }
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteItem = (item) => {
  console.log(item);
  let url = 'http://127.0.0.1:5000/produto?sku=' + item;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com sku, nome, quantidade e valor 
  --------------------------------------------------------------------------------------
*/
const newItem = () => {
  let inputSku = document.getElementById("newSku").value;
  let inputObject = document.getElementById("newObject").value;
  let inputQuantity = document.getElementById("newQuantity").value;
  let inputPrice = document.getElementById("newPrice").value;

  if (inputSku === '') {
    alert("Insira o SKU!");
  } else if (inputObject === '') {
    alert("Insira o nome!");
  } else if (isNaN(inputQuantity) || isNaN(inputPrice)) {
    alert("Quantidade e valor precisam ser números!");
  } else if (inputQuantity <= 0 || inputPrice <= 0) {
    alert("Quantidade e valor devem ser maiores que zero!");
  } else {
    // Primeiro, faça o POST no servidor
    postItem(inputSku, inputObject, inputQuantity, inputPrice)
      .then(() => {
        // Se for bem-sucedido, adicione à lista na interface
        insertList(inputSku, inputObject, inputQuantity, inputPrice);
        alert("Item adicionado com sucesso!");
        // Atualiza os totais após a adição
        getInventoryTotal();
      })
      .catch((error) => {
        alert("Erro ao adicionar o item: " + error.message);
      });
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = (skuProduct, name, quantity, price) => {
  var item = [skuProduct, name, quantity, price];
  var table = document.getElementById('myTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    // Formata o valor para ser exibido em formato monetário
    cel.textContent = i === 3 ? `R$ ${parseFloat(item[i]).toFixed(2)}` : item[i];
  }
  insertButton(row.insertCell(-1));
  document.getElementById("newSku").value = "";
  document.getElementById("newObject").value = "";
  document.getElementById("newQuantity").value = "";
  document.getElementById("newPrice").value = "";

  removeElement();
}

/*
  --------------------------------------------------------------------------------------
  Função para obter o total de produtos e itens no inventário
  --------------------------------------------------------------------------------------
*/
function getInventoryTotal() {
  fetch('http://127.0.0.1:5000/produtos/total')
      .then(response => response.json())
      .then(data => {
          document.getElementById('totalProdutos').textContent = `Total de Produtos: ${data.total_produtos}`;
          document.getElementById('totalItens').textContent = `Total de Itens: ${data.total_itens}`;
      })
      .catch(error => console.error('Erro ao buscar total de produtos:', error));
      
}
