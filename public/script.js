let usuarioAtual = '';
let gastos = [];
let gastoEditandoIndex = null;

const usuarioInput = document.getElementById('usuario-input');
const btnCarregar = document.getElementById('btn-carregar');
const btnNovoGasto = document.getElementById('btn-novo-gasto');
const gastosContainer = document.getElementById('gastos-container');
const totalGastosDisplay = document.getElementById('total-gastos');
const gastosPagosDisplay = document.getElementById('gastos-pagos');
const gastosPendentesDisplay = document.getElementById('gastos-pendentes');
const totalDisplay = document.getElementById('total');
const painelInfo = document.getElementById('painel-info');

// Modal
const modal = document.getElementById('modal-edicao');
const inputNome = document.getElementById('input-nome');
const inputValor = document.getElementById('input-valor');
const inputData = document.getElementById('input-data');
const inputPago = document.getElementById('input-pago');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');

// Carrega dados do usuário ao clicar
btnCarregar.addEventListener('click', async () => {
  usuarioAtual = usuarioInput.value.trim().toLowerCase();
  if (!usuarioAtual) {
    alert('Digite o nome do usuário.');
    return;
  }
  const res = await fetch(`/dados/${usuarioAtual}`);
  gastos = await res.json();
  renderGastos();

  painelInfo.style.display = 'flex';
  gastosContainer.style.display = 'block';
  btnNovoGasto.disabled = false;
});

// Renderiza os gastos
function renderGastos() {
  gastosContainer.innerHTML = '';

  let total = 0;
  let totalPago = 0;

  gastos.forEach((gasto, index) => {
    total += gasto.valor;
    if (gasto.pago) totalPago += gasto.valor;
  });

  const gastosOrdenados = [...gastos].sort((a, b) => a.pago - b.pago);

  gastosOrdenados.forEach((gasto, index) => {
    const div = document.createElement('div');
    div.className = 'gasto';
    if (gasto.pago) {
      div.classList.add('pago');
    }

    div.innerHTML = `
      <span><strong>${gasto.nome}</strong> - R$ ${gasto.valor.toFixed(2)} - ${gasto.data}</span>
      <input type="checkbox" ${gasto.pago ? 'checked' : ''} onchange="togglePago(${index})" />
      <button onclick="abrirModalEdicao(${index})">✏️</button>
      <button onclick="excluirGasto(${index})">🗑️</button>
    `;

    gastosContainer.appendChild(div);
  });

  totalGastosDisplay.textContent = `Total de gastos: ${gastos.length}`;
  gastosPagosDisplay.textContent = `Pagos: ${gastos.filter(g => g.pago).length}`;
  gastosPendentesDisplay.textContent = `Pendentes: ${gastos.filter(g => !g.pago).length}`;
  totalDisplay.textContent = `Total geral: R$ ${total.toFixed(2)} | Total a pagar: R$ ${(total - totalPago).toFixed(2)}`;
}

// Salva os dados no backend
async function salvarGastos() {
  if (!usuarioAtual) return;
  await fetch(`/dados/${usuarioAtual}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gastos)
  });
}

// Adicionar novo gasto
btnNovoGasto.addEventListener('click', () => {
  abrirModalEdicao(null);
});

function abrirModalEdicao(index) {
  gastoEditandoIndex = index;
  if (index !== null) {
    const gasto = gastos[index];
    inputNome.value = gasto.nome;
    inputValor.value = gasto.valor;
    inputData.value = gasto.data;
    inputPago.checked = gasto.pago;
  } else {
    inputNome.value = '';
    inputValor.value = '';
    inputData.value = '';
    inputPago.checked = false;
  }
  modal.style.display = 'flex';
}

function fecharModal() {
  modal.style.display = 'none';
}

// Salvar ou editar gasto
btnSalvar.addEventListener('click', async () => {
  const nome = inputNome.value.trim();
  const valor = parseFloat(inputValor.value);
  const data = inputData.value;
  const pago = inputPago.checked;

  if (!nome || isNaN(valor) || valor < 0 || !data) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  const novoGasto = { nome, valor, data, pago };

  if (gastoEditandoIndex === null) {
    gastos.push(novoGasto);
  } else {
    gastos[gastoEditandoIndex] = novoGasto;
  }

  await salvarGastos();
  renderGastos();
  fecharModal();
});

btnCancelar.addEventListener('click', fecharModal);

function excluirGasto(index) {
  if (confirm('Deseja excluir este gasto?')) {
    gastos.splice(index, 1);
    salvarGastos();
    renderGastos();
  }
}

function togglePago(index) {
  gastos[index].pago = !gastos[index].pago;
  salvarGastos();
  renderGastos();
}

// Ao carregar a página
window.addEventListener('load', () => {
  painelInfo.style.display = 'none';
  gastosContainer.style.display = 'none';
  btnNovoGasto.disabled = true;
});
