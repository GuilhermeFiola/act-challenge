

# Act Digital Tech Test

Este projeto foi desenvolvido como parte de um desafio de programação.

A aplicação tem como objetivo principal a criação de serviços:
- Controlar o seu fluxo de caixa diário com os lançamentos de débitos e créditos
- Disponibilização do saldo diário consolidado

## Decisões Técnicas

Como decisão para linguagem de programação defini a utilização de TypeScript pois é uma linguagem moderna e tem a vantagem da identificação antecipada de erros e uma maior clareza no desenvolvimento e análise do código.

Além da definição da linguagem, preferi utilizar clean arch para dividir as responsabilidades no projeto,transformando entradas e saídas, possui camadas de aplicação e domínio para execução da lógica assim como a camada de infra. Os componentes possuem responsabilidades específicas e foram criados de maneira isolada para facilitar os testes do sistema.

Outra decisão foi a utilização do inglês para realização do desenvolvimento e mensagens do sistema.

Também são utilizados DTOs para controlar entradas e saídas de dados.

## Decisões Arquiteturais

Foram pedidos dois requisitos não funcionais e as decisões arquiteturais foram tomadas de forma a atender ambos.

- **Requisito de confiabilidade:** Em dias de picos, o serviço de consolidado diário recebe 500 requisições por segundos, com no máximo 5% de perda de requisições.

- **Requisito de tolerância a falhas:** O serviço de controle de lançamento não deve ficar indisponível se o sistema de consolidado diário cair.

O sistema foi dividido em duas APIs, uma voltada para as transações (transaction-api) e a outra voltada para a consolidação (consolidation-api). Com essa abordagem os sistemas ficam independentes, sendo que a queda de um não afeta a disponibilidade do outro. Essa decisão supre o requisito de tolerância a falhas.

Para suprir o requisito de confiabilidade utilizei uma fila para que toda a transação possa ser recebida pela API de consolidação. A fila tendo mensagens persistentes permitem que mesmo em caso de falha da mesma com que ela não perca mensagens já recebidas. Assim, a cada transação é criada uma mensagem na fila, a API de consolidação possui um serviço com um método único para atualizar o saldo diário e assim que atualiza o saldo também é atualizado um cache em memória. Dessa maneira as consultas não precisam ir até o banco de dados em todas as consultas sendo que o cache terá os valores atualizados. Com isso foi possível utilizar o Artillery com 500 requisições em 1 segundo e o sistema respondeu sem falhas.

Além disso a utilização da fila consegue combinar benefícios nos dois requisitos, sendo que mesmo que o sistema de consolidação caia, a fila continua a receber as movimentações sem problemas. Uma vez que o sistema de consolidação voltar a funcionar todas as mensagens na fila são processadas pela API e o saldo é atualizado.

Abaixo está o diagrama com o desenho arquitetural da solução assim como as tabelas criadas.

![Diagrama](/act-arch-diagram.jpg)

Alguns logs do Artillery requisitando o saldo diário pode ser encontrado no arquivo: [Artillery Load Test](./consolidation-load-test-result)

## Justificativa para o Uso de Frameworks ou Bibliotecas

A aplicação é construída para ser executada em um ambiente Node.js.

- **typescript**: Proporciona tipagem estática, reduzindo a probabilidade de erros em tempo de execução e melhorando a legibilidade do código.
- **jest**: Biblioteca para escrever testes e suporte a mocks, facilitando a verificação de chamadas de funções.
- **esLint**: Biblioteca para realizar a validação estática do código e formatação de arquivos em cima de regras definidas.
- **dotenv**: Biblioteca para realizar o controle de variáveis de ambiente.
- **express**: Framework web usado para construir APIs e aplicações web. Proporciona uma estrutura simplificada para lidar com rotas, middleware e respostas HTTP.
- **helmet**: Middleware para segurança em aplicações Express, adicionando headers de segurança HTTP para proteger contra ataques comuns.
- **sqlite**: Banco de dados SQL leve e autossuficiente, adequado para projetos de pequeno a médio porte e para desenvolvimento local, armazenando dados em um único arquivo.
- **uuid**:  Biblioteca para gerar identificadores únicos universais (UUIDs).
- **amqplib**: Biblioteca para comunicação com o RabbitMQ e outras plataformas AMQP, permitindo a criação e consumo de filas para troca de mensagens.
- **node-cache**: Biblioteca para cache em memória no lado do servidor, usada para armazenar dados temporariamente e melhorar a performance ao reduzir consultas repetidas.
- **tsyringe**: Biblioteca para injeção de dependência em TypeScript, facilitando o gerenciamento e a resolução de dependências. Foi utilizada especialmente devido o cache precisar ser singleton.
-  **proxyquire**: Biblioteca que permite substituir módulos dependentes durante testes, facilitandoa criação de mocks ou stubs para testes.
-   **mocha**: Framework de testes JavaScript que fornece uma estrutura para executar testes assíncronos e síncronos.
-   **sinon**: Biblioteca para criar spies, stubs e mocks em testes JavaScript. Permite monitorar e interceptar chamadas de função.
-   **chai**: Biblioteca de asserções que pode ser usada com qualquer framework de testes, incluindo Mocha.

