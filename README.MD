# 🗝️ Limbo Keys | v1.0

![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-brightgreen)
![Size](https://img.shields.io/badge/Tamanho-726KB-blue)

**Limbo Keys** é um minigame de memória e precisão baseado na mecânica final do nível "Limbo" de Geometry Dash. O projeto foi construído focando em máxima performance e baixo consumo de hardware, ideal para rodar até em máquinas mais modestas sem engasgar.

---

## 🎮 O Jogo

O objetivo é simples: **Focar.** As chaves iniciam um embaralhamento frenético na tela utilizando uma simulação de profundidade 3D em um ambiente 2D. Sua missão é rastrear a chave correta até o final do movimento e selecioná-la.

### ⚡ Diferenciais desta Versão
- **Ultra-Leve:** Diferente de builds padrão de Electron que pesam 200MB+, este projeto ocupa menos de 1MB.
- **Silent Launch:** O jogo inicia diretamente, sem abrir janelas chatas de terminal (CMD) em segundo plano.
- **Otimização:** Código limpo focado em processamento lógico eficiente.

---

## 💻 Pré-requisitos

Para rodar o jogo, você só precisa do motor **Node.js** instalado no seu sistema.

1.  **Download do Node.js:** [Clique aqui para baixar a versão recomendada (LTS)](https://nodejs.org/dist/v20.12.2/node-v20.12.2-x64.msi)
2.  **Site Oficial:** [nodejs.org](https://nodejs.org/)

---

## 🛠️ Como Instalar e Rodar

1.  **Baixe o Projeto:** Extraia a pasta `.zip` em qualquer lugar do seu computador.
2.  **Instale as Dependências (Opcional):** A `node_modules` não esta
      inclusa, abra o terminal na pasta e digite:
    ```bash
    npm install
    ```
3.  **Iniciar o Jogo:**
    - Basta dar dois cliques no atalho **LimboKeys** com
      simbolo de uma chave verde.
    - O jogo abrirá automaticamente após alguns segundos.

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem:** JavaScript (Node.js)
- **Framework:** Electron (para interface desktop)
- **Scripting:** VBScript (para execução oculta do terminal)
- **Matemática:** Cálculos de geometria para animação das chaves.

---

## 📌 Notas de Desenvolvimento

Este projeto foi desenvolvido com foco em contornar as limitações de hardware, provando que é possível criar ferramentas funcionais e divertidas sem a necessidade de frameworks pesados e instalações complexas.

> "Focus. 🔑🔑🔑🔑🔑🔑🔑🔑"