## Instruções sobre Como Compilar e Executar o Projeto

**Ambiente de execução:**
- Para a execução desse projeto é recomendado utilizar o Docker. Como são utilizados tipos diferentes de recursos, inclusive uma fila de mensagens foi a melhor solução para uma execução limpa.
- Para a instalação do Docker recomendo acessar o link [Docker Install](https://docs.docker.com/engine/install/) e escolher a versão a ser utilizada dependendo do sistema operacional.

 **Utilizar o comando Docker Compose para subir os recursos**

Estando na raiz do projeto (local onde se encontra o arquivo `docker-compose.yml`, executar o comando abaixo:

   ```bash    
       
 docker compose up -d  
    
 ```   

Apenas aguardar até o console exibir as mensagens:

   ```bash  
   
  Listening on port 7000  
  Listening on port 7001 
  
  ```  

Como existe uma dependência do RabbitMQ, ambas as APIs consultam esse serviço para executarem.

Foram adicionados testes unitários e estes são executados em conjunto com o comando de build da aplicação ao rodar o Dockerfile de cada  API.

**Realização das chamadas HTTP**

Para a utilização do sistema é necessário realizar um processo simples de chamdas HTTP para realizar a inclusão de movimentações no sistema.

**API de Transações**

A API de transações controla a inserção dos movimentos e a verificação de todos os movimentos inseridos no sistema.

Para realizar esse processo basta realizar uma chamada HTTP como demonstrado abaixo:

```http request  

curl -X 'POST' \  
 'http://localhost:7000/api/v1/transaction' \ 
 -H 'accept: application/json' \ 
 -H 'Content-Type: application/json' \ 
 -d '{ "type": "D", "description": "Débito", "amount": 80, "date": "2024-11-05T00:00:00.000Z"}' 
  
```

Esta chamada realiza a inserção de uma transação do tipo Débito no valor de 80 reais para o dia 05/11/2024 com a descrição 'Débito'.

Caso o valor de `type` mude para `C`, será realizada uma transação de crédito.

Para verificar a transação inserida é necessário executar a chamada HTTP abaixo:

```http request  

curl -X 'GET' \  
'http://localhost:7000/api/v1/transaction' \  
-H 'accept: application/json'  

```  

Esta chamada retorna todos os movimentos inseridos.

Para facilitar a chamada das requisições foi incluído o Swagger no projeto, assim é possível realizar as chamadas de maneira mais simples com a verificação dos tipos de entrada e saída.

Para acessar o Swagger da Transaction API, basta acessar este [Transaction API Swagger](http://localhost:7000/api/docs) após a execução do sistema.

**API de Consolidações**

A API de consolidações recebe os movimentos incluídos pelas transações e realiza a consolidação dos dados de entrada e saída em uma tabela.

Após a inserção da transação na sua API, basta buscar pela consolidação deste dado na API de Consolidações utilizando a chamada HTTP como no exemplo abaixo:

```http request  

curl -X 'GET' \
  'http://localhost:7001/api/v1/consolidation/2024-11-05' \
  -H 'accept: application/json'
  
```
Este endpoint irá buscar a consolidação dos movimentos do dia 05/11/2024 e exibílos em um registro único com a data, valor das entradas, valor das saídas e valor líquido.

Para facilitar a chamada das requisições foi incluído o Swagger no projeto, assim é possível realizar as chamadas de maneira mais simples com a verificação dos tipos de entrada e saída.

Para acessar o Swagger da Consolidation API, basta acessar este [Consolidation API Swagger](http://localhost:7001/api/docs) após a execução do sistema.

## Notas Adicionais

- A intenção incial era utilizar apenas o Jest para realizar os testes, porém este estava falhando no momento de mockar alguns serviços, Tive que realizar a troca pro Mocha com Proxyquire, assim ajudando a resolver esse problema, porém perdi tempo nessa troca e consegui realizar apenas os testes nos serviços. A ideia final seria realizar em todos os arquivos e gerar um relatório de cobertura de testes.
- Como decisão evolutiva seria utilizado um sistema de Banco de Dados diferente e separado de cada uma das aplicações. Além disso usaria diversas APIs de Consolidação através de um orquestrador como Kubernetes para lidar com as muitas requisições e usaria Redis para centralizar o cache do sitema.
- Agradeço se puder passar o feedback para o recrutador, assim me ajuda a entender pontos de falha independente da continuação do processo.